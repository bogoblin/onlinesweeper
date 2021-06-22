import * as UserMessage from "../shared/UserMessage.js";
import * as ServerMessage from "../shared/ServerMessage.js";
import {GeneralMessages} from "../shared/ServerMessage.js";
import TileMap from "./TileMap.js";
import TileView from "./TileView.js";
import {tileSize} from "./TileGraphics.js";
export class MineSocket {
    constructor(url) {
        this.socket = new WebSocket(url);
        this.tileMap = new TileMap();
        this.tileView = new TileView(tileSize, this.tileMap);

        this.tileMap.socket = this;
        this.tileView.socket = this;

        this.socket.onmessage = (ev) => {
            this.receiveMessage(ev);
        }

        this.connectPromise = new Promise((resolve, reject) => {
            console.log('running the promise');
            this.socket.addEventListener('open', () => {
                resolve(this);
            });
            this.socket.addEventListener('error', (err) => {
                reject(err);
            });
        });
    }

    async connect() {
        return this.connectPromise;
    }

    sendClickMessage(coords) { // c for click
        this.socket.send(UserMessage.coordsMessage(UserMessage.Operation.Click, coords).serialize());
    }

    sendFlagMessage(coords) { // f for flag
        this.socket.send(UserMessage.coordsMessage(UserMessage.Operation.Flag, coords).serialize());
    }

    sendDoubleClickMessage(coords) { // d for double click
        this.socket.send(UserMessage.coordsMessage(UserMessage.Operation.DoubleClick, coords).serialize());
    }

    sendMoveMessage(coords) { // m for move
        this.socket.send(UserMessage.coordsMessage(UserMessage.Operation.Move, coords).serialize());
    }

    sendLoginMessage(username, password) {
        this.socket.send(UserMessage.loginMessage(username, password).serialize());
    }

    /**
     * @param ev {MessageEvent}
     */
    receiveMessage(ev) {
        new Response(ev.data).arrayBuffer()
            .then(a => {
                const data = new Uint8Array(a);
                const message = ServerMessage.serverMessageDeserialize(data);
                switch (message.operation) {
                    case ServerMessage.Operation.Chunk:
                        const chunk = message.content;
                        this.tileMap.addChunk(chunk);
                        break;
                    case ServerMessage.Operation.General:
                        const general = message.content;
                        switch (general.messageType) {
                            case GeneralMessages.Welcome:
                                this.tileView.viewCenter = general.coords;
                                break;
                            default:
                        }
                        break;
                }
            })
    }

}