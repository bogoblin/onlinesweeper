import {vectorTimesScalar} from "./Vector2";
import {readCoords} from "./SerializeUtils";

export const chunkSize = 16;
export class Chunk {
    constructor(coords, tiles) {
        this.coords = coords;
        if (tiles) {
            this.tiles = tiles;
        }
        else {
            this.tiles = []; // public version - both client and server have this
            for (let i = 0; i < chunkSize * chunkSize; i++) {
                this.tiles.push(i % 9); // todo: actually generate this properly
            }
        }
    }

    /**
     * @param socket {WebSocket}
     */
    send(socket) {
        socket.send(this.serialize());
    }

    serialize() {
        const chunkData = this.tiles.map(v => v+0x21).map(v => String.fromCharCode(v)).join('');
        return `h${chunkData}${this.coords[0]/chunkSize},${this.coords[1]/chunkSize}`;
    }
}

/**
 * @param data {string}
 */
export const chunkDeserialize = (data) => {
    const coords = vectorTimesScalar(readCoords(data, chunkSize * chunkSize + 1), chunkSize);

    const chunkArray = Array.from(data.substr(1, chunkSize*chunkSize))
        .map(v => v.charCodeAt(0)-0x21);

    return new Chunk(coords, chunkArray);
}
