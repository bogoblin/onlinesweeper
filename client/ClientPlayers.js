import {Player} from "../shared/Player.js";
import {PlayerInfo} from "./canvasUI/PlayerInfo.js";

export class ClientPlayers {
    constructor() {
        this.players = {};
    }

    updatePlayer(player) {
        const username = player.username;
        if (!this.players[username]) {
            const newPlayer = new Player(username);
            newPlayer.playerInfo = new PlayerInfo(newPlayer);
            this.players[username] = newPlayer;
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

    draw(context) {
        // todo: draw cursors, etc
    }
}