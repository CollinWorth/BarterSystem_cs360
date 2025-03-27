import React from 'react';
import styles from './PostCard.module.scss';

const PostCard = ({ post, onHaggleClick }) => {
  return (
    <div className={styles['post-card-container']}> {/* Applying the more specific container */}
      <div className={styles['post-card']}>
      <div style={{ display: "flex", alignItems: "left", gap: "10px" }}>
  <h2>{post.name}</h2>
</div>
        <p>{post.description}</p>
        <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "flex-start" 
          }}>
          <p>Quantity:</p>
          <p style={{ 
              color: 'orange', 
              fontWeight: 'bold', 
              marginTop: '10px', 
              marginLeft: '25px'
          }}>
            {post.quantity}
          </p>
        </div>
        <img src={post.photo} alt="Image description" />
        <button className='styles.button' onClick={() => onHaggleClick(post)}>Haggle</button>
        
      </div>
    </div>
  );
};

export default PostCard;