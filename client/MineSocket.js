import {
    vectorTimesScalar, vectorSub, vectorMagnitudeSquared, vectorAdd
} from '../shared/Vector2';

import {chunkDeserialize, chunkSize} from '../shared/Chunk';
import {readCoords} from "../shared/SerializeUtils";
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

        this.socket.send("asdf");
    }

    sendClickMessage([x, y]) { // c for click
        this.socket.send(`c${Math.floor(x)},${Math.floor(y)}`);
    }

    sendFlagMessage([x, y]) { // f for flag
        this.socket.send(`f${Math.floor(x)},${Math.floor(y)}`);
    }

    sendDoubleClickMessage([x, y]) { // d for double click
        this.socket.send(`d${Math.floor(x)},${Math.floor(y)}`);
    }

    sendMoveMessage([x, y]) { // m for move
        this.socket.send(`m${Math.floor(x)},${Math.floor(y)}`);
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