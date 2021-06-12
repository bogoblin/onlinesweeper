import {vectorTimesScalar} from "./Vector2.js";
import {readCoords} from "./SerializeUtils.js";

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
                this.tiles.push(10); // todo: actually generate this properly
            }
        }

        this.redraw = true; // This chunk needs to be drawn again
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

    indexOf(worldCoords) {
        const row = worldCoords[1] - this.coords[1];
        const col = worldCoords[0] - this.coords[0];
        // todo: error handling - check that coords are in bounds of the chunk
        return row*chunkSize + col;
    }

    updateTile(worldCoords, tileId) {
        const index = this.indexOf(worldCoords);
        this.tiles[index] = tileId;

        this.redraw = true;
    }

    draw(context, [screenX, screenY], images, tileSize) {
        // Redraw this chunk if we need to
        if (this.redraw) {
            if (!this.canvas) {
                this.canvas = document.createElement('canvas');
            }
            this.canvas.width = tileSize*chunkSize;
            this.canvas.height = tileSize*chunkSize;
            const chunkCtx = this.canvas.getContext('2d');
            let index = 0;
            for (let row=0; row<chunkSize; row++) {
                for (let col=0; col<chunkSize; col++) {
                    const tileId = this.tiles[index];
                    const img = images[tileId];

                    if (img) {
                        // if the image hasn't loaded yet, then we need to redraw when it has
                        if (!img.complete) {
                            img.addEventListener('load', () => {
                                this.redraw = true;
                            })
                        }

                        chunkCtx.drawImage(img, col * tileSize, row * tileSize);
                    }

                    index += 1;
                }
            }
            this.redraw = false;
        }

        context.drawImage(this.canvas, screenX, screenY);
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

export const chunkCoords = ([x,y]) => {
    return [
        Math.floor(x/chunkSize)*chunkSize,
        Math.floor(y/chunkSize)*chunkSize
    ];
}

export const chunkKey = (worldCoords) => {
    const worldTopLeft = chunkCoords(worldCoords);
    return `${worldTopLeft[0]},${worldTopLeft[1]}`;
}

export const defaultChunk = new Chunk([0,0]);