import {
    vectorTimesScalar, vectorSub, vectorMagnitudeSquared, vectorAdd
} from '../shared/Vector2';

import {Chunk, chunkCoords, chunkKey, chunkSize, defaultChunk} from "../shared/Chunk";
import {ChunkStore} from "../shared/ChunkStore";

class TileMap {
    constructor( images ) {
        // Load images
        this.images = {};
        for (let imageKey of Object.keys(images)) {
            const img = new Image();
            img.src = images[imageKey];
            this.images[imageKey] = img;
        }

        this.chunks = new ChunkStore();

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
        const firstChunkCoords = chunkCoords(topLeftWorldCoords);
        const lastChunkCoords = chunkCoords(bottomRightWorldCoords);

        // If the last chunk is before the first chunk then we will get stuck in an infinite loop -
        // this shouldn't happen but let's prevent against it
        if (firstChunkCoords[0] > lastChunkCoords[0] || firstChunkCoords[1] > lastChunkCoords[1]) {
            return;
        }

        // Iterate through the chunks and draw them
        for (let chunkY=firstChunkCoords[1]; chunkY<=lastChunkCoords[1]; chunkY+=chunkSize) {
            for (let chunkX=firstChunkCoords[0]; chunkX<=lastChunkCoords[0]; chunkX+=chunkSize) {
                const chunk = this.chunks.getChunk([chunkX, chunkY]);
                let chunkToDraw;
                if (chunk) {
                    chunkToDraw = chunk;
                }
                else {
                    chunkToDraw = defaultChunk;
                }
                chunkToDraw.draw(context, tileView.worldToScreen([chunkX, chunkY]), this.images, tileSize);
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

    rightClick(worldCoords) {
        if (this.socket) {
            this.socket.sendFlagMessage(worldCoords);
        }
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

        this.chunks.addChunk(new Chunk(worldTopLeft, chunk));
    }

    updateTile(worldCoords, tileId) {
        this.chunks.updateTile(worldCoords, tileId);
    }
}
export default TileMap;