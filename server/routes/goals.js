const express = require('express');
const router = express.Router();
const {
  createGoal, getMyGoals, getGoal, updateGoal,
  deleteGoal, submitGoals, upsertQuarterlyUpdate, getQuarterlyUpdates,
} = require('../controllers/goalController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(verifyToken);

router.get('/my', getMyGoals);
router.post('/submit', requireRole('employee'), submitGoals);
router.post('/', requireRole('employee'), createGoal);
router.get('/:id', getGoal);
router.put('/:id', requireRole('employee'), updateGoal);
router.delete('/:id', requireRole('employee'), deleteGoal);
router.post('/:id/quarterly', requireRole('employee'), upsertQuarterlyUpdate);
router.get('/:id/quarterly', getQuarterlyUpdates);

module.exports = router;
