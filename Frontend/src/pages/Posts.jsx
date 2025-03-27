import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';  
import HagglePopup from '../components/HagglePopup';  
import '../components/Posts.module.scss';  

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/get-listings');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleHaggleClick = (post) => {
    setSelectedPost(post);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedPost(null);
    setOpen(false);
  };

  return (
    <div>
      <h1>Posts</h1>
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onHaggleClick={handleHaggleClick} />
      ))}

      {/* Pass the selected post and modal state to HagglePopup */}
      {selectedPost && <HagglePopup post={selectedPost} onClose={handleClose} open={open} />}
    </div>
  );
};

export default Posts;