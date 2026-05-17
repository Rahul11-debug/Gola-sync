const Goal = require('../models/Goal');
const QuarterlyUpdate = require('../models/QuarterlyUpdate');
const { calcProgress } = require('../utils/progressCalc');
const { auditLog } = require('../utils/auditLogger');

// ── Helpers ────────────────────────────────────────────────────────────────

async function validateGoalSheet(employee_id, quarter, excludeId = null) {
  const query = { employee_id, quarter, status: { $in: ['draft', 'submitted'] } };
  if (excludeId) query._id = { $ne: excludeId };
  const goals = await Goal.find(query);
  return goals;
}

// ── Employee: Create goal (draft) ──────────────────────────────────────────
// POST /api/goals
const createGoal = async (req, res, next) => {
  try {
    const { title, description, thrust_area, uom_type, target, weightage, quarter, deadline } = req.body;
    const employee_id = req.user._id;

    // Check max 8 goals per quarter
    const existing = await Goal.find({
      employee_id,
      quarter,
      status: { $ne: 'rejected' },
    });
    if (existing.length >= 8)
      return res.status(400).json({ success: false, message: 'Maximum 8 goals allowed per quarter' });

    if (weightage < 10)
      return res.status(400).json({ success: false, message: 'Minimum weightage per goal is 10%' });

    const goal = await Goal.create({
      employee_id, title, description, thrust_area,
      uom_type, target, weightage, quarter, deadline,
    });

    await auditLog({ user_id: employee_id, action: 'GOAL_CREATED', entity: 'Goal', entity_id: goal._id, new_value: goal, ip_address: req.ip });

    res.status(201).json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

// GET /api/goals/my?quarter=Q1-2025
const getMyGoals = async (req, res, next) => {
  try {
    const filter = { employee_id: req.user._id };
    if (req.query.quarter) filter.quarter = req.query.quarter;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (err) {
    next(err);
  }
};

// GET /api/goals/:id
const getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, employee_id: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

// PUT /api/goals/:id  (only drafts)
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, employee_id: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (goal.status !== 'draft')
      return res.status(400).json({ success: false, message: 'Only draft goals can be edited' });
    if (goal.locked)
      return res.status(400).json({ success: false, message: 'Goal is locked' });

    const allowed = ['title', 'description', 'thrust_area', 'uom_type', 'target', 'weightage', 'deadline'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        // Shared goals: title and target are read-only for linked employees
        if (goal.is_read_only_title && field === 'title') return;
        if (goal.is_read_only_target && field === 'target') return;
        goal[field] = req.body[field];
      }
    });

    const old_value = goal.toObject();
    await goal.save();

    await auditLog({ user_id: req.user._id, action: 'GOAL_UPDATED', entity: 'Goal', entity_id: goal._id, old_value, new_value: goal, ip_address: req.ip });

    res.json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/goals/:id  (only drafts)
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, employee_id: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (goal.status !== 'draft')
      return res.status(400).json({ success: false, message: 'Only draft goals can be deleted' });

    await goal.deleteOne();
    await auditLog({ user_id: req.user._id, action: 'GOAL_DELETED', entity: 'Goal', entity_id: goal._id, ip_address: req.ip });

    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/goals/submit  (submit all drafts for a quarter)
const submitGoals = async (req, res, next) => {
  try {
    const { quarter } = req.body;
    const employee_id = req.user._id;

    const drafts = await Goal.find({ employee_id, quarter, status: 'draft' });

    if (!drafts.length)
      return res.status(400).json({ success: false, message: 'No draft goals found for this quarter' });

    // Validation rules
    if (drafts.length > 8)
      return res.status(400).json({ success: false, message: 'Maximum 8 goals allowed' });

    const belowMin = drafts.find(g => g.weightage < 10);
    if (belowMin)
      return res.status(400).json({ success: false, message: `Goal "${belowMin.title}" has weightage below 10%` });

    const total = drafts.reduce((sum, g) => sum + g.weightage, 0);
    if (total !== 100)
      return res.status(400).json({ success: false, message: `Total weightage is ${total}%. Must be exactly 100%` });

    // Update all drafts to submitted
    await Goal.updateMany(
      { employee_id, quarter, status: 'draft' },
      { $set: { status: 'submitted' } }
    );

    await auditLog({ user_id: employee_id, action: 'GOALS_SUBMITTED', entity: 'Goal', new_value: { quarter, count: drafts.length }, ip_address: req.ip });

    res.json({ success: true, message: `${drafts.length} goals submitted successfully` });
  } catch (err) {
    next(err);
  }
};

// POST /api/goals/:id/quarterly  (add or update quarterly achievement)
const upsertQuarterlyUpdate = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, employee_id: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (!['approved', 'locked'].includes(goal.status))
      return res.status(400).json({ success: false, message: 'Goal must be approved before updating progress' });

    const { quarter, planned, actual, status, notes, completion_date } = req.body;

    const progress_score = calcProgress(
      goal.uom_type,
      goal.target,
      actual,
      goal.deadline,
      completion_date,
    );

    const update = await QuarterlyUpdate.findOneAndUpdate(
      { goal_id: goal._id, quarter },
      { planned, actual, status, notes, completion_date, progress_score },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await auditLog({ user_id: req.user._id, action: 'QUARTERLY_UPDATED', entity: 'QuarterlyUpdate', entity_id: update._id, new_value: update, ip_address: req.ip });

    res.json({ success: true, update });
  } catch (err) {
    next(err);
  }
};

// GET /api/goals/:id/quarterly  (get all quarterly updates for a goal)
const getQuarterlyUpdates = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, employee_id: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const updates = await QuarterlyUpdate.find({ goal_id: goal._id }).sort({ quarter: 1 });
    res.json({ success: true, updates });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGoal, getMyGoals, getGoal, updateGoal,
  deleteGoal, submitGoals, upsertQuarterlyUpdate, getQuarterlyUpdates,
};
