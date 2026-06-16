const express = require('express');
const router = express.Router();
const disposisiController = require('../controllers/disposisiController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, disposisiController.getAll);
router.get('/:id', verifyToken, disposisiController.getById);
router.post('/', verifyToken, checkRole(['operator']), disposisiController.create);
router.put('/:id', verifyToken, checkRole(['operator']), disposisiController.update);
router.patch('/:id/approve', verifyToken, checkRole(['kades']), disposisiController.approve);
router.patch('/:id/reject', verifyToken, checkRole(['kades']), disposisiController.reject);
router.patch('/:id/selesai', verifyToken, checkRole(['admin']), disposisiController.selesai);
router.delete('/:id', verifyToken, checkRole(['admin']), disposisiController.delete);

module.exports = router;

