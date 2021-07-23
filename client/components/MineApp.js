import * as React from "react";
import GameView from "./GameView.js";

export const AppStates = {
    Login: 'login',
    Loading: 'loading',
    Game: 'game'
};

export const App = ({mineSocket}) => {
    const [state, setState] = React.useState(AppStates.Login);

    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    mineSocket.onError = () => {
        setState(AppStates.Login);
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
        console.log('handleSubmit')
        setState(AppStates.Loading);
        mineSocket.sendLoginMessage(username, password);
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
