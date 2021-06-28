import {equals, run, test} from "./testing/Test.js";
import {Chunk, chunkDeserialize} from "./Chunk.js";
import {Operation, ServerMessage, serverMessageDeserialize} from "./ServerMessage.js";

test('Chunk serializes and deserializes properly', () => {
    const c = new Chunk([(Math.random()-0.5)*2000000000,(Math.random()-0.5)*2000000000]);
    for (let i=0; i<c.tiles.length; i++) {
        c.tiles[i] = Math.floor(Math.random()*256);
    }
    const message = new ServerMessage(Operation.Chunk, c);
    const serialized = message.serialize(false);
    equals('h', String.fromCharCode(serialized[0]));

    const deserialized = serverMessageDeserialize(serialized).content;

    equals(c, deserialized);
})

run();
