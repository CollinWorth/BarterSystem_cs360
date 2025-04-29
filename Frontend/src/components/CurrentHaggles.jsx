import React, { useEffect, useState } from 'react';
import styles from './CurrentHaggles.module.scss';

const CurrentHaggles = ({ userId }) => {
  const [haggles, setHaggles] = useState([]);

  const fetchHaggles = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/current-haggles?userId=${userId}`);
      const data = await res.json();
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

  useEffect(() => {
    if (userId) fetchHaggles();
  }, [userId]);

  const handleApprove = async (haggleId) => {
    try {
      const res = await fetch("http://localhost:8000/api/finalize-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haggleId }),
      });

      if (res.ok) {
        fetchHaggles();
      } else {
        const error = await res.json();
        console.error("Failed to approve haggle:", error.detail);
        alert("Quantity of product no longer availible.");
      }
    } catch (err) {
      console.error("Error approving haggle:", err);
    }
  };

  const handleReject = async (haggleId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/delete-haggle/${haggleId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchHaggles();
      } else {
        const error = await res.json();
        console.error("Failed to reject haggle:", error.detail);
      }
    } catch (err) {
      console.error("Error rejecting haggle:", err);
    }
  };

  const calculateDealValue = (haggle, isSender) => {
    const senderTotalValue = haggle.senderItemQuantity * (haggle.senderItemRelativeValue ?? 0);
    const recipientTotalValue = haggle.recipientItemQuantity * (haggle.recipientItemRelativeValue ?? 0);

    if (isSender) {
      if (recipientTotalValue > senderTotalValue) return "Good Deal!";
      if (recipientTotalValue < senderTotalValue) return "Bad Deal";
      return "Even Trade";
    } else {
      if (senderTotalValue > recipientTotalValue) return "Good Deal!";
      if (senderTotalValue < recipientTotalValue) return "Bad Deal";
      return "Even Trade";
    }
  };

  const getDealClass = (dealQuality) => {
    switch (dealQuality) {
      case "Good Deal!":
        return styles.goodDeal;
      case "Bad Deal":
        return styles.badDeal;
      case "Even Trade":
        return styles.evenDeal;
      default:
        return "";
    }
  };

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
            {sentHaggles.map(h => {
              const dealQuality = calculateDealValue(h, true);
              return (
                <li key={h.id} className={styles.haggleCard}>
                  <div className={styles.haggleDetails}>
                    <div>
                      <strong>Your Offer:</strong> {h.senderItemQuantity} of {h.senderItemName}
                    </div>
                    <div>
                      <strong>Your Request:</strong> {h.recipientItemQuantity} of {h.recipientItemName}
                    </div>
                  </div>
                  <div className={styles.haggleLabels}>
                    <div className={styles.haggleStatus}>{h.status}</div>
                    <div className={`${styles.dealStatus} ${getDealClass(dealQuality)}`}>{dealQuality}</div>
                  </div>
                </li>
              );
            })}
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
            {receivedHaggles.map(h => {
              const dealQuality = calculateDealValue(h, false);
              return (
                <li key={h.id} className={styles.haggleCard}>
                  <div className={styles.haggleDetails}>
                    <div>
                      <strong>Sender Offer:</strong> {h.senderItemQuantity} of {h.senderItemName}
                    </div>
                    <div>
                      <strong>Sender Request:</strong> {h.recipientItemQuantity} of {h.recipientItemName}
                    </div>
                  </div>
                  <div className={styles.haggleLabels}>
                    <div className={styles.haggleStatus}>{h.status}</div>
                    <div className={`${styles.dealStatus} ${getDealClass(dealQuality)}`}>{dealQuality}</div>
                  </div>
                  {h.status === "pending" && (
                    <div className={styles.buttonGroup}>
                      <button onClick={() => handleApprove(h.id)} className={styles.approve}>Approve</button>
                      <button onClick={() => handleReject(h.id)} className={styles.reject}>Reject</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CurrentHaggles;