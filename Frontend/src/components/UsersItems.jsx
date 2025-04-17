import React, {useEffect, useState} from 'react';
import styles from './UsersItems.module.scss';

const UsersItems = ({ userId }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
  
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
  
    if (loading) return <p>Loading inventory...</p>;
  
    return (
      <div>
        <h3>User Inventory</h3>
        {inventory.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <div className={styles.itemCardContainer}>
            {inventory.map(item => (
              <div className={styles.itemCard} key={item._id}>
                <strong>{item.name}</strong> Quantity: {item.quantity}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

export default UsersItems