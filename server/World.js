import {ChunkStore} from "../shared/ChunkStore.js";
import {Operation} from "../shared/UserMessage.js";
import {Chunk, chunkSize} from "../shared/Chunk.js";
import {forEachInRect, forEachNeighbour, vectorAdd, vectorFloor, vectorTimesScalar} from "../shared/Vector2.js";
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
        const operation = message.operation;
        switch (operation) {
            case Operation.Click:
                this.reveal(message.worldCoords);
                break;
            case Operation.Flag:
                this.flag(message.worldCoords);
                break;
            case Operation.DoubleClick:
                this.doubleClick(message.worldCoords);
                break;
            default:
                break;
        }

        this.handleRevealQueue();
    }

    // Add to reveal queue
    reveal(worldCoords) {
        const coords = vectorFloor(worldCoords);
        console.log(`Added ${coords} to queue`)
        this.revealQueue.push(coords);
    }

    handleRevealQueue() {
        let itemsHandled = 0;
        let chunksUpdated = new Set();
        while (this.revealQueue.length > 0) {
            const toReveal = this.revealQueue.shift();
            const tile = this.chunks.getTile(toReveal);
            if (revealed(tile)) { continue; }

            // Generate this chunk and adjacent chunks
            forEachNeighbour(toReveal, (chunkCoords) => {
                if (!this.chunks.getChunk(chunkCoords)) {
                    const newChunk = this.generateChunk(chunkCoords, 0.15);
                    chunksUpdated.add(newChunk);
                }
            }, chunkSize); // step size is chunk size because we are checking neighbouring chunks

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
        const coords = vectorFloor(worldCoords);
        console.log(`double click ${coords}`)
        const tile = this.chunks.getTile(coords);
        if (!revealed(tile)) {
            this.reveal(coords);
            return;
        }
        if (mine(tile)) {
            return;
        }

        let knownAdjacentMines = 0;
        const revealCandidates = []; // tiles to reveal if double clicking is valid

        forEachNeighbour(coords, (adjTileCoords) => {
            const adjTile = this.chunks.getTile(adjTileCoords);
            const info = tileInfo(adjTile);
            if (info.revealed && info.mine) { // take into account revealed mines as well as flags
                knownAdjacentMines++;
            } else if (!info.revealed && info.flag) { // flag
                knownAdjacentMines++;
            } else if (!info.revealed && !info.flag) { // unrevealed and not a flag
                revealCandidates.push(adjTileCoords);
            }
        });
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

        const chunkRect = newChunk.rect();

        // Get adjacency from existing chunks - check each tile in the chunk
        forEachInRect(chunkRect, (tileCoords) => {
            let adj = 0;
            forEachNeighbour(tileCoords, (coords) => {
                // if we're checking within the new chunk, there won't be any mines there
                // because we haven't placed them yet
                if (newChunk.indexOf(coords) !== -1) return;

                // otherwise count the mines from the existing chunk
                const cornerChunk = this.chunks.getChunk(coords);
                if (cornerChunk) {
                    adj += mine(cornerChunk.getTile(coords));
                }
            });
            newChunk.updateTile(tileCoords, adj);
        });

        // Add mines to new chunk
        forEachInRect(chunkRect, (mineCoords) => {
            if (Math.random() < difficulty) { // There is a difficulty/1 chance of each tile being a mine
                newChunk.addMine(mineCoords, this.chunks);
            }
        })

        this.chunks.addChunk(newChunk);
        return newChunk;
    }
}