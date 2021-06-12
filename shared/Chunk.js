import {vectorAdd, vectorTimesScalar} from "./Vector2.js";
import {readCoords} from "./SerializeUtils.js";
import {adjacent, Mine, mine, revealed, Revealed} from "./Tile.js";

export const chunkSize = 16;
export class Chunk {
    constructor(coords, tiles) {
        this.coords = chunkCoords(coords);
        if (tiles) {
            this.tiles = Uint8Array.from(tiles);
        }
        else {
            this.tiles = new Uint8Array(chunkSize*chunkSize);
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
        return 'h'+JSON.stringify(this);
    }

    indexOf(worldCoords) {
        const row = worldCoords[1] - this.coords[1];
        const col = worldCoords[0] - this.coords[0];
        if (row >= chunkSize || col >= chunkSize || row < 0 || col < 0) {
            return -1; // todo: what to do here? this shouldn't happen but might if there are bugs
        }
        return row*chunkSize + col;
    }

    updateTile(worldCoords, tileId) {
        const index = this.indexOf(worldCoords);
        this.tiles[index] = tileId;

        this.redraw = true;
    }

    draw(context, [screenX, screenY], drawFunction) {
        // Redraw this chunk if we need to
        if (this.redraw) {
            drawFunction(this);
        }

        context.drawImage(this.canvas, screenX, screenY);
    }

    addMine(worldCoords, chunkStore) {
        const index = this.indexOf(worldCoords);
        if (index === -1) return;

        const tileIsMineAlready = mine(this.tiles[index]);
        if (tileIsMineAlready) return;

        this.tiles[index] |= Mine;

        // Now we need to update the number of adjacent tiles
        for (let x=-1; x<=1; x++) {
            for (let y=-1; y<=1; y++) {
                const coordsOfAdjTile = vectorAdd(worldCoords, [x,y]);
                const indexOfAdjTile = this.indexOf(coordsOfAdjTile);
                if (indexOfAdjTile === -1) {
                    const adjChunk = chunkStore.getChunk(coordsOfAdjTile);
                    if (adjChunk) {
                        const adjIndex = adjChunk.indexOf(coordsOfAdjTile);
                        adjChunk.tiles[adjIndex] += 1;
                    }
                }
            }
        }
    }

    reveal(worldCoords, chunkStore) {
        const index = this.indexOf(worldCoords);
        if (index === -1) return;

        const tileIsRevealedAlready = revealed(this.tiles[index]);
        if (tileIsRevealedAlready) return;

        this.tiles[index] |= Revealed;

        if (adjacent(this.tiles[index]) === 0) {

            // Now we need to update the number of adjacent tiles
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    const coordsOfAdjTile = vectorAdd(worldCoords, [x, y]);
                    const indexOfAdjTile = this.indexOf(coordsOfAdjTile);
                    if (indexOfAdjTile === -1) {
                        const adjChunk = chunkStore.getChunk(coordsOfAdjTile);
                        if (adjChunk) {
                            adjChunk.reveal(coordsOfAdjTile, chunkStore);
                        }
                    } else {
                        this.reveal(coordsOfAdjTile, chunkStore);
                    }
                }
            }
        }
    }
}

/**
 * @param data {string}
 */
export const chunkDeserialize = (data) => {
    const chunk = JSON.parse(data.substring(1));
    const coords = chunk.coords;
    const chunkArray = new Uint8Array(chunkSize*chunkSize);
    for (let i=0; i<chunkSize*chunkSize; i++) {
        chunkArray[i] = chunk.tiles[i];
    }

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