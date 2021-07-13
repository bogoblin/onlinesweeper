import { vectorTimesScalar, vectorSub, vectorMagnitudeSquared, vectorAdd } from '../shared/Vector2.js'

class TileView {
    /**
     * @param tileSize {number}
     * @param tileMap {TileMap}
     * @param players {ClientPlayers}
     */
    constructor( tileSize, tileMap, players ) {
        this.tileSize = tileSize;
        this.tileMap = tileMap;
        this.players = players;

        this.viewCenter = [0,0];

        this.setCanvas(document.createElement('canvas'));

        window.addEventListener("resize", () => {
            this.updateCanvasSize();
        });

        this.drag = {
            dragging: false,
            dragStartScreen: [0,0],
            viewCenterOnDragStart: [0,0]
        }

        // Set by MineSocket
        this.socket = undefined;
    }

    setCanvas(newCanvas) {
        if (!newCanvas) {
            return;
        }
        this.canvas = newCanvas;
        this.context = this.canvas.getContext('2d');
        this.canvas.addEventListener('mousedown', this.clicked.bind(this));
        this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        this.canvas.oncontextmenu = () => false; // disable right click

        this.updateCanvasSize();
        this.draw();
    }

    updateCanvasSize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    getScreenCoords(event) {
        const {left, top} = this.canvas.getBoundingClientRect();
        const screenCoords = [event.clientX, event.clientY];

        return vectorSub(screenCoords, [left, top]);
    }

    /**
     *
     * @param event {MouseEvent}
     */
    clicked(event) {
        const screenCoords = this.getScreenCoords(event);

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

            const screenCoords = this.getScreenCoords(event);
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
            const screenCoords = this.getScreenCoords(event);
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

        this.players.draw(this.context);

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