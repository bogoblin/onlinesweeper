import * as React from "react";
import PlayerDisplay from "./PlayerDisplay.js";
import HeaderBar from "./HeaderBar.js";

const canvasStyle = {
    margin: '0',
    padding: '0'
}

const panelStyle = {
    position: 'absolute',
    left: '5px',
    top: '5px',
}

const GameView = ({mineSocket}) => {
    const gameCanvas = React.useRef();

    React.useEffect(() => {
        mineSocket.tileView.setCanvas(gameCanvas.current);
    })


    return <div>
        <canvas ref={gameCanvas} style={canvasStyle}/>
        <HeaderBar mineSocket={mineSocket}/>
    </div>
}

export default GameView;