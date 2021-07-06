import {tileInfo} from "./Tile.js";

export class Player {
    username;
    socket;
    hashedPassword;
    position;

    constructor(username, hashedPassword) {
        this.username = username;
        this.hashedPassword = hashedPassword;
        this.position = [0,0];
        this.score = [];
        for (let i=0; i<=8; i++) {
            this.score.push(0);
        }

        this.deadUntil = 0;
    }

    publicVersion() {
        return {
            username: this.username,
            position: this.position,
            score: this.score,
            deadUntil: this.deadUntil
        };
    }

    connect(socket) {
        this.socket = socket;
        socket.player = this;
    }

    move(newPosition) {
        this.position = newPosition;
    }

    hasRevealed(tile) {
        const info = tileInfo(tile);

        if (info.mine) {
            // todo: kill player
        }
        else {
            this.score[info.adjacent] += 1;
        }
    }

    isAlive() {
        return Date.now() > this.deadUntil;
    }

    points() {
        let pointTotal = 0;
        for (let i=0; i<=8; i++) {
            pointTotal += this.score[i] * Math.pow(i, 4);
        }
        return pointTotal;
    }
}