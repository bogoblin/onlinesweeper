import ws from "ws";
import {Chunk} from "../shared/Chunk.js";
import {ChunkStore} from "../shared/ChunkStore.js";
import {Operation, userMessageDeserialize} from "../shared/UserMessage.js";
import {MessageSender} from "./MessageSender.js";
import {World} from "./World.js";
import {Revealed} from "../shared/Tile.js";

const server = new ws.Server({
    port: 8081
});

const sockets = [];
const chunks = new ChunkStore();
const newChunk = new Chunk([0,0]);

const ms = new MessageSender(server);
const world = new World(ms);

console.log(`Running server.`);