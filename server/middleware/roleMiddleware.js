// Usage: router.get('/admin-only', verifyToken, requireRole('admin'), handler)
// Usage: router.get('/mgr-or-admin', verifyToken, requireRole('manager', 'admin'), handler)

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}`,
    });
  }
  next();
};

module.exports = { requireRole };
