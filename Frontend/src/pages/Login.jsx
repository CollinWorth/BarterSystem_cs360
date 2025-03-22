import React, {useState} from 'react';
import components from '../components/Login.module.scss'

const Login = () => {
  const [form, setForm] = useState({username: '', password: ''});

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //TODO Create the API to handle login logic
    console.log('Logging in ',form);
  };
   return(
    <div className={components.loginContainer}>
      <form onSubmit={handleSubmit} className={components.loginForm}>
        <h2>Login</h2>
        <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}/>
        <input
           type="password"
           name="password"
           placeholder="Password"
           value={form.password}
           onChange={handleChange}/>
         <button type='submit'>Login</button>
      </form>
    </div>
   );
};

export default Login;
