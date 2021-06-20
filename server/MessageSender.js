import {userMessageDeserialize} from "../shared/UserMessage.js";

export class MessageSender {
    world; // Set from World.js

    constructor(server, world) {
        this.players = {};
        this.world = world;
        world.setMessageSender(this);

        server.on('connection', (socket) => {
            socket.username = 'frad';
            this.players[socket.username] = {
                socket: socket
            };
            this.world.greet(socket.username);

            socket.on('message', (m) => {
                const message = userMessageDeserialize(m);
                this.world.runUserMessage(socket.username, message);
            });

            socket.on('close', () => {
                delete this.players[socket.username];
            });
        });
    }

    sendToAll(serializable) {
        const data = serializable.publicSerialize();
        for (let player of Object.values(this.players)) {
            const socket = player.socket;
            socket.send(data);
        }
    }

    sendToPlayer(username, serializable) {
        const player = this.players[username];

        if (player) {
            const socket = player.socket;
            socket.send(serializable.publicSerialize());
        }
    }
}