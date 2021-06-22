import * as React from "react";
import GameView from "./GameView.js";

const AppStates = {
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

    const handleSubmit = () => {
        setState(AppStates.Loading);

        mineSocket.connect()
            .then(() => {
                mineSocket.sendLoginMessage(username, password);
                setState(AppStates.Game);

                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
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
            </div>
        case AppStates.Loading:
            return <div>Loading...</div>
        case AppStates.Game:
            return <GameView mineSocket={mineSocket}/>
    }

    return <br/>
}
