/**
 * Realtime Event Broadcaster Service
 * Implements lightweight, robust Server-Sent Events (SSE) and WebSockets event bus
 * to push live order status, store dashboard updates, and rider location tracking.
 */

// Connected SSE clients
const clients = new Set();

/**
 * Register a new SSE client
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const registerSseClient = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const client = {
    id: clientId,
    res,
    userId: req.query.userId || null,
    role: req.query.role || 'customer' // 'customer', 'store', 'rider'
  };

  clients.add(client);

  // Send initial connection handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId, timestamp: new Date().toISOString() })}\n\n`);

  // Heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeatInterval);
    clients.delete(client);
  });
};

/**
 * Broadcast an event to all connected clients or specific target roles/users
 * @param {string} eventType e.g. 'ORDER_STATUS_CHANGED', 'ORDER_PLACED', 'RIDER_LOCATION'
 * @param {object} payload 
 * @param {object} [filter] optional filter { role, userId, orderId }
 */
export const broadcastRealtimeEvent = (eventType, payload, filter = {}) => {
  const data = JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString()
  });

  clients.forEach(client => {
    if (filter.role && client.role !== filter.role && client.role !== 'admin') {
      return;
    }
    if (filter.userId && client.userId && client.userId !== filter.userId) {
      return;
    }

    try {
      client.res.write(`data: ${data}\n\n`);
    } catch (err) {
      clients.delete(client);
    }
  });
};

export const getConnectedClientsCount = () => clients.size;
