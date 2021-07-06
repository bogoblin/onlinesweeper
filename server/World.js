import {ChunkStore} from "../shared/ChunkStore.js";
import {Chunk, chunkSize} from "../shared/Chunk.js";
import {forEachInRect, forEachNeighbour, vectorFloor} from "../shared/Vector2.js";
import {adjacent, mine, revealed, tileInfo} from "../shared/Tile.js";
import {Player} from "../shared/Player.js";

export class World {
    constructor() {
        this.chunks = new ChunkStore();
        this.players = {};

        this.revealQueue = [];
    }

    setMessageSender(messageSender) {
        this.messageSender = messageSender;
        messageSender.world = this;
    }

    getPlayer(username) {
        return this.players[username];
    }

    getPlayers() {
        return Object.values(this.players);
    }

    addPlayer(username, hashedPassword) {
        if (!this.getPlayer(username)) {
            this.players[username] = new Player(username, hashedPassword);
        }
        return this.getPlayer(username);
    }

    addChunk(chunk) {
        this.chunks.addChunk(chunk);
        if (this.messageSender) {
            this.messageSender.chunk(chunk);
        }
        console.log(`Added chunk ${chunk.coords}`)
    }

    /**
     * Get an array of all the current chunks
     * @returns {Chunk[]} the array of chunks
     */
    getChunks() {
        return Object.values(this.chunks.chunks);
    }

    /**
     * @param player {Player}
     * @param worldCoords {number[]}
     */
    reveal(player, worldCoords) {
        if (!player.isAlive()) {
            return;
        }
        this.queueReveal(player, worldCoords);
        this.handleRevealQueue();
    }

    /**
     * Add to reveal queue
     * @param player {Player}
     * @param worldCoords {number[]}
     */
    queueReveal(player, worldCoords) {
        const coords = vectorFloor(worldCoords);
        this.revealQueue.push({player, worldCoords});
        console.log(`${player.username} Added ${coords} to queue`)
    }

    handleRevealQueue() {
        let itemsHandled = 0;
        let chunksUpdated = new Set();
        let playersUpdated = new Set();
        while (this.revealQueue.length > 0) {
            const {player, worldCoords} = this.revealQueue.shift();
            const tile = this.chunks.getTile(worldCoords);
            if (revealed(tile)) { continue; }

            // Generate this chunk and adjacent chunks
            forEachNeighbour(worldCoords, (chunkCoords) => {
                if (!this.chunks.getChunk(chunkCoords)) {
                    const newChunk = this.generateChunk(chunkCoords, 0.15);
                    chunksUpdated.add(newChunk);
                }
            }, chunkSize); // step size is chunk size because we are checking neighbouring chunks

            const chunk = this.chunks.getChunk(worldCoords);
            chunk.reveal(player, worldCoords, this);
            chunksUpdated.add(chunk);
            playersUpdated.add(player);

            itemsHandled++;
        }

        for (let chunk of chunksUpdated) {
            this.messageSender.chunk(chunk);
        }
        for (let player of playersUpdated) {
            this.messageSender.player(player);
        }
    }

    /**
     * @param player {Player}
     * @param worldCoords {number[]}
     */
    flag(player, worldCoords) {
        if (!player.isAlive()) {
            return;
        }
        let chunk = this.chunks.getChunk(worldCoords);
        if (chunk) {
            chunk.flag(worldCoords);
            this.messageSender.chunk(chunk);
        }
    }

    /**
     * @param player {Player}
     * @param worldCoords {number[]}
     */
    doubleClick(player, worldCoords) {
        if (!player.isAlive()) {
            return;
        }
        const coords = vectorFloor(worldCoords);
        console.log(`double click ${coords}`)
        const tile = this.chunks.getTile(coords);
        if (!revealed(tile)) {
            this.reveal(player, worldCoords);
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
                this.queueReveal(player, t);
            }
        }

        this.handleRevealQueue();
    }

    /**
     * @param player {Player}
     * @param worldCoords {number[]}
     */
    move(player, worldCoords) {
        player.move(worldCoords);
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