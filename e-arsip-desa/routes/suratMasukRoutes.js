const express = require('express');
const router = express.Router();
const suratMasukController = require('../controllers/suratMasukController');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', verifyToken, checkRole(['admin', 'operator', 'kades']), suratMasukController.getAll);
router.get('/:id', verifyToken, suratMasukController.getById);
router.post('/', verifyToken, checkRole(['admin', 'operator']), upload.single('lampiran'), suratMasukController.create);
router.put('/:id', verifyToken, checkRole(['admin', 'operator']), upload.single('lampiran'), suratMasukController.update);
router.delete('/:id', verifyToken, checkRole(['admin', 'operator']), suratMasukController.delete);

module.exports = router;

