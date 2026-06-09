const router = require('express').Router();
const ctrl = require('../controllers/klasifikasiController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/ringkasan', verifyToken, ctrl.getRingkasan);
router.get('/', verifyToken, ctrl.getAll);
router.post('/', verifyToken, checkRole('admin'), ctrl.create);
router.put('/:id', verifyToken, checkRole('admin'), ctrl.update);
router.delete('/:id', verifyToken, checkRole('admin'), ctrl.delete);

module.exports = router;
