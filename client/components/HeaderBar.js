import * as React from "react";

const headerStyle = {
    position: 'absolute',
    left: '0',
    top: '0',
    display: 'flex',
    width: '100%',
    backgroundColor: 'grey',
    userSelect: 'none'
};

const HeaderBar = ({mineSocket}) => {
    const [username, setUsername] = React.useState('');
    const [score, setScore] = React.useState(0);

    mineSocket.onPlayerUpdate = () => {
        const me = mineSocket.players.me();
        if (!me) {
            return;
        }
        setUsername(me.username);
        setScore(me.points());
    }

    return <div style={headerStyle}>
        <button onClick={() => mineSocket.logOut()}>Log Out</button>
        <span>{username} - {score}</span>
    </div>
}

export default HeaderBar;