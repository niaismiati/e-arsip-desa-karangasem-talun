const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/register', verifyToken, checkRole(['admin']), authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;

