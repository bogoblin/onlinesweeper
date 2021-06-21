import * as fs from 'fs';
import * as Path from 'path';
import {chunkDeserialize} from "../shared/Chunk.js";
import {World} from "./World.js";

export class WorldDisk {
    constructor(path) {
        this.world = new World();
        this.path = path;

        process.on('SIGINT', async () => {
            console.log('Writing world to disk...')
            await this.write();
            console.log('finished writing')
        })
    }

    write() {
        const promises = [];
        for (let chunk of Object.values(this.world.chunks.chunks)) {
            const chunkPath = Path.join(this.path, `${chunk.coords[0]},${chunk.coords[1]}.mine`);
            const chunkPromise = new Promise((resolve, reject) => {
                fs.writeFile(chunkPath, chunk.serialize(), (err) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log(`written chunk ${chunk.coords} to disk`)
                        resolve(true);
                    }
                })
            });
            promises.push(chunkPromise);
        }
        return Promise.allSettled(promises);
    }

    async read() {
        return new Promise((resolve) => {
            Promise.allSettled(fs.readdirSync(this.path)
                    .filter(s => s.endsWith('.mine'))
                    .map(file => this.readChunk(Path.join(this.path, file))))
                .then(() => {
                    resolve(this.world);
                })
                .catch(() => {
                    this.world = new World();
                    resolve(this.world);
                });
        });
    }

    async readChunk(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    reject(err);
                }
                try {
                    const chunk = chunkDeserialize(data);
                    this.world.addChunk(chunk);
                    resolve();
                } catch (e) {
                    reject(err);
                }
            })
        });
    }
}