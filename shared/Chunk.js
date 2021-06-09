const chunkSize = 16;
class Chunk {
    constructor(coords) {
        this.coords = coords;
        this.tiles = []; // public version - both client and server have this
        for (let i=0; i<chunkSize*chunkSize; i++) {
            this.tiles.push(i%9); // todo: actually generate this properly
        }
    }

    /**
     * @param socket {WebSocket}
     */
    send(socket) {
        const chunkData = this.tiles.map(v => v+0x21).map(v => String.fromCharCode(v)).join('');
        socket.send(`h${chunkData}${this.coords[0]/chunkSize},${this.coords[1]/chunkSize}`);
    }
}
module.exports = {
    Chunk: Chunk,
    chunkSize: chunkSize
};