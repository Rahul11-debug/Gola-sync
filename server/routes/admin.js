const express = require('express');
const router = express.Router();
const {
  getUsers, createUser, updateUser, deleteUser,
  unlockGoal,
  createSharedGoal, getSharedGoals,
  getReports, exportCSV, getAuditLogs,
} = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(verifyToken, requireRole('admin'));

router.get('/users',          getUsers);
router.post('/users',         createUser);
router.put('/users/:id',      updateUser);
router.delete('/users/:id',   deleteUser);

router.put('/unlock/:goalId', unlockGoal);

router.post('/shared-goals',  createSharedGoal);
router.get('/shared-goals',   getSharedGoals);

router.get('/reports',        getReports);
router.get('/export',         exportCSV);
router.get('/audit-logs',     getAuditLogs);

module.exports = router;
