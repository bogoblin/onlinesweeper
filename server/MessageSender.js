import {userMessageDeserialize} from "../shared/UserMessage.js";

export class MessageSender {
    constructor(server, chunks) {
        this.players = {};

        server.on('connection', (socket) => {
            socket.username = 'frad';
            this.players[socket.username] = {
                socket: socket
            };

            socket.on('message', (m) => {
                const message = userMessageDeserialize(m);

                switch (message.operation) {
                    case 'c':
                        chunks.updateTile(message.worldCoords, 1);
                        console.log(message)
                        break;
                    default: break;
                }

                chunks.getChunk([0,0]).send(socket);
            });

            socket.on('close', () => {
                delete this.players[socket.username];
            });
        });
    }

    sendToAll(serializable) {
        for (let player of this.players) {
            const socket = player.socket;
            socket.send(serializable.serialize());
        }
    }

    sendToPlayer(username, serializable) {
        const player = this.players[username];

        if (player) {
            const socket = player.socket;
            socket.send(serializable.serialize());
        }
    }
}