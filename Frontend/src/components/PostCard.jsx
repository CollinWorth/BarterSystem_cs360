import React from 'react';
import styles from './PostCard.module.scss';

const PostCard = ({ post, onHaggleClick }) => {
  const { offered_item_details, requested_item_details } = post;

  return (
    <div className={styles.postCardContainer}> 
      <div className={styles.postCard}>

        {/* Offered Item */}
        <div className={styles.itemSection}>
          <h3>Offering</h3>
          <h2>{offered_item_details.name}</h2>
          <p>{offered_item_details.description}</p>
          <p><strong>Quantity:</strong> {post.offered_quantity}</p>
          <img 
            className={styles.itemImage}
            src={offered_item_details.photo}
            alt="Offered item"
          />
        </div>

        {/* Requested Item */}
        <div className={styles.itemSection}>
          <h3>Wants</h3>
          <h2>{requested_item_details.name}</h2>
          <p>{requested_item_details.description}</p>
          <p><strong>Quantity:</strong> {post.requested_quantity}</p>
          <img 
            className={styles.itemImage}
            src={requested_item_details.photo}
            alt="Requested item"
          />
        </div>

        {/* Haggle Button */}
        <div className={styles.actionSection}>
          <button className={styles.button} onClick={() => onHaggleClick(post)}>
            Haggle
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default PostCard;