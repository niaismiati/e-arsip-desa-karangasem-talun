const router = require('express').Router();
const ctrl = require('../controllers/penggunaController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, checkRole('admin'), ctrl.getAll);
router.post('/', verifyToken, checkRole('admin'), ctrl.create);
router.put('/:id', verifyToken, checkRole('admin'), ctrl.update);
router.put('/:id/toggle-active', verifyToken, checkRole('admin'), ctrl.toggleActive);
router.delete('/:id', verifyToken, checkRole('admin'), ctrl.delete);

module.exports = router;
