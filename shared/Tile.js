// Tiles are 8 bit binary numbers.

const AdjacencyMask = 0b1111; // bits 0-3 = number of adjacent mines
const Mine = 1 << 4; // bit 4 = is there a mine?
const Flag = 1 << 5; // bit 5 = is this flagged?
const Revealed = 1 << 6; // bit 6 = is this revealed?

const PublicIfNotRevealed = Revealed | Flag;

let sprites;
let loaded = false;
try {
    sprites = new Image();
    sprites.src = '../tiles.png';
    let loaded = false;
    sprites.onload = () => {
        loaded = true;
    }
}
catch {
    // Stops node.js breaking
}

/**
 *
 * @param tile {number} The tile to decode
 */
export const tileInfo = (tile) => {
    return {
        revealed: revealed(tile),
        flag: flag(tile),
        mine: mine(tile),
        adjacent: adjacent(tile)
    };
}

export const publicVersion = (tile) => {
    if (revealed(tile)) {
        return tile;
    } else {
        return tile & PublicIfNotRevealed;
    }
}

export const adjacent = tile => tile & AdjacencyMask;
export const mine = tile => (tile & Mine) !== 0;
export const flag = tile => (tile & Flag) !== 0;
export const revealed = tile => (tile & Revealed) !== 0;

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

export const tileWidth = 16;

/**
 *
 * @param context {CanvasRenderingContext2D}
 * @param canvasCoords {number[]}
 * @param tile {number}
 */
export const drawToCanvasContext = (context, canvasCoords, tile) => {
    const spriteIndex = getSpriteIndex(tile);

    const [x,y] = canvasCoords;
    context.drawImage(sprites, spriteIndex*tileWidth, 0, tileWidth, tileWidth, x, y, tileWidth, tileWidth);
}
