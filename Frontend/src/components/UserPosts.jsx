import React, { useEffect, useState } from "react";
import styles from './UsersPosts.module.scss';

const UserPosts = ({ userId }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const statusLabels = {
    posted: "Posted",
    pendingoffer: "Pending Offer",
    complete: "Complete"
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/user-listings?userId=${userId}`);
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchListings();
  }, [userId]);

  if (loading) return <p>Loading your listings...</p>;

  return (
    <div>
      <h2>My Trade Listings</h2>
      {listings.length === 0 ? (
        <p>No listings yet.</p>
      ) : (
        <div className={styles.itemCardContainer}>
          {listings.map((listing) => (
            <div className={styles.itemCard} key={listing._id}>
              <p><strong>Offering:</strong> {listing.offered_quantity} of item {listing.offered_item_name}</p>
              <p><strong>Wants:</strong> {listing.requested_quantity} of item {listing.requested_item_name}</p>
              <p><strong>Status:</strong> {statusLabels[listing.post_status] || listing.post_status}</p> 
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPosts;
