import {Player} from "../shared/Player.js";

export class ClientPlayers {
    constructor() {
        this.players = {};
    }

    updatePlayer(player) {
        const username = player.username;
        if (!this.players[username]) {
            this.players[username] = new Player(username);
        }
        this.players[username] = Object.assign(this.players[username], player);
    }

    /**
     * Get the player with the given username
     * @param username
     * @returns {Player}
     */
    getPlayer(username) {
        return this.players[username];
    }

    /**
     * @returns {null|Player}
     */
    me() {
        if (!this.myUsername) {
            return null;
        }
        return this.getPlayer(this.myUsername);
    }

    setMyUsername(username) {
        this.myUsername = username;
    }
}