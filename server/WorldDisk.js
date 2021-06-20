import * as fs from 'fs';
import * as Path from 'path';
import {chunkDeserialize} from "../shared/Chunk.js";

export class WorldDisk {
    /**
     * @param world {World}
     */
    constructor(world) {
        this.world = world;

        this.readFromDisk()
            .catch(console.log);
    }

    writeToDisk(path='D:\\onlinesweeper') {
        const promises = [];
        for (let chunk of Object.values(this.world.chunks.chunks)) {
            const chunkPath = Path.join(path, `${chunk.coords[0]},${chunk.coords[1]}.mine`);
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

    async readFromDisk(path='D:\\onlinesweeper') {
        return Promise.allSettled(
            fs.readdirSync(path)
            .filter(s => s.endsWith('.mine'))
            .map(file => this.readChunk(Path.join(path, file)))
        );
    }

    async readChunk(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, d) => {
                if (err) {
                    reject(err);
                }
                try {
                    const data = d.toString('ascii');
                    const chunk = chunkDeserialize(data);
                    this.world.addChunk(chunk);
                    resolve();
                } catch (e) {
                    resolve();
                }
            })
        });
    }
}