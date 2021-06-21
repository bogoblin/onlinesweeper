import {Operation, userMessageDeserialize} from "../shared/UserMessage.js";

export class MessageSender {
    world; // Set from World.js

    constructor(server, world) {
        this.world = world;
        world.setMessageSender(this);

        server.on('connection', (socket) => {
            this.connectedPlayers = {};

            socket.on('message', (m) => {
                const message = userMessageDeserialize(m);
                switch (message.operation) {
                    case Operation.Login:
                        const {username, password} = message;
                        if (username && password) {
                            let player;
                            // todo: auth
                            const existingPlayer = this.world.getPlayer(username);
                            if (existingPlayer) { // todo: security
                                if (existingPlayer.hashedPassword === password) {
                                    player = existingPlayer;
                                }
                            } else {
                                // create new player
                                player = this.world.addPlayer(username, password); // todo: hash passwords
                            }

                            if (player) {
                                player.connect(socket);
                                this.world.greet(player);
                                this.connectedPlayers[username] = player;
                            }
                        }
                        break;
                    case Operation.Click:
                        if (socket.player) {
                            this.world.reveal(socket.player, message.worldCoords);
                        }
                        break;
                    case Operation.Flag:
                        if (socket.player) {
                            this.world.flag(socket.player, message.worldCoords);
                        }
                        break;
                    case Operation.DoubleClick:
                        if (socket.player) {
                            this.world.doubleClick(socket.player, message.worldCoords);
                        }
                        break;
                    case Operation.Move:
                        if (socket.player) {
                            this.world.move(socket.player, message.worldCoords);
                        }
                        break;
                    default:
                        break;
                }
            });

            socket.on('close', () => {
                delete this.connectedPlayers[socket.username];
            });
        });
    }

    sendToAll(message) {
        for (let player of Object.values(this.connectedPlayers)) {
            player.send(message);
        }
    }
}