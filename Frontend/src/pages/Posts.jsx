import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';  // Import PostCard component
import HagglePopup from '../components/HagglePopup';  // Import HagglePopup component
import '../components/Posts.module.scss';  // Import SCSS for styles

const Posts = () => {
  const [posts, setPosts] = useState([]);

  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch ('http://localhost:8000/api/get-listings');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:",error);
      }
    };

    fetchPosts();
  }, []);

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
        <PostCard key={post._id} post={post} onHaggleClick={handleHaggleClick} />
      ))}

    {selectedPost && (
      <div className="modal-overlay">
        <div className="modal-content">
          <HagglePopup post={selectedPost} onClose={closePopup} />
        </div>
      </div>
    )}
    </div>
  );
};

export default Posts;
