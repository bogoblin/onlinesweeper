import ws from "ws";
import {Chunk} from "../shared/Chunk.js";
import {ChunkStore} from "../shared/ChunkStore.js";
import {Operation, userMessageDeserialize} from "../shared/UserMessage.js";

const server = new ws.Server({
    port: 8081
});

const sockets = [];
const chunks = new ChunkStore();
const newChunk = new Chunk([0,0]);
newChunk.updateTile([0,0],1);
newChunk.updateTile([1,0],3);
newChunk.updateTile([1,1],6);
chunks.addChunk(newChunk);
server.on('connection', (socket) => {
    sockets.push(socket);

    socket.on('message', (m) => {
        const message = userMessageDeserialize(m);

        switch (message.operation) {
            case 'c':
                chunks.updateTile(message.worldCoords, 1);
                console.log(message)
                break;
            default: break;
        }

        chunks.getChunk([0,0]).send(socket);
    });
});