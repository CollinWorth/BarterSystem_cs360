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

  // Normalize userId to string for accurate comparison
  const uid = String(userId);
  const sentHaggles = haggles.filter(h => String(h.senderId) === uid);
  const receivedHaggles = haggles.filter(h => String(h.recipientId) === uid);

  return (
    <div className={styles.currentHagglesContainer}>
      <h2>Your Current Haggles</h2>

      {/* Sent Haggles */}
      <div className={styles.section}>
        <h3>Sent Haggles</h3>
        {sentHaggles.length === 0 ? (
          <p className={styles.emptyMessage}>You haven’t sent any haggles.</p>
        ) : (
          <ul>
            {sentHaggles.map(h => (
              <li key={h.id} className={styles.haggleCard}>
                <div className={styles.haggleDetails}>
                  <div>
                    <strong>Your Offer:</strong>{' '}
                    <span>{h.senderItemQuantity} of {h.senderItemName}</span>
                  </div>
                  <div>
                    <strong>Your Request:</strong>{' '}
                    <span>{h.recipientItemQuantity} of {h.recipientItemName}</span>
                  </div>
                </div>
                <div className={styles.haggleStatus}>{h.status}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Received Haggles */}
      <div className={styles.section}>
        <h3>Received Haggles</h3>
        {receivedHaggles.length === 0 ? (
          <p className={styles.emptyMessage}>You haven’t received any haggles.</p>
        ) : (
          <ul>
            {receivedHaggles.map(h => (
              <li key={h.id} className={styles.haggleCard}>
                <div className={styles.haggleDetails}>
                  <div>
                    <strong>Sender Offer:</strong>{' '}
                    <span>{h.senderItemQuantity} of {h.senderItemName}</span>
                  </div>
                  <div>
                    <strong>Sender Request:</strong>{' '}
                    <span>{h.recipientItemQuantity} of {h.recipientItemName}</span>
                  </div>
                </div>
                <div className={styles.haggleStatus}>{h.status}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CurrentHaggles;