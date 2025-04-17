import React, { useEffect, useState } from 'react';
import styles from './CurrentHaggles.module.scss';

const CurrentHaggles = ({ userId }) => {
  const [haggles, setHaggles] = useState([]);

  useEffect(() => {
    const fetchHaggles = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/current-haggles?userId=${userId}`);
        const data = await res.json();
        console.log("Fetched haggles:", data);
        if (Array.isArray(data)) {
          setHaggles(data);
        } else {
          console.error("Unexpected data format:", data);
          setHaggles([]);
        }
      } catch (err) {
        console.error("Failed to fetch haggles:", err);
      }
    };

    if (userId) fetchHaggles();
  }, [userId]);

  return (
  <div className={styles.currentHagglesContainer}>
    <h2>Your Current Haggles</h2>
    {haggles.length === 0 ? (
      <p className={styles.emptyMessage}>No haggles yet.</p>
    ) : (
      <ul>
        {haggles.map((haggle) => (
          <li key={haggle.id} className={styles.haggleCard}>
            <div className={styles.haggleDetails}>
              <div>
                <strong>You're offering:</strong>{' '}
                <span>{haggle.senderItemQuantity} of {haggle.senderItemName}</span>
              </div>
              <div>
                <strong>You want:</strong>{' '}
                <span>{haggle.recipientItemQuantity} of {haggle.recipientItemName}</span>
              </div>
            </div>
            <div className={styles.haggleStatus}>{haggle.status}</div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
};

export default CurrentHaggles;