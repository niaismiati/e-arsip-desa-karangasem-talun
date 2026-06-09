const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/rekap', verifyToken, checkRole(['admin', 'kades', 'operator']), laporanController.getRekap);
router.get('/statistik-bulanan', verifyToken, checkRole(['admin', 'kades', 'operator']), laporanController.getStatistikBulanan);
router.get('/grafik', verifyToken, checkRole(['admin', 'kades', 'operator']), dashboardController.getChartData);

module.exports = router;

