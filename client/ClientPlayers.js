import {Player} from "../shared/Player.js";
import {PlayerInfo} from "./canvasUI/PlayerInfo.js";
import {vectorAdd} from "../shared/Vector2.js";

const TWO_PI = 2*Math.PI;

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
     * @param tileView {TileView}
     */
    draw(tileView) {
        const context = tileView.context;
        const {width, height} = context.canvas;

        // draw cursors
        for (let player of Object.values(this.players)) {
            if (!player.lastClick) {
                continue;
            }
            const [x, y] = tileView.worldToScreen(vectorAdd(player.lastClick, [0.5, 0.5]));

            // todo: make it a cursor
            context.fillStyle = 'blue';
            context.beginPath()
            context.arc(x, y, 4, 0, TWO_PI);
            context.fill();
            context.font = `20px monospace`;
            context.fillText(player.username, x+5, y-10);
        }

        // if you are dead, make the screen red and show the respawn time
        if (this.me() && !this.me().isAlive()) {
            const secondsUntilRespawn = this.me().timeUntilRespawn() / 1000;
            const deathTextHeight = Math.max(width * 0.1, 200);
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