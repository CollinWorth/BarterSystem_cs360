import React, { useState } from 'react';
import PostCard from '../components/PostCard';  // Import PostCard component
import HagglePopup from '../components/HagglePopup';  // Import HagglePopup component
import '../components/Posts.module.scss';  // Import SCSS for styles

const Posts = () => {
  const [posts] = useState([
    { id: 1, title: "Post 1", body: "This is post 1" },
    { id: 2, title: "Post 2", body: "This is post 2" },
    { id: 3, title: "Post 3", body: "This is post 3" },
  ]);

  const [selectedPost, setSelectedPost] = useState(null);

  const handleHaggleClick = (post) => {
    setSelectedPost(post);
  };

  const closePopup = () => {
    setSelectedPost(null);
  };

  return (
    <div>
      <h1>Posts</h1>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onHaggleClick={handleHaggleClick} />
      ))}

      {selectedPost && <HagglePopup post={selectedPost} onClose={closePopup} />}
    </div>
  );
};

export default Posts;
