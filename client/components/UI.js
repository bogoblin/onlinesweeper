import * as React from "react";
import HeaderBar from "./HeaderBar.js";
import ScoreBoard from "./ScoreBoard.js";

const style = {
    position: 'absolute',
    left: '0',
    top: '0',
    userSelect: 'none',
};

const UI = ({mineSocket}) => {
    const [me, setMe] = React.useState(null);
    const [scoreboard, setScoreboard] = React.useState([]);

    mineSocket.onPlayerUpdate = () => {
        setMe(mineSocket.players.me());
        setScoreboard(mineSocket.players.playersSortedByScore(10));
    }
    return <div>
        <HeaderBar me={me} mineSocket={mineSocket}/>
        <ScoreBoard players={scoreboard}/>;
    </div>
}

export default UI;