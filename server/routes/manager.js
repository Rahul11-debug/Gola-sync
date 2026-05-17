const express = require('express');
const router = express.Router();
const {
  getTeam, getPendingApprovals, getEmployeeDetail,
  editGoal, approveGoal, rejectGoal, addCheckIn,
} = require('../controllers/managerController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(verifyToken, requireRole('manager', 'admin'));

router.get('/team',              getTeam);
router.get('/pending',           getPendingApprovals);
router.get('/employee/:id',      getEmployeeDetail);
router.put('/goals/:id',         editGoal);
router.put('/approve/:id',       approveGoal);
router.put('/reject/:id',        rejectGoal);
router.post('/checkin',          addCheckIn);

module.exports = router;
