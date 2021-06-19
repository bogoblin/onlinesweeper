import {Chunk, chunkDeserialize} from './Chunk.js';
import {equals, run, test} from "./testing/Test.js";
import {ChunkStore} from "./ChunkStore.js";
import {tileInfo} from "./Tile.js";

test('Default chunk serializes and deserializes properly', () => {
    const c = new Chunk([0,0]);
    const serialized = c.serialize();
    const deserialized = chunkDeserialize(serialized);
    equals(c, deserialized);
});

test('Random chunk serializes and deserializes properly', () => {
    const c = new Chunk([0,0]);
    for (let i=0; i<c.tiles.length; i++) {
        c.tiles[i] = Math.floor(Math.random()*256);
    }
    const serialized = c.serialize();
    const deserialized = chunkDeserialize(serialized);
    equals(c, deserialized);
});

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