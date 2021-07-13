import * as React from "react";
import PlayerDisplay from "./PlayerDisplay.js";

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

    const [player, setPlayer] = React.useState(null);

    mineSocket.onPlayerUpdate = () => {
        setPlayer(mineSocket.players.me());
    }

    return <div>
        <canvas ref={gameCanvas} style={canvasStyle}/>
        <div style={panelStyle}>
            <button onClick={() => mineSocket.logOut()}>Log out</button>
            <PlayerDisplay player={player}/>
        </div>
    </div>
}

export default GameView;