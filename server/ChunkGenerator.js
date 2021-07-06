import {chunkSize} from "../shared/Chunk.js";

const tileIndexes = [];
for (let i=0; i<chunkSize*chunkSize; i++) {
    tileIndexes.push(i);
}

/**
 * Generate the indexes of the mines for a new chunk
 * @param coords {number[]}
 * @returns {number[]}
 */
export const minesForChunk = (coords) => {
    const difficulty = 0.15;

    // shuffle the array
    tileIndexes.sort(() => Math.random()-0.5);

    const numberOfMines = difficulty*chunkSize*chunkSize;
    return tileIndexes.slice(0, Math.floor(numberOfMines));
}