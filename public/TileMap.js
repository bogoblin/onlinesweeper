const chunkSize = 16;

class TileMap {
    constructor( images ) {
        // Load images
        this.images = {};
        for (let imageKey of Object.keys(images)) {
            const img = new Image();
            img.src = images[imageKey];
            this.images[imageKey] = img;
        }

        this.chunks = {};
    }

    drawTile(worldCoords, screenCoords, context) {
        const [x,y] = worldCoords;
        const chunk = this.chunks[this.chunkKey(worldCoords)];
        let img;
        if (chunk) {
            const [chunk, index] = this.chunkAndIndex(worldCoords);
            img = this.images[chunk[index]];
        }
        else {
            img = this.images[0];
        }

        if (img) {
            const [screenX,screenY] = screenCoords;
            context.drawImage(img, screenX, screenY);
        }
    }

    click([x, y]) {
        alert('click!');
    }
    rightClick([x, y]) {
        alert('right click!');
    }

    chunkCoords([x,y]) {
        return [
            Math.floor(x/chunkSize)*chunkSize,
            Math.floor(y/chunkSize)*chunkSize
        ];
    }

    chunkAndIndex(worldCoords) {
        const chunkCoords = this.chunkCoords(worldCoords);
        const row = worldCoords[1] - chunkCoords[1];
        const col = worldCoords[0] - chunkCoords[0];
        const indexInChunk = row*chunkSize + col;

        return [this.chunks[this.chunkKey(chunkCoords)], indexInChunk];
    }

    chunkKey(worldCoords) {
        const worldTopLeft = this.chunkCoords(worldCoords);
        return `${worldTopLeft[0]},${worldTopLeft[1]}`;
    }

    /**
     *
     * @param worldTopLeft {[number, number]}
     * @param chunk {number[]}
     */
    addChunk(worldTopLeft, chunk) {
        let newChunk = chunk;
        if (chunk.length !== chunkSize*chunkSize) {
            for (let i=chunk.length; i<chunkSize*chunkSize; i++) {
                newChunk[i] = 0;
            }
        }

        this.chunks[this.chunkKey(worldTopLeft)] = newChunk;
    }

    updateTile(worldCoords, tileId) {
        const [chunk, index] = this.chunkAndIndex(worldCoords);
        chunk[index] = tileId;
    }
}