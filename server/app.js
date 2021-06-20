import ws from "ws";
import {MessageSender} from "./MessageSender.js";
import {WorldDisk} from "./WorldDisk.js";

const server = new ws.Server({
    port: 8081
});

const world = await new WorldDisk("D:\\onlinesweeper").read();
const ms = new MessageSender(server, world);

console.log(`Running server.`);