import {Chunk} from './Chunk.js';
import {equals, run, test} from "./testing/Test.js";
import {ChunkStore} from "./ChunkStore.js";
import {tileInfo} from "./Tile.js";

test('Adding a mine', () => {
    const c = new Chunk([0,0]);
    const store = new ChunkStore();
    store.addChunk(c);

    c.addMine([4,4], store);
    equals(true, tileInfo(c.getTile([4,4])).mine);
    equals(1, tileInfo(c.getTile([3,4])).adjacent);
})

test('Adding two mines', () => {
    const c = new Chunk([0,0]);
    const store = new ChunkStore();
    store.addChunk(c);

    c.addMine([4,4], store);
    equals(true, tileInfo(c.getTile([4,4])).mine);
    equals(1, tileInfo(c.getTile([3,4])).adjacent);

    c.addMine([6,4], store);
    equals(true, tileInfo(c.getTile([6,4])).mine);
    equals(2, tileInfo(c.getTile([5,4])).adjacent);
})

run();