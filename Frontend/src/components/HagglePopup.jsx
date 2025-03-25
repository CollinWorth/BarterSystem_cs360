import React, { useState } from "react";

const HagglePopup = ({ post, onClose }) => {
  const [dropdown1, setDropdown1] = useState("Option1");
  const [dropdown2, setDropdown2] = useState("Option1");

  const handleDropdown1Change = (e) => {
    setDropdown1(e.target.value);
  };

  const handleDropdown2Change = (e) => {
    setDropdown2(e.target.value);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Haggle for {post.title}</h2>
        <p>{post.body}</p>

        <div>
          <label>Dropdown 1</label>
          <select value={dropdown1} onChange={handleDropdown1Change}>
            <option value="Option1">Option 1</option>
            <option value="Option2">Option 2</option>
            <option value="Option3">Option 3</option>
          </select>
        </div>

        <div>
          <label>Dropdown 2</label>
          <select value={dropdown2} onChange={handleDropdown2Change}>
            <option value="Option1">Option 1</option>
            <option value="Option2">Option 2</option>
            <option value="Option3">Option 3</option>
          </select>
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default HagglePopup;