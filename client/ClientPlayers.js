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

    /**
     *
     * @param context {CanvasRenderingContext2D}
     */
    draw(context) {
        const {width, height} = context.canvas;
        // todo: draw cursors, etc

        // if you are dead, make the screen red and show the respawn time
        if (this.me() && !this.me().isAlive()) {
            const secondsUntilRespawn = this.me().timeUntilRespawn() / 1000;
            const deathTextHeight = height * 0.4;
            context.font = `${deathTextHeight}px monospace`;
            context.fillStyle = 'black';
            context.textBaseline = 'middle';
            context.textAlign = 'center';
            context.fillText(secondsUntilRespawn.toFixed(1), width/2, height/2);

            context.font = `${deathTextHeight * 0.2}px monospace`;
            context.fillText('You are dead. Respawning...', width/2, height/2 - deathTextHeight/2 - deathTextHeight*0.05);

            const deathOverlayOpacity = Math.min(0.3, secondsUntilRespawn*0.3);
            context.fillStyle = `rgba(255, 0, 0, ${deathOverlayOpacity})`;
            context.fillRect(0, 0, width, height);
        }
    }
}