import {ChunkStore} from "../shared/ChunkStore.js";
import {Operation} from "../shared/UserMessage.js";
import {Chunk, chunkSize} from "../shared/Chunk.js";
import {vectorAdd, vectorTimesScalar} from "../shared/Vector2.js";
import {mine, revealed} from "../shared/Tile.js";

export class World {
    constructor(messageSender) {
        this.chunks = new ChunkStore();
        this.messageSender = messageSender;
        messageSender.world = this;

        this.revealQueue = [];
    }

    runUserMessage(username, message) {
        const {operation, worldCoords} = message;
        let chunk = this.chunks.getChunk(worldCoords);
        switch (operation) {
            case Operation.Click:
                this.reveal(worldCoords);
                chunk = this.chunks.getChunk(worldCoords);
                break;
            case Operation.Flag:
                this.flag(worldCoords);
                chunk = this.chunks.getChunk(worldCoords);
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

            if (!this.chunks.getChunk(toReveal)) {
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
            }

            const chunk = this.chunks.getChunk(toReveal);
            chunk.reveal(toReveal, this);
            chunksUpdated.add(chunk);

            itemsHandled++;

            if (itemsHandled >= 100) {
                break;
            }
        }

        for (let chunk of chunksUpdated) {
            this.messageSender.sendToAll(chunk);
        }
    }

    revealDo(worldCoords, chunksGenerated = 0) {
        if (chunksGenerated > 0) {
            return;
        }
        // Generate adjacent chunks
        for (let x=-1; x<=1; x++) {
            for (let y = -1; y <= 1; y++) {
                const chunkCoords = vectorAdd(worldCoords, vectorTimesScalar([x,y], chunkSize));
                if (!this.chunks.getChunk(chunkCoords)) {
                    this.generateChunk(chunkCoords, 0.15);
                    chunksGenerated += 1;
                }
            }
        }

        const chunk = this.chunks.getChunk(worldCoords);
        try {
            chunk.reveal(worldCoords, this, chunksGenerated);
        } catch (e) {
            console.log(e);
        }
    }

    flag(worldCoords) {
        let chunk = this.chunks.getChunk(worldCoords);
        if (chunk) {
            chunk.flag(worldCoords);
        }
    }

    greet(username) {
        // this.messageSender.sendToPlayer(username, this.chunks.getChunk([0,0]));
    }

    generateChunk(worldCoords, difficulty) {
        const existingChunk = this.chunks.getChunk(worldCoords);
        if (existingChunk) return existingChunk;

        const newChunk = new Chunk(worldCoords);
        console.log(`Generating new chunk at ${newChunk.coords}`);

        // Get adjacency from existing chunks
        // Corners
        const corners = [newChunk.topLeft(), newChunk.topRight(), newChunk.bottomLeft(), newChunk.bottomRight()];
        for (let corner of corners) {
            let adj = 0;
            for (let x=-1; x<=1; x++) {
                for (let y=-1; y<=1; y++) {
                    const coords = vectorAdd(corner, [x,y]);

                    // if we're checking within the new chunk, there won't be any mines there
                    if (newChunk.indexOf(coords) !== -1) continue;

                    // otherwise:
                    const cornerChunk = this.chunks.getChunk(coords);
                    if (cornerChunk) {
                        adj += mine(cornerChunk.getTile(coords));
                    }
                }
            }
            newChunk.updateTile(corner, adj);
        }

        // Sides
        for (let coordAlongSide = 1; coordAlongSide < chunkSize-2; coordAlongSide++) {
            for (let direction of ['Left', 'Right', 'Up', 'Down'])
            {
                let directionOfSide;
                let start;
                switch (direction) {
                    case 'Left':
                        directionOfSide = [-1,0];
                        start = newChunk.topLeft();
                        break;
                    case 'Right':
                        directionOfSide = [1, 0];
                        start = newChunk.bottomRight();
                        break;
                    case 'Up':
                        directionOfSide = [0, -1];
                        start = newChunk.topLeft();
                        break;
                    case 'Down':
                        directionOfSide = [0, 1];
                        start = newChunk.bottomRight();
                        break;
                }
                const counterDirection = [-directionOfSide[1], -directionOfSide[0]];
                const coordsOfSideTile = vectorAdd(start, vectorTimesScalar(counterDirection, coordAlongSide));
                const sideChunk = this.chunks.getChunk(vectorAdd(newChunk.topLeft(), directionOfSide));
                if (sideChunk) {
                    let adj = 0;
                    for (let offsetAlongSide = -1; offsetAlongSide <= 1; offsetAlongSide++) {
                        const coordsOfTileToCheck = vectorAdd(coordsOfSideTile, [-1, offsetAlongSide]);
                        adj += mine(sideChunk.getTile(coordsOfTileToCheck));
                    }
                    newChunk.updateTile(coordsOfSideTile, adj);
                }
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