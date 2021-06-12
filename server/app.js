import ws from "ws";
import {Chunk} from "../shared/Chunk.js";
import {ChunkStore} from "../shared/ChunkStore.js";
import {Operation, userMessageDeserialize} from "../shared/UserMessage.js";
import {MessageSender} from "./MessageSender.js";
import {World} from "./World.js";

const server = new ws.Server({
    port: 8081
});

const sockets = [];
const chunks = new ChunkStore();
const newChunk = new Chunk([0,0]);

for (let i=0; i<16; i++) {
    for (let j=0; j<16; j++) {
        newChunk.updateTile([i,j], (i*j)%9);
    }
}
chunks.addChunk(newChunk);

const ms = new MessageSender(server);
const world = new World(ms);
world.chunks = chunks;