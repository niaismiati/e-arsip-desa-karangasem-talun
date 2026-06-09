const router = require('express').Router();
const ctrl = require('../controllers/laporanController');
const { verifyToken } = require('../middleware/auth');

router.get('/dashboard', verifyToken, ctrl.getDashboard);
router.get('/grafik', verifyToken, ctrl.getGrafik);
router.get('/per-klasifikasi', verifyToken, ctrl.getPerKlasifikasi);
router.get('/rekap', verifyToken, ctrl.getRekap);
router.get('/statistik-bulanan', verifyToken, ctrl.getStatistikBulanan);

module.exports = router;
