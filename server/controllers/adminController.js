const User = require('../models/User');
const Goal = require('../models/Goal');
const SharedGoal = require('../models/SharedGoal');
const QuarterlyUpdate = require('../models/QuarterlyUpdate');
const AuditLog = require('../models/AuditLog');
const { calcOverallScore } = require('../utils/progressCalc');
const { auditLog } = require('../utils/auditLogger');
const { Parser } = require('json2csv');

// ── User management ────────────────────────────────────────────────────────

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { role, department, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const users = await User.find(filter).populate('manager_id', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/users  (admin creates user accounts)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, manager_id, department } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({ name, email, password, role, manager_id, department });
    await auditLog({ user_id: req.user._id, action: 'USER_CREATED', entity: 'User', entity_id: user._id, new_value: { name, email, role }, ip_address: req.ip });

    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const old = await User.findById(req.params.id);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await auditLog({ user_id: req.user._id, action: 'USER_UPDATED', entity: 'User', entity_id: user._id, old_value: old, new_value: user, ip_address: req.ip });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id  (soft delete)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await auditLog({ user_id: req.user._id, action: 'USER_DEACTIVATED', entity: 'User', entity_id: user._id, ip_address: req.ip });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
};

// ── Goal unlock ────────────────────────────────────────────────────────────

// PUT /api/admin/unlock/:goalId
const unlockGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const old_value = { status: goal.status, locked: goal.locked };
    goal.locked = false;
    goal.status = 'approved';
    await goal.save();

    await auditLog({ user_id: req.user._id, action: 'GOAL_UNLOCKED', entity: 'Goal', entity_id: goal._id, old_value, new_value: { status: 'approved', locked: false }, ip_address: req.ip });
    res.json({ success: true, message: 'Goal unlocked', goal });
  } catch (err) {
    next(err);
  }
};

// ── Shared goals ───────────────────────────────────────────────────────────

// POST /api/admin/shared-goals
const createSharedGoal = async (req, res, next) => {
  try {
    const { title, description, thrust_area, uom_type, target, deadline, quarter, employee_ids } = req.body;

    const sharedGoal = await SharedGoal.create({
      title, description, thrust_area, uom_type, target, deadline, quarter,
      owner_id: req.user._id,
      linked_employee_ids: employee_ids,
    });

    // Push a read-only copy of this goal to each linked employee
    const goalDocs = employee_ids.map(emp_id => ({
      employee_id: emp_id,
      title, description, thrust_area, uom_type, target,
      weightage: 10,           // employee can adjust weightage
      quarter, deadline,
      status: 'draft',
      shared_goal_id: sharedGoal._id,
      is_read_only_title: true,
      is_read_only_target: true,
    }));
    await Goal.insertMany(goalDocs);

    res.status(201).json({ success: true, sharedGoal });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/shared-goals
const getSharedGoals = async (req, res, next) => {
  try {
    const goals = await SharedGoal.find().populate('owner_id', 'name').populate('linked_employee_ids', 'name');
    res.json({ success: true, goals });
  } catch (err) {
    next(err);
  }
};

// ── Analytics / reports ────────────────────────────────────────────────────

// GET /api/admin/reports?quarter=Q1-2025
const getReports = async (req, res, next) => {
  try {
    const { quarter } = req.query;
    const goalFilter = quarter ? { quarter } : {};

    const [totalUsers, totalGoals, goalsByStatus, updates] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Goal.countDocuments(goalFilter),
      Goal.aggregate([
        { $match: goalFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      QuarterlyUpdate.find().populate({ path: 'goal_id', match: goalFilter }),
    ]);

    const validUpdates = updates.filter(u => u.goal_id);
    const avgProgress = validUpdates.length
      ? Math.round(validUpdates.reduce((s, u) => s + u.progress_score, 0) / validUpdates.length)
      : 0;

    res.json({
      success: true,
      summary: {
        totalUsers,
        totalGoals,
        avgProgress,
        goalsByStatus: Object.fromEntries(goalsByStatus.map(g => [g._id, g.count])),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/export?quarter=Q1-2025
const exportCSV = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.quarter) filter.quarter = req.query.quarter;

    const goals = await Goal.find(filter)
      .populate('employee_id', 'name email department')
      .lean();

    const rows = goals.map(g => ({
      employee_name: g.employee_id?.name,
      email: g.employee_id?.email,
      department: g.employee_id?.department,
      quarter: g.quarter,
      title: g.title,
      thrust_area: g.thrust_area,
      uom_type: g.uom_type,
      target: g.target,
      weightage: g.weightage,
      status: g.status,
    }));

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment(`goals-export-${req.query.quarter || 'all'}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/audit-logs?limit=50&skip=0
const getAuditLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const logs = await AuditLog.find()
      .populate('user_id', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();
    res.json({ success: true, logs, total });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers, createUser, updateUser, deleteUser,
  unlockGoal,
  createSharedGoal, getSharedGoals,
  getReports, exportCSV, getAuditLogs,
};
