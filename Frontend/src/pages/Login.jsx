import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import components from '../components/Login.module.scss';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        login(data.username); // Auth context login
        onLoginSuccess("userdash"); // redirect
      } else {
        const errorData = await response.json();
        console.warn("Login failed:", errorData);
  
        if (response.status === 401) {
          const errorData = await response.json();
          if (errorData.detail === "Account not found. Please sign up.") {
            alert("We couldn't find your account. You might need to sign up first!");
          } else if (errorData.detail === "Incorrect password.") {
            alert("Wrong password. Please try again.");
          } else {
            alert("Login failed: " + errorData.detail);
          }
        }
        
      }
    } catch (err) {
      console.error("❌ Network error:", err.message);
      alert("Network error. Please try again.");
    }
  };
  
  

  return (
    <div className={components.loginContainer}>
      <form onSubmit={handleSubmit} className={components.loginForm}>
        <h2>Login</h2>
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
