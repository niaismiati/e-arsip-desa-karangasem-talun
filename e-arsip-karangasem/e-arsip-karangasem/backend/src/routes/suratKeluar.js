// suratKeluar.js
const router1 = require('express').Router();
const ctrl1 = require('../controllers/suratKeluarController');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router1.get('/stats', verifyToken, ctrl1.getStats);
router1.get('/', verifyToken, ctrl1.getAll);
router1.get('/:id', verifyToken, ctrl1.getById);
router1.post('/', verifyToken, checkRole('admin', 'operator'), upload.single('lampiran'), ctrl1.create);
router1.put('/:id', verifyToken, checkRole('admin', 'operator'), upload.single('lampiran'), ctrl1.update);
router1.delete('/:id', verifyToken, checkRole('admin'), ctrl1.delete);

module.exports = router1;
