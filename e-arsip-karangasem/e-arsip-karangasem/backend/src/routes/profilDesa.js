const router = require('express').Router();
const upload = require('../middleware/upload');
const ctrl = require('../controllers/profilDesaController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, ctrl.getProfil);
router.put('/', verifyToken, checkRole('admin'), upload.single('logo'), ctrl.updateProfil);

module.exports = router;
