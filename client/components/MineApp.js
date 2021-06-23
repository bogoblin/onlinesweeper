import * as React from "react";
import GameView from "./GameView.js";

export const AppStates = {
    Login: 'login',
    Loading: 'loading',
    Game: 'game'
};

export const App = ({mineSocket}) => {
    const [state, setState] = React.useState(AppStates.Login);

    const initialUsername = localStorage.getItem('username') || '';
    const [username, setUsername] = React.useState(initialUsername);

    const initialPassword = localStorage.getItem('password') || '';
    const [password, setPassword] = React.useState(initialPassword);

    mineSocket.onError = () => {
        setState(AppStates.Login)
    }
    mineSocket.onWelcome = () => {
        setState(AppStates.Game);

        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
    }
    mineSocket.onLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        setState(AppStates.Login);
    }

    const handleSubmit = () => {
        setState(AppStates.Loading);

        mineSocket.connect()
            .then(() => {
                mineSocket.sendLoginMessage(username, password);
            })
            .catch(err => {
                setState(AppStates.Login)
            })
    }

    if (state === AppStates.Login && initialUsername && initialPassword) {
        handleSubmit();
    }

    switch (state) {
        case AppStates.Login:
            return <div>
                <form onSubmit={handleSubmit}>
                    <input type='text' value={username} onChange={event => setUsername(event.target.value)}/>
                    <input type='password' value={password} onChange={event => setPassword(event.target.value)}/>
                    <input type='submit' value='Log in'/>
                </form>
                <div className='error'>
                    {mineSocket.currentError}
                </div>
            </div>
        case AppStates.Loading:
            return <div>Loading...</div>
        case AppStates.Game:
            return <GameView mineSocket={mineSocket}/>
    }

    return <br/>
}
