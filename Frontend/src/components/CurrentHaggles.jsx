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
    console.log("Approving haggle with ID:", haggleId); // Debugging log
    try {
      const res = await fetch("http://localhost:8000/api/finalize-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haggleId: String(haggleId) }),
      });
  
      if (res.ok) {
        fetchHaggles();
      } else {
        const error = await res.json();
        console.error("Failed to approve haggle:", error.detail);
        alert("Quantity of product no longer available.");
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

  const sentHaggles = haggles.filter(
    h => String(h.senderId) === uid && h.status !== "approved"
  );
  const receivedHaggles = haggles.filter(
    h => String(h.recipientId) === uid && h.status !== "approved"
  );

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
                      <strong>Their Offer:</strong> {h.senderItemQuantity} of {h.senderItemName}
                    </div>
                    <div>
                      <strong>Their Request:</strong> {h.recipientItemQuantity} of {h.recipientItemName}
                    </div>
                  </div>
                  <div className={styles.haggleLabels}>
                    <div className={styles.haggleStatus}>{h.status}</div>
                    <div className={`${styles.dealStatus} ${getDealClass(dealQuality)}`}>{dealQuality}</div>
                  </div>
                  {h.status === "pending" && (
                    <div className={styles.buttonGroup}>
                      <button onClick={() => handleApprove(h.id)} className={styles.haggleStatus}>Approve</button>
                      <button onClick={() => handleReject(h.id)} className={styles.haggleStatus}>Reject</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Approved Haggles */}
      <div className={styles.section}>
        <h3>Approved Haggles</h3>
        {haggles.filter(h => h.status === "approved").length === 0 ? (
          <p className={styles.emptyMessage}>You don’t have any approved haggles.</p>
        ) : (
          <ul>
            {haggles.filter(h => h.status === "approved").map(h => {
              const isSender = String(h.senderId) === uid; // Check if the user is the sender
              return (
                <li key={h.id} className={styles.haggleCard}>
                  <div className={styles.haggleDetails}>
                    <div>
                      <strong>{isSender ? "You Sent:" : "You Got:"}</strong> {isSender ? h.senderItemQuantity : h.recipientItemQuantity} of {isSender ? h.senderItemName : h.recipientItemName}
                    </div>
                    <div>
                      <strong>{isSender ? "You Got:" : "You Sent:"}</strong> {isSender ? h.recipientItemQuantity : h.senderItemQuantity} of {isSender ? h.recipientItemName : h.senderItemName}
                    </div>
                  </div>
                  <div className={styles.haggleLabels}>
                    <div className={styles.haggleStatus}>Approved</div>
                  </div>
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