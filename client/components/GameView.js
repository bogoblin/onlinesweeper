import * as React from "react";

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
        <div style={panelStyle}>
            <button onClick={() => mineSocket.logOut()}>Log out</button>
        </div>
    </div>
}

export default GameView;