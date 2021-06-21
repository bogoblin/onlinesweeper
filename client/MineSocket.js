import {
    vectorTimesScalar, vectorSub, vectorMagnitudeSquared, vectorAdd
} from '../shared/Vector2';

import {chunkDeserialize, chunkSize} from '../shared/Chunk';
import {readCoords} from "../shared/SerializeUtils";
import * as UserMessage from "../shared/UserMessage";
import * as ServerMessage from "../shared/ServerMessage";
class MineSocket {
    /**
     * @param socket {WebSocket}
     * @param tileMap {TileMap}
     * @param tileView {TileView}
     */
    constructor(socket, tileMap, tileView) {
        this.socket = socket;
        this.tileMap = tileMap;
        this.tileView = tileView;

        tileMap.socket = this;
        tileView.socket = this;

        this.socket.onmessage = (ev) => {
            console.log(ev);
            this.receiveMessage(ev);
        }
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
                console.log(a);
                const data = new Uint8Array(a);
                console.log(data);
                const message = ServerMessage.serverMessageDeserialize(data);
                console.log(message);
                switch (message.operation) {
                    case ServerMessage.Operation.Chunk:
                        const chunk = message.content;
                        console.log(chunk);
                        this.tileMap.addChunk(chunk);
                }
            })
    }

}
export default MineSocket;