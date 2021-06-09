import {readCoords} from "./SerializeUtils.js";

export const Operation = {
    Click: 'c',
    Flag: 'f',
    DoubleClick: 'd',
    Move: 'm'
};

export class UserMessage {
    constructor(operation, worldCoords) {
        this.operation = operation;
        this.worldCoords = worldCoords.map(c => Math.floor(c));
    }

    serialize() {
        const [x, y] = this.worldCoords;
        return `${this.operation}${x},${y}`;
    }
}
export const userMessageDeserialize = (d) => {
    const data = d.toString();
    const operation = data.charAt(0);
    const coords = readCoords(data, 1);
    return new UserMessage(operation, coords);
}