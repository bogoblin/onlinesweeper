class TileMap {
    constructor( images ) {
        // Load images
        this.images = {};
        for (let imageKey of Object.keys(images)) {
            const img = new Image();
            img.src = images[imageKey];
            this.images[imageKey] = img;
        }
    }

    getTileImage([x, y]) {
        const d = Math.abs(x+y);
        if (d > 8) {
            return this.images['unrevealed'];
        }
        else {
            return this.images[d];
        }
    }

    /**
     * @param x {number}
     * @param y {number}
     * @return {boolean} true if you can drag the view from this tile, false otherwise
     */
    drag([x,y]) {
        return true;
    }
}