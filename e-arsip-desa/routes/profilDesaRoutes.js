const express = require('express');
const router = express.Router();
const profilDesaController = require('../controllers/profilDesaController');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', verifyToken, checkRole(['admin', 'operator', 'kades']), profilDesaController.getProfil);
router.put('/', verifyToken, checkRole(['admin']), upload.single('logo'), profilDesaController.updateProfil);
router.get('/format-nomor', verifyToken, checkRole(['admin', 'operator', 'kades']), profilDesaController.getFormatNomor);

module.exports = router;

