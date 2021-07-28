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

const HeaderBar = ({me, mineSocket}) => {
    if (!me) {
        return <div></div>;
    }
    return <div style={headerStyle}>
        <button onClick={() => mineSocket.logOut()}>Log Out</button>
        <span>{me.username} - {me.points()}</span>
    </div>
}

export default HeaderBar;