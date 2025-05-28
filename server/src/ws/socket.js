const WebSocket = require('ws');
const Message = require('../models/Message');

const clients = new Map();

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        let userId = null;

        ws.on('message', async (msg) => {
            const data = JSON.parse(msg);

            if (data.type === 'auth') {
                userId = data.userId;
                clients.set(userId, ws);
            }

            if (data.type === 'message') {
                const { from, to, text } = data;
                await Message.create({ from, to, text });
                const recipient = clients.get(to);
                if (recipient) {
                    recipient.send(JSON.stringify({ from, text, type: 'message' }));
                }
            }
        });

        ws.on('close', () => {
            if (userId) clients.delete(userId);
        });
    });
}

module.exports = { setupWebSocket };
