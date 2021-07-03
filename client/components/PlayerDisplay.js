import * as React from "react";

/**
 *
 * @param player {Player}
 * @returns {JSX.Element}
 * @constructor
 */
const PlayerDisplay = ({player}) => {
    console.log(player)
    if (player) {
        return <div>
            <h2>{player.username} - {player.points()}</h2>
            <p>0: {player.score[0]}</p>
            <p>1: {player.score[1]}</p>
            <p>2: {player.score[2]}</p>
            <p>3: {player.score[3]}</p>
            <p>4: {player.score[4]}</p>
            <p>5: {player.score[5]}</p>
            <p>6: {player.score[6]}</p>
            <p>7: {player.score[7]}</p>
            <p>8: {player.score[8]}</p>
        </div>
    }

    return <div/>;
};

export default PlayerDisplay;