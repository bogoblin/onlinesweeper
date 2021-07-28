import * as React from "react";

const style = {
    position: 'absolute',
    left: '10px',
    top: '30px',
    backgroundColor: 'lightgrey',
    userSelect: 'none',
};

const ScoreBoard = ({players}) => {
    return <div style={style}>
        <h2 style={{margin: '10px 50px'}}>Top Players</h2>
        <ul>
            {players.map(player => <li key={player.username}>{player.username} - {player.points()}</li>)}
        </ul>
    </div>
}

export default ScoreBoard;
