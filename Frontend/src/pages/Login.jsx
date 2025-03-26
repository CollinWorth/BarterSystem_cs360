import React, {useState} from 'react';
import {useAuth} from '../context/AuthContext';

import components from '../components/Login.module.scss';


const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const { login } = useAuth();

  //const handleChange = (e) => {
  //  setForm({...form, [e.target.name]: e.target.value});
  //};

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username);
    //TODO Create the API to handle login logic
    console.log('Logging in ');
    onLoginSuccess("userdash");

  };
   return(
    <div className={components.loginContainer}>
      <form onSubmit={handleSubmit} className={components.loginForm}>
        <h2>Login</h2>
        <input
        type="text"
        name="username"
        placeholder="Username"
        //value={form.username}
        onChange={(e) => setUsername(e.target.value)}/>
        <input
           type="password"
           name="password"
           placeholder="Password"
           //value={form.password}
           //onChange={handleChange}
           />
         <button type='submit'>Login</button>
      </form>
    </div>
   );
};

export default Login;
