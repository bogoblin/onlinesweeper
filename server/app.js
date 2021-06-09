import ws from "ws";
import {Chunk} from "../shared/Chunk.js";

const server = new ws.Server({
    port: 8081
});

const sockets = [];
const chunks = [];
chunks.push(new Chunk([0,0]));
chunks[0].updateTile([0,0],1);
chunks[0].updateTile([1,0],3);
chunks[0].updateTile([1,1],6);
server.on('connection', (socket) => {
    sockets.push(socket);

    socket.on('message', (message) => {
        for (let chunk of chunks) {
            chunk.send(socket);
        }
    });
});