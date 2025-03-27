import React, { useState } from 'react';
import components from '../components/Signup.module.scss';
import AddressInput from '../components/AddressInput.jsx';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    address: {
      street: '',
      unit: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (updatedAddress) => {
    setFormData((prev) => ({
      ...prev,
      address: updatedAddress,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Confirm button pressed");
    console.log("Sending formData:", formData); // 👈 Log what you're actually sending
  
    const confirmPassword = document.querySelector('[name="confirmpassword"]').value;
    if (formData.password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      console.log("Raw response:", response);
  
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Successfully registered", data);
      } else {
        const err = await response.json();
        console.error("❌ Registration failed:", err.detail);
        alert("Error: " + err.detail);
      }
    } catch (err) {
      console.error("❌ Network error:", err.message);
      alert("Network error");
    }
  };
  
  return (
    <div className={components.signupContainer}>
      <form onSubmit={handleSubmit} className={components.signupForm}>
        <h2>Sign Up</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmpassword"
          placeholder="Confirm Password"
        />
        <AddressInput address={formData.address} onChange={handleAddressChange} />
        <button type="submit">Confirm</button>
      </form>
    </div>
  );
};

export default Signup;
