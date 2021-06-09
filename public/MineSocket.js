class MineSocket {
    /**
     * @param socket {WebSocket}
     * @param tileMap {TileMap}
     * @param tileView {TileView}
     */
    constructor(socket, tileMap, tileView) {
        this.socket = socket;
        this.tileMap = tileMap;
        this.tileView = tileView;

        tileMap.socket = this;
        tileView.socket = this;

        this.socket.onmessage = (ev) => {
            console.log(ev);
            this.receiveMessage(ev);
        }

        this.socket.send("asdf");
    }

    sendClickMessage([x, y]) { // c for click
        this.socket.send(`c${Math.floor(x)},${Math.floor(y)}`);
    }

    sendFlagMessage([x, y]) { // f for flag
        this.socket.send(`f${Math.floor(x)},${Math.floor(y)}`);
    }

    sendDoubleClickMessage([x, y]) { // d for double click
        this.socket.send(`d${Math.floor(x)},${Math.floor(y)}`);
    }

    sendMoveMessage([x, y]) { // m for move
        this.socket.send(`m${Math.floor(x)},${Math.floor(y)}`);
    }

    /**
     *
     * @param ev {MessageEvent}
     */
    receiveMessage(ev) {
        const data = ev.data.toString();
        if (data) {
            const leaderChar = data.charAt(0);
            switch (leaderChar) {
                case 'h': { // cHunk
                    const chunkArray = [];
                    // The next chunkSize^2 characters are encoded as readable text
                    for (let i = 1; i <= chunkSize * chunkSize; i++) {
                        chunkArray.push(data.charCodeAt(i) - 0x21);
                    }
                    // The rest of the string is the coordinates of the chunk, divided by chunk size
                    const coords = vectorTimesScalar(this.readCoords(data, chunkSize * chunkSize + 1), chunkSize);

                    this.tileMap.addChunk(coords, chunkArray);
                } break;
                case 't': { // Tile update
                    const newValue = data.charCodeAt(1) - 0x21;
                    const coords = this.readCoords(data, 2);
                    this.tileMap.updateTile(coords, newValue);
                } break;
            }
        }
    }

    /**
     *
     * @param data {String}
     * @param start {number}
     */
    readCoords(data, start) {
        return data.substr(start).split(',').map(value => parseInt(value, 10));
    }
}