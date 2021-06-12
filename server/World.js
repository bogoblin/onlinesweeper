import {ChunkStore} from "../shared/ChunkStore.js";
import {Operation} from "../shared/UserMessage.js";
import {Chunk} from "../shared/Chunk.js";

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
                const chunk = this.chunks.getChunk(worldCoords);
                if (chunk) {
                    this.chunks.updateTile(worldCoords, 1);
                    this.messageSender.sendToAll(this.chunks.getChunk(worldCoords));
                }
                else {
                }

                break;
            default:
                break;
        }
    }

    greet(username) {
        this.messageSender.sendToPlayer(username, this.chunks.getChunk([0,0]));
    }
}