const WebSocket = require('ws');
const Message = require('../models/Message');

const clients = new Map(); // userId -> Set of WebSocket connections

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        let userId = null;

        ws.on('message', async (msg) => {
            try {
                const data = JSON.parse(msg);

                if (data.type === 'auth') {
                    userId = data.userId;
                    if (!clients.has(userId)) {
                        clients.set(userId, new Set());
                    }
                    clients.get(userId).add(ws);

                    console.log(`Авторизован пользователь: ${userId}`);
                    console.log('Все подключённые клиенты:', Array.from(clients.keys()));
                }

                if (data.type === 'message') {
                    const { to, text, username } = data;
                    const from = userId;

                    if (!from || !to || !text) {
                        console.warn('Некорректное сообщение:', data);
                        return;
                    }

                    console.log(`✉️ Сообщение от ${username} (${from}) -> ${to}: ${text}`);

                    await Message.create({ from, to, text });

                    const recipients = clients.get(to);
                    if (recipients) {
                        recipients.forEach((clientWs) => {
                            if (clientWs.readyState === WebSocket.OPEN) {
                                clientWs.send(JSON.stringify({
                                    type: 'message',
                                    from,
                                    username,
                                    text,
                                }));
                            }
                        });
                    }
                }
            } catch (error) {
                console.warn('Ошибка обработки сообщения:', error);
            }
        });

        ws.on('close', () => {
            if (userId) {
                const conns = clients.get(userId);
                if (conns) {
                    conns.delete(ws);
                    if (conns.size === 0) {
                        clients.delete(userId);
                    }
                }
                console.log(`Клиент ${userId} отключился`);
            }
        });
    });
}

module.exports = { setupWebSocket };
