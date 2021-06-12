import {
    vectorTimesScalar, vectorSub, vectorMagnitudeSquared, vectorAdd
} from '../shared/Vector2'

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

        canvas.addEventListener('mousedown', this.clicked.bind(this));
        canvas.addEventListener('mouseup', this.mouseUp.bind(this));
        canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        canvas.addEventListener('contextmenu', ()=>false); // disable right click menu

        window.addEventListener("resize", () => {
            this.updateCanvasSize();
        });
        this.updateCanvasSize();

        this.drag = {
            dragging: false,
            dragStartScreen: [0,0],
            viewCenterOnDragStart: [0,0]
        }

        this.draw();

        // Set by MineSocket
        this.socket = undefined;
    }

    updateCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 5;
    }

    /**
     *
     * @param event {MouseEvent}
     */
    clicked(event) {
        const screenCoords = [event.clientX, event.clientY];
        const worldCoords = this.screenToWorld(screenCoords);

        this.drag.dragging = true;
        this.drag.dragStartScreen = screenCoords;
        this.drag.viewCenterOnDragStart = this.viewCenter;
    }

    /**
     *
     * @param event {MouseEvent}
     */
    mouseUp(event) {
        if (this.drag.dragging) {
            this.drag.dragging = false;

            const screenCoords = [event.clientX, event.clientY];
            const dragVector = vectorSub(this.drag.dragStartScreen, screenCoords);
            if (vectorMagnitudeSquared(dragVector) < 1) {
                // Dragging hasn't happened, so we send a click to the tile map
                const worldCoords = this.screenToWorld(screenCoords);
                switch (event.button) {
                    case 0: // left click
                        this.tileMap.click(worldCoords);
                        break;
                    case 2: // right click
                        this.tileMap.rightClick(worldCoords);
                        break;
                    default:
                }
            }
            else {
                if (this.socket) {
                    this.socket.sendMoveMessage(this.viewCenter);
                }
            }
        }
    }

    /**
     *
     * @param event {MouseEvent}
     */
    mouseMove(event) {
        if (this.drag.dragging) {
            const screenCoords = [event.clientX, event.clientY];
            const dragVector = vectorSub(this.drag.dragStartScreen, screenCoords);
            const dragVectorInWorldSpace = vectorTimesScalar(dragVector, 1/this.tileSize);
            this.viewCenter = vectorAdd(this.drag.viewCenterOnDragStart, dragVectorInWorldSpace);
        }
    }

    draw() {
        const { width, height } = this.canvas;
        const topLeftWorldCoords = this.screenToWorldInt([0,0]);
        const bottomRightWorldCoords = this.screenToWorldInt([width, height]);
        this.tileMap.draw(
            topLeftWorldCoords,
            bottomRightWorldCoords,
            this.context,
            this.tileSize,
            this
        );

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
export default TileView;