import ws from "ws";
import Chunk from "./Chunk.js";

const server = new ws.Server({
    port: 8081
});

const sockets = [];
const chunks = [];
chunks.push(new Chunk([0,0]));
server.on('connection', (socket) => {
    sockets.push(socket);

    socket.on('message', (message) => {
        for (let chunk of chunks) {
            chunk.send(socket);
        }
    });
});