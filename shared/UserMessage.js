import {readCoords} from "./SerializeUtils.js";
import {vectorFloor} from "./Vector2.js";

export const Operation = {
    Click: 'c',
    Flag: 'f',
    DoubleClick: 'd',
    Move: 'm',
    Login: 'l'
};

export class UserMessage {
    constructor(message) {
        this.message = message;
    }

    serialize() {
        return JSON.stringify(this.message);
    }
}
export const userMessageDeserialize = (d) => {
    return JSON.parse(d);
}

export const coordsMessage = (operation, coords) => {
    return new UserMessage({
        operation: operation,
        worldCoords: vectorFloor(coords)
    });
}

export const loginMessage = (username, password) => {
    return new UserMessage({
        operation: Operation.Login,
        username, password
    });
}