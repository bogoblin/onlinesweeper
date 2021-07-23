import * as React from "react";
import GameView from "./GameView.js";
import Login from "./Login.js";

export const AppStates = {
    Login: 'login',
    Loading: 'loading',
    Game: 'game'
};

export const App = ({mineSocket}) => {
    const [state, setState] = React.useState(AppStates.Login);

    mineSocket.onError = () => {
        setState(AppStates.Login);
    }
    mineSocket.onWelcome = () => {
        setState(AppStates.Game);
    }
    mineSocket.onLogout = () => {
        setState(AppStates.Login);
    }

    const login = (username, password) => {
        console.log('handleSubmit')
        setState(AppStates.Loading);
        mineSocket.sendLoginMessage(username, password);
    }

    switch (state) {
        case AppStates.Login:
            return <Login error={mineSocket.currentError} login={login}/>
        case AppStates.Loading:
            return <div>Loading...</div>
        case AppStates.Game:
            return <GameView mineSocket={mineSocket}/>
    }

    return <br/>
}
