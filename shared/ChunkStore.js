import {chunkCoords, chunkKey, chunkSize} from "./Chunk.js";

export class ChunkStore {
    constructor() {
        this.chunks = {};
    }

    /**
     * Add a chunk to the chunk store
     * @param chunk {Chunk}
     */
    addChunk(chunk) {
        this.chunks[chunkKey(chunk.coords)] = chunk;
    }

    /**
     * Get the chunk that the given coordinates lies in
     * @param worldCoords {number[]}
     * @returns {Chunk}
     */
    getChunk(worldCoords) {
        return this.chunks[chunkKey(worldCoords)];
    }

    updateTile(worldCoords, tileId) {
        const chunk = this.getChunk(worldCoords);
        if (chunk) {
            chunk.updateTile(worldCoords, tileId);
        }
    }
}