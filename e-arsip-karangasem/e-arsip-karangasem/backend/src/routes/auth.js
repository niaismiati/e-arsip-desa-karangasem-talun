const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', ctrl.login);
router.post('/register', ctrl.register);
router.get('/profile', verifyToken, ctrl.getProfile);
router.put('/change-password', verifyToken, ctrl.changePassword);

module.exports = router;
