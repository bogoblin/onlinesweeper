import ws from "ws";
import {MessageSender} from "./MessageSender.js";
import {World} from "./World.js";
import {WorldDisk} from "./WorldDisk.js";

const server = new ws.Server({
    port: 8081
});

const ms = new MessageSender(server);
const world = new World(ms);
const worldDisk = new WorldDisk(world);

console.log(`Running server.`);

process.on('SIGINT', async () => {
    console.log('waiting')
    await worldDisk.writeToDisk();
    console.log('finished')
})