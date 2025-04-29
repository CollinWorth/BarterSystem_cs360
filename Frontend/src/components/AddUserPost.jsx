import React, { useState, useEffect } from "react";
import styles from "./AddUserPosts.module.scss"; // Import the SCSS module

const AddUserPost = ({ userId }) => {
  const [inventory, setInventory] = useState([]);
  const [globalItems, setGlobalItems] = useState([]);
  const [status, setStatus] = useState("");

  const [formData, setFormData] = useState({
    offered_item_id: "",
    offered_quantity: 1,
    requested_item_id: "",
    requested_quantity: 1,
    post_status: "posted"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, globalRes] = await Promise.all([
          fetch(`http://localhost:8000/api/user-inventory?userId=${userId}`),
          fetch("http://localhost:8000/api/items")
        ]);

        const invData = await invRes.json();
        const globalData = await globalRes.json();

        setInventory(invData);
        setGlobalItems(globalData);
      } catch (err) {
        console.error("❌ Error loading inventory or items", err);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name.includes("quantity") ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");

    const payload = {
      ...formData,
      userId: userId,
      post_status: "posted"
    };

    try {
      const res = await fetch("http://localhost:8000/api/trade-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const data = await res.json();
      setStatus(`✅ Trade listing created! ID: ${data.id}`);
      setFormData({
        offered_item_id: "",
        offered_quantity: 1,
        requested_item_id: "",
        requested_quantity: 1,
        post_status: "posted"
      });
    } catch (err) {
      console.error("❌ Failed to create listing:", err);
      setStatus("❌ Error: Could not create listing.");
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Create Post</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="offered_item_id">What are you offering?</label>
        <select
          name="offered_item_id"
          value={formData.offered_item_id}
          onChange={handleChange}
          required
          className={styles.input}
        >
          <option value="">-- Select from your inventory --</option>
          {inventory.map(item => (
            <option key={item.itemId} value={item.itemId}>
              {item.name} (x{item.quantity})
            </option>
          ))}
        </select>

        <input
          type="number"
          name="offered_quantity"
          value={formData.offered_quantity ?? 1}
          min="1"
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label htmlFor="requested_item_id">What would you like to receive?</label>
        <select
          name="requested_item_id"
          value={formData.requested_item_id}
          onChange={handleChange}
          required
          className={styles.input}
        >
          <option value="">-- Select from global items --</option>
          {globalItems.map(item => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="requested_quantity"
          value={formData.requested_quantity ?? 1}
          min="1"
          onChange={handleChange}
          required
          className={styles.input}
        />

        <button type="submit" className={styles.button}>
          Submit Post
        </button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
};

export default AddUserPost;
