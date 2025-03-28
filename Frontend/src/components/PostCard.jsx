import React from 'react';
import styles from './PostCard.module.scss';

const PostCard = ({ post, onHaggleClick }) => {
  return (
    <div className={styles.postCardContainer}> 
      <div className={styles.postCard}>
        
        {/* Post Title */}
        <h2>{post.name}</h2>

        {/* Post Description */}
        <p>{post.description}</p>

        {/* Quantity Section */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <h2>Quantity:</h2>
          <p style={{ 
              color: 'orange', 
              fontWeight: 'bold', 
              marginTop: '10px', 
              marginLeft: '25px'
          }}>
            {post.quantity}
          </p>
        </div>

        {/* Post Image */}
        <img 
          className={styles.right}
          src={post.photo} 
          alt="Image description" 
          style={{ maxWidth: "100%", height: "auto", borderRadius: "10px" }} 
        />

        {/* Haggle Button */}
        <button className={`${styles.button} ${styles.right}`} onClick={() => onHaggleClick(post)}>
          Haggle
        </button>

      </div>
    </div>
  );
};

export default PostCard;