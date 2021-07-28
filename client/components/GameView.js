import * as React from "react";
import UI from "./UI.js";

const canvasStyle = {
    margin: '0',
    padding: '0'
}

const GameView = ({mineSocket}) => {
    const gameCanvas = React.useRef();

    React.useEffect(() => {
        mineSocket.tileView.setCanvas(gameCanvas.current);
    });

    return <div>
        <canvas ref={gameCanvas} style={canvasStyle}/>
        <UI mineSocket={mineSocket}/>
    </div>
}

export default GameView;