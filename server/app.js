import {MessageSender} from "./MessageSender.js";
import {createServer} from 'http';
import {Server} from 'socket.io';
import {World} from "./World.js";
import {store} from "./Event.js";
import express from "express";
import session from "express-session";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);

// Set up express-session: this saves a cookie so the user doesn't have to type their username and password each time
const sessionMiddleware = session({
    store: store,
    secret: 'minesweeper computer',
    cookie: {
        maxAge: 600000
    },
    resave: false,
    saveUninitialized: true
});

// For some reason, switching the order of these two lines means that the cookie isn't saved
app.use(sessionMiddleware);
app.use(express.static('client_dist'));

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

const world = new World();
const ms = new MessageSender(io, world);

httpServer.listen(8080);
console.log(`Running server.`);