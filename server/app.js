import {MessageSender} from "./MessageSender.js";
import {createServer} from 'http';
import {Server} from 'socket.io';
import {World} from "./World.js";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:8080",
        methods: ['GET', 'POST']
    }
});

const world = new World();
const ms = new MessageSender(io, world);

httpServer.listen(8081);
console.log(`Running server.`);