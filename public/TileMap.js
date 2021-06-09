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

        // To be set externally to a {MineSocket}
        this.socket = undefined;

        this.lastClicked = 0;
    }

    draw(
        topLeftWorldCoords,
        topLeftScreenCoords,
        bottomRightWorldCoords,
        context,
        tileSize,
        tileView
    ) {
        const firstChunkCoords = this.chunkCoords(topLeftWorldCoords);
        const lastChunkCoords = this.chunkCoords(bottomRightWorldCoords);

        // If the last chunk is before the first chunk then we will get stuck in an infinite loop -
        // this shouldn't happen but let's prevent against it
        if (firstChunkCoords[0] > lastChunkCoords[0] || firstChunkCoords[1] > lastChunkCoords[1]) {
            return;
        }

        // Iterate through the chunks and draw them
        for (let chunkY=firstChunkCoords[1]; chunkY<=lastChunkCoords[1]; chunkY+=chunkSize) {
            for (let chunkX=firstChunkCoords[0]; chunkX<=lastChunkCoords[0]; chunkX+=chunkSize) {
                const [chunk, _] = this.chunkAndIndex([chunkX, chunkY]);
                this.drawChunk(chunk, tileView.worldToScreen([chunkX, chunkY]), context, tileSize);
            }
        }
    }

    drawChunk(chunk, screenCoords, context, tileSize) {
        // todo: Don't re-render chunks every frame
        const [screenX, screenY] = screenCoords;
        if (chunk) {
            let index = 0;
            for (let row=0; row<chunkSize; row++) {
                for (let col=0; col<chunkSize; col++) {
                    const tileId = chunk[index];
                    const img = this.images[tileId];

                    context.drawImage(img, screenX+col*tileSize, screenY+row*tileSize);
                    index++;
                }
            }
        }
        else {
            for (let row=0; row<chunkSize; row++) {
                for (let col=0; col<chunkSize; col++) {
                    const img = this.images[10];
                    context.drawImage(img, screenX+col*tileSize, screenY+row*tileSize);
                }
            }
        }
    }

    doubleClickTime = 100; // milliseconds
    click(worldCoords) {
        if (this.socket) {
            if (performance.now() - this.lastClicked < this.doubleClickTime) {
                this.socket.sendDoubleClickMessage(worldCoords);
            }
            else {
                this.socket.sendClickMessage(worldCoords);
            }
        }
    }
    rightClick([x, y]) {
        if (this.socket) {
            this.socket.sendFlagMessage(worldCoords);
        }
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
                newChunk[i] = 10;
            }
        }

        this.chunks[this.chunkKey(worldTopLeft)] = newChunk;
    }

    updateTile(worldCoords, tileId) {
        const [chunk, index] = this.chunkAndIndex(worldCoords);
        chunk[index] = tileId;
    }
}