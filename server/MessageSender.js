import * as sha256 from 'sha-256';
import {Server} from 'socket.io';
import {Chunk} from "../shared/Chunk.js";

const salt = process.env['salt'];

export class MessageSender {
    /**
     *
     * @param io {Server}
     * @param world {World}
     */
    constructor(io, world) {
        this.io = io;
        this.world = world;
        world.setMessageSender(this);
        io.on('connection', socket => {
            console.log('someone connected');
            this.initializeSocket(socket);
        });
    }

    /**
     * Sends the chunk data to the recipient. If no recipient is given, send it to everyone.
     * @param chunkToSend {Chunk}
     * @param recipient {Player?}
     */
    chunk(chunkToSend, recipient) {
        if (!recipient) {
            // send to everyone
            this.io.emit('chunk', chunkToSend.publicVersion());
        } else {
            recipient.socket.emit('chunk', chunkToSend.publicVersion());
        }
    }

    /**
     * Sends the player data to the recipient. If no recipient is given, send it to everyone.
     * @param playerToSend {Player}
     * @param recipient {Player?}
     */
    player(playerToSend, recipient) {
        if (!recipient) {
            // send to everyone
            this.io.emit('player', playerToSend.publicVersion());
        } else {
            recipient.socket.emit('player', playerToSend.publicVersion());
        }
    }

    /**
     *
     * @param playerToWelcome {Player}
     */
    welcome(playerToWelcome) {
        // send the player all chunks
        for (let chunk of this.world.getChunks()) {
            this.chunk(chunk, playerToWelcome);
        }

        // send all player info
        for (let player of this.world.getPlayers()) {
            this.player(player, playerToWelcome);
        }

        // send welcome event
        playerToWelcome.socket.emit('welcome', playerToWelcome.username);
    }

    initializeSocket = socket => {
        const session = socket.request.session;

        if (session) {
            if (session.username) {
                const player = this.world.getPlayer(session.username);
                if (player) {
                    this.initializePlayer(player, socket);
                }
            }
        }

        socket.on('login', (username, password) => {
            console.log(`${username} logging in...`);
            const existingPlayer = this.world.getPlayer(username);
            if (!existingPlayer) {
                // then it's a registration
                // validate username and password
                {
                    const [valid, reason] = validUsername(username);
                    if (!valid) {
                        socket.emit('error', {reason});
                        return;
                    }
                }
                {
                    const [valid, reason] = validPassword(password);
                    if (!valid) {
                        socket.emit('error', {reason});
                        return;
                    }
                }

                const player = this.world.addPlayer(username, hashPassword(password));
                this.initializePlayer(player, socket);
                return;
            }
            if (existingPlayer.hashedPassword === hashPassword(password)) {
                // password is correct
                this.initializePlayer(existingPlayer, socket);
            } else {
                // password is incorrect
                socket.emit('error', {reason: `User ${username} exists, but the password is wrong. Try again.`});
            }
        });
    }

    /**
     *
     * @param player {Player}
     * @param socket
     */
    initializePlayer = (player, socket) => {
        player.connect(socket);

        socket.on('click', coords => {
            if (player.isAlive()) {
                this.world.reveal(player, coords);
            }
        });
        socket.on('flag', coords => {
            if (player.isAlive()) {
                this.world.flag(player, coords);
            }
        });
        socket.on('doubleClick', coords => {
            if (player.isAlive()) {
                this.world.doubleClick(player, coords);
            }
        });
        socket.on('move', coords => {
            this.world.move(player, coords);
        });

        socket.on('logout', () => {
            const session = socket.request.session;
            console.log(player.username + 'logged out');
            session.username = null;
            session.save();
        })
        socket.on('disconnect', () => {
            player.socket = null;
        });

        console.log('sending welcome')
        this.welcome(player);
    }
}

const hashPassword = password => sha256.hash(salt+password);

const validUsername = username => {
    const [minL, maxL] = [3, 30];
    if (username.length <= minL || username.length >= maxL) {
        return [false, `Username must be between ${minL} and ${maxL} characters in length.`];
    }
    return [true, ''];
}

const validPassword = password => {
    const [minL, maxL] = [6, 30];
    if (password.length <= minL || password.length >= maxL) {
        return [false, `Password must be between ${minL} and ${maxL} characters in length.`];
    }
    return [true, ''];
}
