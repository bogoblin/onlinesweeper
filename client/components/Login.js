import * as React from "react";

const Login = ({error, login}) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    return <div>
        <form className='loginForm' onSubmit={() => login(username, password)}>
            <input type='text' onChange={event => setUsername(event.target.value)}/>
            <input type='password' onChange={event => setPassword(event.target.value)}/>
            <input type='submit' value='Log in'/>
        </form>
        <div className='error'>
            {error}
        </div>
    </div>
}

export default Login;