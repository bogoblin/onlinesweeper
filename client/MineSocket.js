import {
    vectorTimesScalar, vectorSub, vectorMagnitudeSquared, vectorAdd
} from '../shared/Vector2';

import {chunkDeserialize, chunkSize} from '../shared/Chunk';
import {readCoords} from "../shared/SerializeUtils";
import {coordsMessage, loginMessage, Operation, UserMessage} from "../shared/UserMessage";
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
        this.socket.send(coordsMessage(Operation.Click, coords).serialize());
    }

    sendFlagMessage(coords) { // f for flag
        this.socket.send(coordsMessage(Operation.Flag, coords).serialize());
    }

    sendDoubleClickMessage(coords) { // d for double click
        this.socket.send(coordsMessage(Operation.DoubleClick, coords).serialize());
    }

    sendMoveMessage(coords) { // m for move
        this.socket.send(coordsMessage(Operation.Move, coords).serialize());
    }

    sendLoginMessage(username, password) {
        this.socket.send(loginMessage(username, password).serialize());
    }

    /**
     * @param ev {MessageEvent}
     */
    receiveMessage(ev) {
        const data = ev.data.toString();
        if (data) {
            const leaderChar = data.charAt(0);
            switch (leaderChar) {
                case 'h': { // cHunk
                    const chunk = chunkDeserialize(data);
                    console.log(chunk)
                    console.log('hello')

                    this.tileMap.addChunk(chunk.coords, chunk.tiles);
                } break;
                case 't': { // Tile update
                    const newValue = data.charCodeAt(1) - 0x21;
                    const coords = readCoords(data, 2);
                    this.tileMap.updateTile(coords, newValue);
                } break;
            }
        }
    }

}
export default MineSocket;