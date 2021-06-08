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
     * @param canvas {HTMLCanvasElement}
     * @param tileSize {number}
     * @param tileMap {TileMap}
     */
    constructor( canvas, tileSize, tileMap ) {
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


        this.draw();
    }

    updateCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 5;
    }

    clicked(event) {
        alert('clicked!');
    }

    drawTileToScreen(image, [screenX, screenY]) {
        this.context.drawImage(image, screenX, screenY);
    }

    draw() {
        const ts = this.tileSize;
        const { width, height } = this.canvas;
        for (let x=-ts; x<=width+ts; x+=ts) {
            for (let y=-ts; y<=height+ts; y+=ts) {
                const worldCoords = this.screenToWorldInt([x, y]);
                const screenCoords = this.worldToScreen(worldCoords);
                const tileImage = this.tileMap.getTileImage(worldCoords);
                this.drawTileToScreen(tileImage, screenCoords);
            }
        }

        requestAnimationFrame(() => {
            this.draw();
        });
    }

    screenToWorld(screenCoords) {
        const { width, height } = this.canvas;
        const ts = this.tileSize;
        const screenCenter = [width/2, height/2];

        // Calculate the vector that goes from the screen position to the center of the screen
        const screenToCenter = vectorSub(screenCenter, screenCoords);

        // Convert this into world space
        const distanceFromViewCenterInWorldSpace = vectorTimesScalar(screenToCenter, 1/ts);

        // Subtract from the view center to get result
        return vectorSub(this.viewCenter, distanceFromViewCenterInWorldSpace);
    }

    screenToWorldInt(screenCoords) {
        return this.screenToWorld(screenCoords).map((v) => Math.floor(v));
    }

    worldToScreen(worldCoords) {
        const { width, height } = this.canvas;
        const ts = this.tileSize;
        const screenCenter = [width/2, height/2];

        // Calculate the vector that goes from the world position to the world center
        const worldToCenter = vectorSub(this.viewCenter, worldCoords);

        // Convert this into screen space
        const distanceFromViewCenterInScreenSpace = vectorTimesScalar(worldToCenter, ts);

        // Subtract from the screen center to get result
        return vectorSub(screenCenter, distanceFromViewCenterInScreenSpace);
    }
}
