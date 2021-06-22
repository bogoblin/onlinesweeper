import TileMap from './TileMap.js';
import TileView from './TileView.js';
import MineSocket from './MineSocket.js';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const tileMap = new TileMap();
const tileView = new TileView(canvas, 16, tileMap);

const ws = new WebSocket("ws://localhost:8081");
ws.onopen = () => {
    const mineSocket = new MineSocket(ws, tileMap, tileView);
    mineSocket.sendLoginMessage('bobby', '1234');
}
