import React from 'react';
import styles from './PostCard.module.scss';

const PostCard = ({ post, onHaggleClick }) => {
  return (
    <div className={styles['post-card-container']}> {/* Applying the more specific container */}
      <div className={styles['post-card']}>
        <h3>{post.title}</h3>
        <p>{post.body}</p>
        <button onClick={() => onHaggleClick(post)}>Haggle</button>
      </div>
    </div>
  );
};

export default PostCard;