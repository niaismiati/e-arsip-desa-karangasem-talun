const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, checkRole(['admin', 'operator', 'kades']), userController.getAllUsers);
router.get('/:id', verifyToken, checkRole(['admin', 'operator', 'kades']), userController.getUserById);
router.post('/', verifyToken, checkRole(['admin']), userController.createUser);
router.put('/:id', verifyToken, checkRole(['admin']), userController.updateUser);
router.delete('/:id', verifyToken, checkRole(['admin']), userController.deleteUser);
router.patch('/:id/password', verifyToken, checkRole(['admin']), userController.changePassword);
router.patch('/:id/toggle-active', verifyToken, checkRole(['admin']), userController.toggleActive);

module.exports = router;
