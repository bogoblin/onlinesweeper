import TileMap from './TileMap';
import TileView from './TileView';
import MineSocket from './MineSocket';

const tiles = require('./tiles/*.png');

let images = {};

for (let i=0; i<=8; i++) {
    images[i] = tiles[i];
}
images[10] = tiles['unrevealed'];
images[11] = tiles['flag'];
images[12] = tiles['mine'];
images[13] = tiles['clickedmine'];

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const tileMap = new TileMap(images);
const tileView = new TileView(canvas, 16, tileMap);

const ws = new WebSocket("ws://localhost:8081");
ws.onopen = () => {
    const mineSocket = new MineSocket(ws, tileMap, tileView);
    mineSocket.sendLoginMessage('bobby', '1234');
}
