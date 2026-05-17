const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/login', login);
router.post('/register', verifyToken, requireRole('admin'), register); // admin-only signup
router.get('/me', verifyToken, getMe);

module.exports = router;
