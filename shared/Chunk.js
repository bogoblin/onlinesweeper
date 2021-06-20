import {forEachNeighbour, vectorAdd} from "./Vector2.js";
import {adjacent, Flag, flag, Mine, mine, publicVersion, revealed, Revealed} from "./Tile.js";

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


    /**
     * Chunk stores an array of tiles. This function returns the index of that array that corresponds to the given world coordinates.
     * @param worldCoords {number[]} the coordinates to find the index of.
     * @returns {number} the index for the tiles array for this coordinate. Returns -1 if the coordinate is not in this chunk.
     */
    indexOf(worldCoords) {
        const row = worldCoords[1] - this.coords[1];
        const col = worldCoords[0] - this.coords[0];
        if (row >= chunkSize || col >= chunkSize || row < 0 || col < 0) {
            return -1;
        }
        return row*chunkSize + col;
    }

    updateTile(worldCoords, tile) {
        const index = this.indexOf(worldCoords);
        if (index === -1) return;

        this.tiles[index] = tile;

        this.redraw = true;
    }

    getTile(worldCoords) {
        const index = this.indexOf(worldCoords);
        if (index === -1) return;

        return this.tiles[index];
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
        forEachNeighbour(worldCoords, (coordsOfAdjTile) => {
            const indexOfAdjTile = this.indexOf(coordsOfAdjTile);
            if (indexOfAdjTile === -1) {
                const adjChunk = chunkStore.getChunk(coordsOfAdjTile);
                if (adjChunk) {
                    const adjIndex = adjChunk.indexOf(coordsOfAdjTile);
                    adjChunk.tiles[adjIndex] += 1;
                }
            } else {
                this.tiles[indexOfAdjTile] += 1;
            }
        });
    }

    reveal(worldCoords, world) {
        const index = this.indexOf(worldCoords);
        if (index === -1) {
            world.reveal(worldCoords);
            return;
        }

        const tileIsRevealedAlready = revealed(this.tiles[index]);
        if (tileIsRevealedAlready) return;

        this.tiles[index] += Revealed;

        if (adjacent(this.tiles[index]) === 0) {
            forEachNeighbour(worldCoords, (adjacentCoords) => {
                const adjacentTile = this.getTile(adjacentCoords);
                if (!revealed(adjacentTile)) {
                    this.reveal(adjacentCoords, world);
                }
            });
        }
        else {
        }
    }

    flag(worldCoords) {
        const index = this.indexOf(worldCoords);
        if (index === -1) return;

        const tile = this.tiles[index];
        if (flag(tile)) {
            this.tiles[index] -= Flag;
        } else {
            this.tiles[index] += Flag;
        }
    }

    topLeft() {
        return this.coords;
    }
    topRight() {
        return vectorAdd(this.topLeft(), [chunkSize, 0]);
    }
    bottomLeft() {
        return vectorAdd(this.topLeft(), [0, chunkSize]);
    }
    bottomRight() {
        return vectorAdd(this.topLeft(), [chunkSize, chunkSize]);
    }
    rect() {
        return [this.topLeft(), this.bottomRight()];
    }

    publicSerialize() {
        const publicTiles = this.tiles.map(tile => publicVersion(tile));
        const pubVer = new Chunk(this.coords, publicTiles);
        return pubVer.serialize();
    }

    serialize() {
        return 'h'+JSON.stringify(this);
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