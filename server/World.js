import {ChunkStore} from "../shared/ChunkStore.js";
import {Operation} from "../shared/UserMessage.js";
import {Chunk, chunkSize} from "../shared/Chunk.js";
import {vectorAdd, vectorTimesScalar} from "../shared/Vector2.js";
import {adjacent, mine, revealed, tileInfo} from "../shared/Tile.js";

export class World {
    constructor() {
        this.chunks = new ChunkStore();

        this.revealQueue = [];
    }

    setMessageSender(messageSender) {
        this.messageSender = messageSender;
        messageSender.world = this;
    }

    addChunk(chunk) {
        this.chunks.addChunk(chunk);
        if (this.messageSender) {
            this.messageSender.sendToAll(chunk);
        }
        console.log(`Added chunk ${chunk.coords}`)
    }

    runUserMessage(username, message) {
        const {operation, worldCoords} = message;
        switch (operation) {
            case Operation.Click:
                this.reveal(worldCoords);
                break;
            case Operation.Flag:
                this.flag(worldCoords);
                break;
            case Operation.DoubleClick:
                this.doubleClick(worldCoords);
                break;
            default:
                break;
        }

        this.handleRevealQueue();
    }

    // Add to reveal queue
    reveal(worldCoords) {
        console.log(`Added ${worldCoords} to queue`)
        this.revealQueue.push(worldCoords);
    }

    handleRevealQueue() {
        let itemsHandled = 0;
        let chunksUpdated = new Set();
        while (this.revealQueue.length > 0) {
            const toReveal = this.revealQueue.shift();
            const tile = this.chunks.getTile(toReveal);
            if (revealed(tile)) { continue; }

            // Generate adjacent chunks
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    const chunkCoords = vectorAdd(toReveal, vectorTimesScalar([x, y], chunkSize));
                    if (!this.chunks.getChunk(chunkCoords)) {
                        const newChunk = this.generateChunk(chunkCoords, 0.15);
                        chunksUpdated.add(newChunk);
                    }
                }
            }

            const chunk = this.chunks.getChunk(toReveal);
            chunk.reveal(toReveal, this);
            chunksUpdated.add(chunk);

            itemsHandled++;
        }

        for (let chunk of chunksUpdated) {
            this.messageSender.sendToAll(chunk);
        }
    }

    flag(worldCoords) {
        let chunk = this.chunks.getChunk(worldCoords);
        if (chunk) {
            chunk.flag(worldCoords);
            this.messageSender.sendToAll(chunk);
        }
    }

    doubleClick(worldCoords) {
        console.log(`double click ${worldCoords}`)
        const tile = this.chunks.getTile(worldCoords);
        if (!revealed(tile)) {
            this.reveal(worldCoords);
            return;
        }
        if (mine(tile)) {
            return;
        }

        let knownAdjacentMines = 0;
        const revealCandidates = []; // tiles to reveal if double clicking is valid
        for (let x=-1; x<=1; x++) {
            for (let y=-1; y<=1; y++) {
                const adjTileCoords = vectorAdd(worldCoords, [x,y]);
                const adjTile = this.chunks.getTile(adjTileCoords);
                const info = tileInfo(adjTile);
                if (info.revealed && info.mine) { // take into account revealed mines as well as flags
                    knownAdjacentMines++;
                } else if (!info.revealed && info.flag) { // flag
                    knownAdjacentMines++;
                } else if (!info.revealed && !info.flag) { // unrevealed and not a flag
                    revealCandidates.push(adjTileCoords);
                }
            }
        }
        if (adjacent(tile) === knownAdjacentMines) {
            // reveal all adjacent tiles that aren't flagged
            for (let t of revealCandidates) {
                this.reveal(t);
            }
        }
    }

    greet(username) {
        for (let chunk of Object.values(this.chunks.chunks)) {
            this.messageSender.sendToPlayer(username, chunk);
        }
    }

    generateChunk(worldCoords, difficulty) {
        const existingChunk = this.chunks.getChunk(worldCoords);
        if (existingChunk) return existingChunk;

        const newChunk = new Chunk(worldCoords);
        console.log(`Generating new chunk at ${newChunk.coords}`);

        // Get adjacency from existing chunks
        const bottomRight = newChunk.bottomRight();
        for (let x=newChunk.coords[0]; x<=bottomRight[0]; x++) {
            for (let y = newChunk.coords[1]; y <= bottomRight[1]; y++) {
                let adj = 0;
                // offsets
                for (let xo = -1; xo <= 1; xo++) {
                    for (let yo = -1; yo <= 1; yo++) {
                        const coords = vectorAdd([x, y], [xo, yo]);

                        // if we're checking within the new chunk, there won't be any mines there
                        if (newChunk.indexOf(coords) !== -1) continue;

                        // otherwise:
                        const cornerChunk = this.chunks.getChunk(coords);
                        if (cornerChunk) {
                            adj += mine(cornerChunk.getTile(coords));
                        }
                    }
                }
                newChunk.updateTile([x,y], adj);
            }
        }

        // Add mines
        for (let x=0; x<chunkSize; x++) {
            for (let y=0; y<chunkSize; y++) {
                if (Math.random() < difficulty) {
                    newChunk.addMine(vectorAdd(newChunk.coords, [x,y]), this.chunks);
                }
            }
        }

        this.chunks.addChunk(newChunk);
        return newChunk;
    }
}