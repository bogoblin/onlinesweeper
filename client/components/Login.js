import * as React from "react";

const Login = ({error, login}) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    return <div>
        <form className='loginForm' onSubmit={() => login(username, password)}>
            <h1>minesweeper.monster</h1>
            <span>Infinite collaborative online minesweeper</span>
            <h2>Log in or register:</h2>
            <label htmlFor='username'>Username: </label>
            <input id='username' type='text' onChange={event => setUsername(event.target.value)}/>
            <label htmlFor='password'>Password: </label>
            <input id='password' type='password' onChange={event => setPassword(event.target.value)}/>
            <br/>
            <input type='submit' value='Log in'/>
            <br/>
            <div className='error'>
                {error? error.reason:''}
            </div>
        </form>
    </div>
}

export default Login;