const clients = new Map();
let clientCounter = 0;

function addClient(userId, res) {
  const id = ++clientCounter;
  clients.set(id, { userId, res });
  res.on('close', () => {
    clients.delete(id);
  });
}

function broadcast(event, payload) {
  const data = JSON.stringify(payload || {});
  for (const [id, client] of clients) {
    try {
      client.res.write(`event: ${event}\n`);
      client.res.write(`data: ${data}\n\n`);
    } catch {
      clients.delete(id);
    }
  }
}

const keepaliveInterval = setInterval(() => {
  for (const [id, client] of clients) {
    try {
      client.res.write(': keepalive\n\n');
    } catch {
      clients.delete(id);
    }
  }
}, 30000);

if (keepaliveInterval.unref) keepaliveInterval.unref();

module.exports = { addClient, broadcast };
