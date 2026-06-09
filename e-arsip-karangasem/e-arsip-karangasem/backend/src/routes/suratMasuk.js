const router = require('express').Router();
const ctrl = require('../controllers/suratMasukController');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/stats', verifyToken, ctrl.getStats);
router.get('/terbaru', verifyToken, ctrl.getTerbaru);
router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, checkRole('admin', 'operator'), upload.single('lampiran'), ctrl.create);
router.put('/:id', verifyToken, checkRole('admin', 'operator'), upload.single('lampiran'), ctrl.update);
router.delete('/:id', verifyToken, checkRole('admin'), ctrl.delete);

module.exports = router;
