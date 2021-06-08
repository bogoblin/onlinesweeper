const vectorSub = (v1, v2) => {
    let v = [];
    for (let i=0; i<v1.length; i++) {
        v[i] = v1[i] - v2[i];
    }
    return v;
}

const vectorAdd = (v1, v2) => {
    let v = [];
    for (let i=0; i<v1.length; i++) {
        v[i] = v1[i] + v2[i];
    }
    return v;
}

const vectorTimesScalar = (v1, s) => {
    let v = [];
    for (let i=0; i<v1.length; i++)
    {
        v[i] = v1[i] * s;
    }
    return v;
}

class TileView {
    /**
     * @param canvas HTMLCanvasElement
     * @param tileSize number
     * @param tileMap TileMap
     * @param images Object
     */
    constructor( canvas, tileSize, tileMap, images ) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.tileSize = tileSize;
        this.tileMap = tileMap;

        this.viewCenter = [0,0];

        canvas.addEventListener('mousedown', this.clicked);
        canvas.addEventListener('contextmenu', ()=>false);

        window.addEventListener("resize", () => {
            this.updateCanvasSize();
        });
        this.updateCanvasSize();

        // Load images
        this.images = {};
        for (let imageKey of Object.keys(images)) {
            const img = new Image();
            img.src = images[imageKey];
            this.images[imageKey] = img;
        }

        this.draw();
    }

    updateCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 5;
    }

    clicked(event) {
        alert('clicked!');
    }

    drawTileToScreen(imageKey, [screenX, screenY]) {
        this.context.drawImage(this.images[imageKey], screenX, screenY);
    }

    draw() {
        for (let x=-this.tileSize; x<=this.canvas.width+this.tileSize; x+=this.tileSize) {
            for (let y=-this.tileSize; y<=this.canvas.height+this.tileSize; y+=this.tileSize) {
                const worldCoords = this.screenToWorldInt([x, y]);
                const screenCoords = this.worldToScreen(worldCoords);
                this.drawTileToScreen('flag', screenCoords);
            }
        }

        requestAnimationFrame(() => {
            this.draw();
        });
    }

    screenToWorld(screenCoords) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const screenCenter = [width/2, height/2];

        // Calculate the vector that goes from the screen position to the center of the screen
        const screenToCenter = vectorSub(screenCenter, screenCoords);

        // Convert this into world space
        const distanceFromViewCenterInWorldSpace = vectorTimesScalar(screenToCenter, 1/this.tileSize);

        // Subtract from the view center to get result
        return vectorSub(this.viewCenter, distanceFromViewCenterInWorldSpace);
    }

    screenToWorldInt(screenCoords) {
        return this.screenToWorld(screenCoords).map((v) => Math.floor(v));
    }

    worldToScreen(worldCoords) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const screenCenter = [width/2, height/2];

        // Calculate the vector that goes from the world position to the world center
        const worldToCenter = vectorSub(this.viewCenter, worldCoords);

        const distanceFromViewCenterInScreenSpace = vectorTimesScalar(worldToCenter, this.tileSize);

        return vectorSub(screenCenter, distanceFromViewCenterInScreenSpace);
    }
}
