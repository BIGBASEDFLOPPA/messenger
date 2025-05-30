// === server/src/ws/socket.js ===
const WebSocket = require('ws');
const Message = require('../models/Message');

const clients = new Map();

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        let userId = null;

        ws.on('message', async (msg) => {
            try {
                const data = JSON.parse(msg);

                if (data.type === 'auth') {
                    userId = data.userId;
                    clients.set(userId, ws);
                    console.log(`\n✅ Авторизован пользователь: ${userId}`);
                    console.log('📡 Все подключённые клиенты:', Array.from(clients.keys()));
                }

                if (data.type === 'message') {
                    const { to, text } = data;
                    const from = userId;

                    if (!from || !to || !text) {
                        console.warn('📛 Некорректное сообщение:', data);
                        return;
                    }

                    console.log(`✉️ Сообщение от ${from} -> ${to}: ${text}`);

                    await Message.create({ from, to, text });

                    const recipient = clients.get(to);
                    if (recipient) {
                        recipient.send(JSON.stringify({ from, text, type: 'message' }));
                    }
                }
            } catch (error) {
                console.warn('❌ Ошибка обработки сообщения:', error);
            }
        });

        ws.on('close', () => {
            if (userId) {
                clients.delete(userId);
                console.log(`🚪 Клиент ${userId} отключился`);
            }
        });
    });
}

module.exports = { setupWebSocket };
