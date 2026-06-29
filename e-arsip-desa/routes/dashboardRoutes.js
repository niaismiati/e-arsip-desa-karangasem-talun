const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/stats', verifyToken, checkRole(['admin', 'kades', 'operator']), dashboardController.getStats);
router.get('/chart', verifyToken, checkRole(['admin', 'kades', 'operator']), dashboardController.getChartData);
router.get('/recent-letters', verifyToken, checkRole(['admin', 'kades', 'operator']), dashboardController.getRecentLetters);
router.get('/pending-disposisi', verifyToken, checkRole(['admin', 'kades', 'operator']), dashboardController.getPendingDisposisi);
router.get('/klasifikasi-summary', verifyToken, checkRole(['admin', 'kades', 'operator']), dashboardController.getKlasifikasiSummary);
router.get('/aktivitas', verifyToken, checkRole(['admin', 'kades', 'operator']), dashboardController.getAktivitas);

module.exports = router;

