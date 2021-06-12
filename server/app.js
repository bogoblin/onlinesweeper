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

for (let i=0; i<16; i++) {
    for (let j=0; j<16; j++) {
        newChunk.updateTile([i,j], (i*j)%9);
    }
}
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