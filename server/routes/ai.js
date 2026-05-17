const express = require('express');
const router = express.Router();
const { generateSmartGoal, generatePerformanceSummary, generateRiskReport, chat } = require('../controllers/aiController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/smart-goal',          requireRole('employee', 'manager', 'admin'), generateSmartGoal);
router.post('/performance-summary', requireRole('manager', 'admin'), generatePerformanceSummary);
router.post('/risk-report',         requireRole('manager', 'admin'), generateRiskReport);
router.post('/chat',                chat);

module.exports = router;
