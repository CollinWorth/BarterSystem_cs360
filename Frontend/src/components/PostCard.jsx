import React from "react";

const PostCard = ({ post, onHaggleClick }) => {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>{post.body}</p>
      <button onClick={() => onHaggleClick(post)}>Haggle</button>
    </div>
  );
};

export default PostCard;