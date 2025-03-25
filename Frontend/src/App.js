import React, { useState } from "react";
import "./App.css";

// Import pages
import PostsPage from "./pages/Posts";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/Signup";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home"); // Start at "home"

  const handlePageChange = (page) => {
    setCurrentPage(page); // Change the page when button is clicked
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <div className="top-bar">
        <div className="logo" onClick ={() => handlePageChange("home")}>HaggleHub</div>
        <div className="nav-buttons">
          <button onClick={() => handlePageChange("posts")}>Posts</button>
          <button onClick={() => handlePageChange("login")}>Login</button>
          <button onClick={() => handlePageChange("signup")}>Sign Up</button>
        </div>
      </div>

      {/* Main Container */}
      <div className={
        currentPage === "posts" ? "container posts-container" : 
        currentPage === "login" ? "container login-container" : 
        currentPage === "signup" ? "container signup-container" : 
        "container"
        }>
        {/* Conditional Rendering of Pages */}
        {currentPage === "posts" && <PostsPage />}
        {currentPage === "login" && <LoginPage />}
        {currentPage === "signup" && <SignUpPage />}
      </div>
      
    </div>
  );
};

export default App;