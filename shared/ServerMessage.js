import {chunkDeserialize} from "./Chunk.js";

export const Operation = {
    Chunk: 'h',
    General: '/'
};

export const GeneralMessages = {
    Welcome: 'w',
    Error: 'e',
    Player: 'p',
}

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

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class GeneralMessage {
    constructor(message) {
        this.message = message;
    }

    serialize() {
        return encoder.encode(JSON.stringify(this.message));
    }

    publicSerialize() {
        return this.serialize();
    }
}

export const serverGeneralMessage = (generalMessage) => {
    return new ServerMessage(Operation.General, generalMessage);
}

export const welcome = player => {
    return new GeneralMessage({
        messageType: GeneralMessages.Welcome,
        username: player.username
    });
}

export const error = err => {
    return new GeneralMessage({
        messageType: GeneralMessages.Error,
        err
    });
}

export const playerMessage = playerToSend => {
    const publicPlayer = {
        username: playerToSend.username,
        position: playerToSend.position,
        score: playerToSend.score,
        deadUntil: playerToSend.deadUntil
    };
    return new GeneralMessage({
        messageType: GeneralMessages.Player,
        player: publicPlayer
    });
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
        case Operation.General:
            return new ServerMessage(Operation.General, JSON.parse(decoder.decode(serialized)));
        default:
    }
}