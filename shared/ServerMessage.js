import {chunkDeserialize} from "./Chunk.js";

export const Operation = {
    Chunk: 'h',
    Tile: 't',
    Welcome: 'w'
};

export class ServerMessage {
    constructor(operation, serializable) {
        this.operation = operation;
        this.content = serializable;
    }

    serialize(pubVer = true) {
        const data = pubVer? this.content.publicSerialize() : this.content.serialize();
        const result = new Uint8Array(data.length + 1);
        result.set(Uint8Array.from([this.operation.charCodeAt(0)]), 0);
        result.set(data, 1);
        return result;
    }
}

/**
 *
 * @param data {Uint8Array}
 */
export const serverMessageDeserialize = (data) => {
    const leader = String.fromCharCode(data[0]);
    const serialized = data.slice(1);
    switch (leader) {
        case Operation.Chunk:
            return new ServerMessage(Operation.Chunk, chunkDeserialize(serialized));
        default:
    }
}