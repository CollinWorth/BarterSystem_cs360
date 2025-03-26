import React from 'react';
import'./AddressInput.module.scss';

const AddressInput = ({ address, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...address, [name]: value });
  };

  return (
    <div className='address-block'>
        <input
          type="text"
          name="street"
          placeholder="Streed Address"
          value={address.street}
          onChange={handleChange}
        />
        <input
        className='smallinput'
          type="text"
          name="unit"
          placeholder="Apt Unit*"
          value={address.unit}
          onChange={handleChange}
        />
      <div className="address-inline">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={address.city}
            onChange={handleChange}
          />
          <input
            className='smallinput'
            type="text"
            name="state"
            placeholder="State"
            value={address.state}
            onChange={handleChange}
          />
      </div>

      <div className="address-inline">
          <input
          className='smallinput'
            type="text"
            name="zip"
            placeholder="Zip"
            value={address.zip}
            onChange={handleChange}
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={address.country}
            onChange={handleChange}
          />
      </div>
    </div>
  );
};

export default AddressInput;
