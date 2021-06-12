import {ChunkStore} from "../shared/ChunkStore.js";
import {Operation} from "../shared/UserMessage.js";
import {Chunk, chunkSize} from "../shared/Chunk.js";

export class World {
    constructor(messageSender) {
        this.chunks = new ChunkStore();
        this.messageSender = messageSender;
        messageSender.world = this;
    }

    runUserMessage(username, message) {
        const {operation, worldCoords} = message;
        switch (operation) {
            case Operation.Click:
                let chunk = this.chunks.getChunk(worldCoords);
                if (!chunk) {
                    chunk = this.generateChunk(worldCoords, 0.15);
                }
                chunk.reveal(worldCoords, this.chunks);
                this.messageSender.sendToAll(chunk);
                break;
            default:
                break;
        }
    }

    greet(username) {
        // this.messageSender.sendToPlayer(username, this.chunks.getChunk([0,0]));
    }

    generateChunk(worldCoords, difficulty) {
        console.log("Generating new chunk");
        const existingChunk = this.chunks.getChunk(worldCoords);
        if (existingChunk) return;

        const newChunk = new Chunk(worldCoords);

        // todo: Get adjacency from existing chunks

        // Add mines
        for (let x=0; x<chunkSize; x++) {
            for (let y=0; y<chunkSize; y++) {
                if (Math.random() < difficulty) {
                    newChunk.addMine(worldCoords, this.chunks);
                }
            }
        }

        this.chunks.addChunk(newChunk);
        return newChunk;
    }
}