const express = require('express');
const router = express.Router();
const klasifikasiController = require('../controllers/klasifikasiController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, checkRole(['admin', 'operator', 'kades']), klasifikasiController.getAll);
router.get('/:id', verifyToken, checkRole(['admin', 'operator', 'kades']), klasifikasiController.getById);
router.post('/', verifyToken, checkRole(['admin', 'operator']), klasifikasiController.create);
router.put('/:id', verifyToken, checkRole(['admin', 'operator']), klasifikasiController.update);
router.delete('/:id', verifyToken, checkRole(['admin', 'operator']), klasifikasiController.delete);

module.exports = router;

