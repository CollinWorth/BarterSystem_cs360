// src/components/AddItemForm.jsx
import React, { useState } from "react";
import styles from './ItemForm.module.scss';

const AddItemForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    relative_value: ""
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error("Failed to add item");
      }

      const data = await res.json();
      setStatus("✅ Item added successfully!");
      console.log("New item ID:", data.id);
      setFormData({ name: "", description: "", image: "",relative_value: "" }); // reset
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to add item.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles["add-item-form"]}>
      <h3>Add New Item</h3>

      <label htmlFor="name">Name</label>
  <input
    type="text"
    id="name"
    name="name"
    value={formData.name}
    onChange={handleChange}
    required
  />

  <label htmlFor="description">Description</label>
  <textarea
    id="description"
    name="description"
    value={formData.description}
    onChange={handleChange}
    required
  />

  <label htmlFor="image">Image URL</label>
  <input
    type="text"
    id="image"
    name="image"
    value={formData.image}
    onChange={handleChange}
  />

  <label htmlFor="relative_value">Relative Value</label>
  <input
    type="number"
    id="relative_value"
    name="relative_value"
    value={formData.relative_value}
    onChange={handleChange}
  />

  <button type="submit">Add Item</button>
      {status && <p>{status}</p>}
    </form>
  );
};

export default AddItemForm;
