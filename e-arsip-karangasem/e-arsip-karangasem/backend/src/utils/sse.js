const clients = new Set();

function addClient(res) {
  // set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  clients.add(res);
  reqClose(res);
}

function reqClose(res) {
  res.on('close', () => {
    clients.delete(res);
  });
}

function broadcast(event, payload) {
  const data = JSON.stringify(payload || {});
  for (const res of clients) {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${data}\n\n`);
    } catch (e) {
      clients.delete(res);
    }
  }
}

module.exports = { addClient, broadcast };
