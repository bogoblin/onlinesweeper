import {Chunk, chunkDeserialize} from './Chunk.js';
import {equals, run, test} from "./testing/Test.js";

test('Default chunk serializes and deserializes properly', () => {
    const c = new Chunk([0,0]);
    const serialized = c.serialize();
    const deserialized = chunkDeserialize(serialized);
    equals(c.tiles, deserialized.tiles);
});

test('Random chunk serializes and deserializes properly', () => {
    const c = new Chunk([0,0]);
    for (let i=0; i<c.tiles.length; i++) {
        c.tiles[i] = Math.floor(Math.random()*256);
    }
    const serialized = c.serialize();
    const deserialized = chunkDeserialize(serialized);
    equals(c.tiles, deserialized.tiles);
});


run();