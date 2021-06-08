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

    drawTile(worldCoords, screenCoords, context) {
        const [x,y] = worldCoords;
        const [screenX,screenY] = screenCoords;
        const d = Math.abs(x+y);
        let img;
        if (d > 8) {
            img = this.images['unrevealed'];
        }
        else {
            img = this.images[Math.floor(d)];
        }
        context.drawImage(img, screenX, screenY);
    }

    click([x, y]) {
        alert('click!');
    }
    rightClick([x, y]) {
        alert('right click!');
    }
}