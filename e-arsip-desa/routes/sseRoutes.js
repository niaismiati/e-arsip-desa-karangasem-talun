const express = require('express');
const jwt = require('jsonwebtoken');
const { addClient } = require('../utils/sse');
const { JWT_SECRET } = require('../config/jwt');

const router = express.Router();

router.get('/stream', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.query.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    addClient(decoded.id, res);
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
