// AddBelongsForm.jsx
import React, { useEffect, useState } from "react";

const AddtoInventory = ({ userId }) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch("http://localhost:8000/api/items");
      const data = await res.json();
      setItems(data);
    };
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/add-belong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        itemId: selectedItem,
        quantity: parseInt(quantity)
      })
    });

    if (res.ok) {
      setStatus("✅ Item added!");
      setSelectedItem("");
      setQuantity(1);
    } else {
      const msg = await res.text();
      setStatus("❌ Failed to add item: " + msg);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Item to Knapsack</h3>

      <label>Select Item</label>
      <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} required>
        <option value="">-- Select an Item --</option>
        {items.map(item => (
          <option key={item._id} value={item._id}>{item.name}</option>
        ))}
      </select>

      <label>Quantity</label>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />

      <button type="submit">Add to Inventory</button>
      {status && <p>{status}</p>}
    </form>
  );
};

export default AddtoInventory;
