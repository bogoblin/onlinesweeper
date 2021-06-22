import * as React from "react";

const canvasStyle = {
    margin: '0',
    padding: '0'
}

const GameView = ({mineSocket}) => {
    const gameCanvas = React.useRef();

    React.useEffect(() => {
        mineSocket.tileView.setCanvas(gameCanvas.current);
    })

    return <canvas ref={gameCanvas} style={canvasStyle}/>
}

export default GameView;