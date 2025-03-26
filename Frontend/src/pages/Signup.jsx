
import React, {useState} from 'react';
import components from '../components/Signup.module.scss'
import AddressInput from '../components/AddressInput.jsx';

const Signup = () => {
  const [form, setForm] = useState({username: '', password: ''});

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //TODO Create the API to handle login logic
    console.log('Signed up ',form);
  };
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

  const handleInputChange = (e) => {
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

   return(
    <div className={components.signupContainer}>
      <form onSubmit={handleSubmit} className={components.signupForm}>
        <h2>Sign Up</h2>
        <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}/>
        <input
        type="text"
        name="email"
        placeholder='Email'
        value={form.email}
        onChange={handleChange}/>
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}/>
      <input
        type="confirmpassword"
        name="confirmpassword"
        placeholder='Confirm Password'
      />
      
      <AddressInput address={formData.address} onChange={handleAddressChange} />
         <button type='submit'>Confirm</button>
      </form>
    </div>
   );
};

export default Signup;
