import {Operation, userMessageDeserialize} from "../shared/UserMessage.js";
import * as sha256 from 'sha-256';
import {error, serverGeneralMessage, ServerMessage} from "../shared/ServerMessage.js";

const salt = process.env['salt'];

export class MessageSender {
    world; // Set from World.js

    constructor(server, world) {
        this.world = world;
        world.setMessageSender(this);

        server.on('connection', (socket) => {
            this.connectedPlayers = {};

            socket.on('message', (m) => {
                const message = userMessageDeserialize(m);
                let player = socket.player;
                switch (message.operation) {
                    case Operation.Login:
                        const {username, password} = message;
                        if (!player && username && password) {
                            const hashed = hashPassword(password);
                            const existingPlayer = this.world.getPlayer(username);
                            if (existingPlayer) {
                                if (existingPlayer.hashedPassword === hashed) {
                                    player = existingPlayer;
                                } else {
                                    socket.send(serverGeneralMessage(error(
                                        `The password you entered doesn't match what we have for this username.`
                                    )).serialize());
                                }
                            } else {
                                // create new player
                                player = this.world.addPlayer(username, hashed);
                            }

                            if (player) {
                                player.connect(socket);
                                this.world.greet(player);
                                this.connectedPlayers[username] = player;
                            }
                        }
                        break;
                    case Operation.Click:
                        if (player) {
                            this.world.reveal(player, message.worldCoords);
                        }
                        break;
                    case Operation.Flag:
                        if (player) {
                            this.world.flag(player, message.worldCoords);
                        }
                        break;
                    case Operation.DoubleClick:
                        if (player) {
                            this.world.doubleClick(player, message.worldCoords);
                        }
                        break;
                    case Operation.Move:
                        if (player) {
                            this.world.move(player, message.worldCoords);
                        }
                        break;
                    default:
                        break;
                }
            });

            socket.on('close', () => {
                if (socket.player) {
                    delete this.connectedPlayers[socket.player.username];
                }
            });
        });
    }

    sendToAll(message) {
        for (let player of Object.values(this.connectedPlayers)) {
            player.send(message);
        }
    }
}

const hashPassword = password => sha256.hash(salt+password);