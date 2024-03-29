import TileMap from "./TileMap.js";
import TileView from "./TileView.js";
import {tileSize} from "./TileGraphics.js";
import {Player} from "../shared/Player.js";
import { io } from "socket.io-client";
import {Chunk} from "../shared/Chunk.js";
import {ClientPlayers} from "./ClientPlayers.js";
export class MineSocket {
    onError = () => {};
    onWelcome = () => {};
    onLogout = () => {};
    onPlayerUpdate = () => {};

    currentError;

    constructor(url) {
        this.url = url;
        this.reset();
    }

    reset() {
        this.socket = io(this.url);
        this.players = new ClientPlayers();
        this.tileMap = new TileMap();
        this.tileView = new TileView(tileSize, this.tileMap, this.players);

        this.tileMap.socket = this;
        this.tileView.socket = this;


        this.socket.on('connect', () => {
            this.socket.on('chunk', chunk => {
                if (!chunk) {
                    return;
                }
                this.tileMap.addChunk(new Chunk(chunk.coords, new Uint8Array(chunk.tiles)));
            });
            this.socket.on('player', player => {
                if (!player) {
                    return;
                }
                this.players.updatePlayer(player);
                this.onPlayerUpdate();
            });
            this.socket.on('leave', username => {
                this.players.removePlayer(username);
            })
            this.socket.on('welcome', username => {
                this.players.setMyUsername(username);
                this.onWelcome();
                this.onPlayerUpdate();
                this.tileView.viewCenter = this.players.me().position;
            });
            this.socket.on('error', error => {
                console.log(error);
                this.error(error);
            });
        });
    }

    sendClickMessage(coords) { // c for click
        this.socket.emit('click', coords);
    }

    sendFlagMessage(coords) { // f for flag
        this.socket.emit('flag', coords);
    }

    sendDoubleClickMessage(coords) { // d for double click
        this.socket.emit('doubleClick', coords);
    }

    sendMoveMessage(coords) { // m for move
        this.socket.emit('move', coords);
    }

    sendLoginMessage(username, password) {
        this.players.setMyUsername(username);
        this.socket.emit('login', username, password);
    }

    error(err) {
        this.currentError = err;
        if (this.onError) {
            this.onError();
        }
    }

    logOut() {
        this.socket.emit('logout');
        this.socket.disconnect();
        if (this.onLogout) {
            this.onLogout();
        }
        this.reset();
    }
}