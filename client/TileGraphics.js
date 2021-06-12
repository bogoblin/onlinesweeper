import {adjacent, flag, mine, revealed} from "../shared/Tile.js";
import {vectorTimesScalar} from "../shared/Vector2";
import {chunkSize} from "../shared/Chunk";

export const tileSize = 16;

import spritesUrl from '../tiles.png';
const sprites = new Image();
sprites.src = spritesUrl;

const getSpriteIndex = (tile) => {
    if (!revealed(tile)) {
        if (flag(tile)) return 10;
        else return 9;
    }
    else {
        if (mine(tile)) return 11;
        else return adjacent(tile);
    }
}


/**
 *
 * @param context {CanvasRenderingContext2D}
 * @param canvasCoords {number[]}
 * @param tile {number}
 */
export const drawToCanvasContext = (context, canvasCoords, tile) => {
    const spriteIndex = getSpriteIndex(tile);

    const [x, y] = canvasCoords;
    context.drawImage(sprites, spriteIndex * tileSize, 0, tileSize, tileSize, x, y, tileSize, tileSize);
}

export const drawChunkCanvas = (chunk) => {
    if (!chunk.canvas) {
        chunk.canvas = document.createElement('canvas');
    }
    chunk.canvas.width = tileSize * chunkSize;
    chunk.canvas.height = tileSize * chunkSize;

    if (spritesAreLoaded()) {
        const chunkCtx = chunk.canvas.getContext('2d');
        let index = 0;
        for (let y = 0; y < chunkSize; y++) {
            for (let x = 0; x < chunkSize; x++) {
                const tile = chunk.tiles[index];
                const canvasCoords = vectorTimesScalar([x, y], tileSize);
                drawToCanvasContext(chunkCtx, canvasCoords, tile);

                index += 1;
            }
        }
        chunk.redraw = false;
    } else {
        addLoadCallbackForSprites(() => chunk.redraw = true);
    }
}

export const spritesAreLoaded = () => sprites.complete;

export const addLoadCallbackForSprites = (callback) => {
    sprites.addEventListener('load', callback);
}