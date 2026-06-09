const router = require('express').Router();
const ctrl = require('../controllers/disposisiController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/stats', verifyToken, ctrl.getStats);
router.get('/', verifyToken, ctrl.getAll);
router.post('/', verifyToken, checkRole('admin', 'operator'), ctrl.create);
router.put('/:id/status', verifyToken, ctrl.updateStatus);
router.put('/:id/approve', verifyToken, (req, res, next) => {
  req.body.status = 'diterima';
  return ctrl.updateStatus(req, res, next);
});
router.put('/:id/reject', verifyToken, (req, res, next) => {
  req.body.status = 'ditolak';
  return ctrl.updateStatus(req, res, next);
});
router.put('/:id/selesai', verifyToken, (req, res, next) => {
  req.body.status = 'selesai';
  return ctrl.updateStatus(req, res, next);
});

module.exports = router;
