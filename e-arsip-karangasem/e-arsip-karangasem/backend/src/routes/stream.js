const router = require('express').Router();
const { addClient } = require('../utils/sse');

router.get('/', (req, res) => {
  // Simple SSE endpoint
  addClient(res);
});

module.exports = router;
