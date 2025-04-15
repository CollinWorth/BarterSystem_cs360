import React from 'react';
import styles from './PostCard.module.scss';

const PostCard = ({ post, onHaggleClick }) => {
  return (
    <div className={styles.postCardContainer}> 
  <div className={styles.postCard}>

    <div>
      <h2>{post.name}</h2>
      <p>{post.description}</p>
      <div>
        <h4>Quantity:</h4>
        <p style={{ color: '#0077b6', fontWeight: 'bold' }}>{post.quantity}</p>
      </div>
      <button className={styles.button} onClick={() => onHaggleClick(post)}>
        Haggle
      </button>
    </div>

    <img 
      className={styles.right}
      src={post.photo} 
      alt="Post" 
    />
    
  </div>
</div>
  );
};

export default PostCard;