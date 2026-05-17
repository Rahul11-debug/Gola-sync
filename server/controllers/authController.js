const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auditLog } = require('../utils/auditLogger');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email, isActive: true }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user._id);
    user.password = undefined;

    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register  (admin only — called from admin controller too)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, manager_id, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({ name, email, password, role, manager_id, department });

    await auditLog({
      user_id: req.user?._id || user._id,
      action: 'USER_CREATED',
      entity: 'User',
      entity_id: user._id,
      new_value: { name, email, role },
      ip_address: req.ip,
    });

    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { login, register, getMe };
