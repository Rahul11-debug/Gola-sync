const Goal = require('../models/Goal');
const User = require('../models/User');
const QuarterlyUpdate = require('../models/QuarterlyUpdate');
const ManagerFeedback = require('../models/ManagerFeedback');
const { auditLog } = require('../utils/auditLogger');
const { calcOverallScore } = require('../utils/progressCalc');

// GET /api/manager/team?quarter=Q1-2025
const getTeam = async (req, res, next) => {
  try {
    const { quarter } = req.query;
    const employees = await User.find({ manager_id: req.user._id, isActive: true });

    const teamData = await Promise.all(employees.map(async (emp) => {
      const goalsFilter = { employee_id: emp._id };
      if (quarter) goalsFilter.quarter = quarter;

      const goals = await Goal.find(goalsFilter);
      const updates = await QuarterlyUpdate.find({ goal_id: { $in: goals.map(g => g._id) } });

      // Map progress per goal
      const goalScores = goals.map(g => {
        const upd = updates.find(u => u.goal_id.toString() === g._id.toString());
        return { weightage: g.weightage, progress_score: upd?.progress_score || 0 };
      });

      return {
        employee: { _id: emp._id, name: emp.name, email: emp.email, department: emp.department },
        total_goals: goals.length,
        pending_approval: goals.filter(g => g.status === 'submitted').length,
        overall_score: calcOverallScore(goalScores),
        goals_status: {
          draft: goals.filter(g => g.status === 'draft').length,
          submitted: goals.filter(g => g.status === 'submitted').length,
          approved: goals.filter(g => g.status === 'approved').length,
          locked: goals.filter(g => g.status === 'locked').length,
        },
      };
    }));

    res.json({ success: true, team: teamData });
  } catch (err) {
    next(err);
  }
};

// GET /api/manager/pending?quarter=Q1-2025
const getPendingApprovals = async (req, res, next) => {
  try {
    const employees = await User.find({ manager_id: req.user._id }, '_id');
    const employeeIds = employees.map(e => e._id);

    const filter = { employee_id: { $in: employeeIds }, status: 'submitted' };
    if (req.query.quarter) filter.quarter = req.query.quarter;

    const goals = await Goal.find(filter).populate('employee_id', 'name email department');
    res.json({ success: true, goals });
  } catch (err) {
    next(err);
  }
};

// GET /api/manager/employee/:id?quarter=Q1-2025
const getEmployeeDetail = async (req, res, next) => {
  try {
    const emp = await User.findOne({ _id: req.params.id, manager_id: req.user._id });
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found in your team' });

    const filter = { employee_id: emp._id };
    if (req.query.quarter) filter.quarter = req.query.quarter;

    const goals = await Goal.find(filter);
    const updates = await QuarterlyUpdate.find({ goal_id: { $in: goals.map(g => g._id) } });
    const feedbacks = await ManagerFeedback.find({ employee_id: emp._id }).sort({ createdAt: -1 });

    res.json({ success: true, employee: emp, goals, updates, feedbacks });
  } catch (err) {
    next(err);
  }
};

// PUT /api/manager/goals/:id  (inline edit target/weightage before approval)
const editGoal = async (req, res, next) => {
  try {
    const employees = await User.find({ manager_id: req.user._id }, '_id');
    const empIds = employees.map(e => e._id.toString());

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (!empIds.includes(goal.employee_id.toString()))
      return res.status(403).json({ success: false, message: 'Not your team member' });
    if (!['submitted', 'under_review'].includes(goal.status))
      return res.status(400).json({ success: false, message: 'Goal cannot be edited in current status' });

    const old_value = goal.toObject();
    const { target, weightage, description } = req.body;
    if (target !== undefined) goal.target = target;
    if (weightage !== undefined) goal.weightage = weightage;
    if (description !== undefined) goal.description = description;
    goal.status = 'under_review';

    await goal.save();
    await auditLog({ user_id: req.user._id, action: 'MANAGER_GOAL_EDITED', entity: 'Goal', entity_id: goal._id, old_value, new_value: goal, ip_address: req.ip });

    res.json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

// PUT /api/manager/approve/:id
const approveGoal = async (req, res, next) => {
  try {
    const employees = await User.find({ manager_id: req.user._id }, '_id');
    const empIds = employees.map(e => e._id.toString());

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (!empIds.includes(goal.employee_id.toString()))
      return res.status(403).json({ success: false, message: 'Not your team member' });
    if (!['submitted', 'under_review'].includes(goal.status))
      return res.status(400).json({ success: false, message: 'Goal is not pending approval' });

    goal.status = 'locked';
    goal.locked = true;
    await goal.save();

    await auditLog({ user_id: req.user._id, action: 'GOAL_APPROVED', entity: 'Goal', entity_id: goal._id, old_value: { status: 'submitted' }, new_value: { status: 'locked' }, ip_address: req.ip });

    res.json({ success: true, message: 'Goal approved and locked', goal });
  } catch (err) {
    next(err);
  }
};

// PUT /api/manager/reject/:id
const rejectGoal = async (req, res, next) => {
  try {
    const employees = await User.find({ manager_id: req.user._id }, '_id');
    const empIds = employees.map(e => e._id.toString());

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    if (!empIds.includes(goal.employee_id.toString()))
      return res.status(403).json({ success: false, message: 'Not your team member' });

    goal.status = 'rejected';
    goal.rejection_reason = req.body.reason || '';
    await goal.save();

    await auditLog({ user_id: req.user._id, action: 'GOAL_REJECTED', entity: 'Goal', entity_id: goal._id, new_value: { reason: goal.rejection_reason }, ip_address: req.ip });

    res.json({ success: true, message: 'Goal rejected', goal });
  } catch (err) {
    next(err);
  }
};

// POST /api/manager/checkin
const addCheckIn = async (req, res, next) => {
  try {
    const { employee_id, quarter, comment, rating } = req.body;

    // Verify this employee is in the manager's team
    const emp = await User.findOne({ _id: employee_id, manager_id: req.user._id });
    if (!emp) return res.status(403).json({ success: false, message: 'Not your team member' });

    const feedback = await ManagerFeedback.create({
      employee_id, manager_id: req.user._id, quarter, comment, rating,
    });

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTeam, getPendingApprovals, getEmployeeDetail,
  editGoal, approveGoal, rejectGoal, addCheckIn,
};
