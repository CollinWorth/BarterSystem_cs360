import React, { useEffect, useState } from 'react';
import styles from './UsersItems.module.scss';

const UsersItems = ({ userId }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ visible: false, x: 0, y: 0, itemId: null });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/user-inventory?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch inventory");
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchInventory();
  }, [userId]);

  const handleItemClick = (e, itemId) => {
    setPopup({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      itemId,
    });
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/delete-item/${popup.itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Failed to delete item");
      setInventory(inventory.filter(item => item._id !== popup.itemId));
      setPopup({ visible: false, x: 0, y: 0, itemId: null });
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleClosePopup = () => {
    setPopup({ visible: false, x: 0, y: 0, itemId: null });
  };

  if (loading) return <p>Loading inventory...</p>;

  return (
    <div>
      <h3>User Inventory</h3>
      {inventory.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <div className={styles.itemCardContainer}>
          {inventory.map(item => (
            <div
              className={styles.itemCard}
              key={item._id}
              onClick={(e) => handleItemClick(e, item._id)}
            >
              <strong>{item.name}</strong> Quantity: {item.quantity}
            </div>
          ))}
        </div>
      )}

      {popup.visible && (
        <div
          className={styles.popup}
          style={{ top: popup.y, left: popup.x }}
        >
          <p>Delete this item?</p>
          <button onClick={handleDelete}>Yes</button>
          <button onClick={handleClosePopup}>No</button>
        </div>
      )}
    </div>
  );
};

export default UsersItems;