import React from 'react';
import styles from './PostCard.module.scss';

const PostCard = ({ post, onHaggleClick }) => {
  return (
    <div className={styles['post-card-container']}> {/* Applying the more specific container */}
      <div className={styles['post-card']}>
        <h3>{post.name}</h3>
        <p>{post.description}</p>
        <p>{post.quantity}</p>
        <img src={post.photo} alt="Image description" />
        <button onClick={() => onHaggleClick(post)}>Haggle</button>
      </div>
    </div>
  );
};

export default PostCard;