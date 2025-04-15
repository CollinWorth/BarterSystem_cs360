import React, { useState } from "react";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import {FaUserCircle} from "react-icons/fa";

// Import pages
import PostsPage from "./pages/Posts";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/Signup";
import UserDash from "./pages/UserDash";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home"); // Start at "home"

  const { user } = useAuth();

  const handlePageChange = (page) => {
    setCurrentPage(page); // Change the page when button is clicked
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <div className="top-bar">
        <div className="logo" onClick={() => handlePageChange("home")}>HaggleHub</div>
        <div className="nav-buttons">
          <button onClick={() => handlePageChange("posts")}>Posts</button>
          {!user ? (<>
            <button onClick={() => handlePageChange("login")}>Login</button>
            <button onClick={() => handlePageChange("signup")}>Sign Up</button>
          </>) : (
            <button className="user-icon-button" 
            onClick={()=> handlePageChange("userdash")}
            title="Go To Dashboard">
              <FaUserCircle size={28} /> 
            </button>
          )}
          
        </div>
      </div>

      {/* Main Container */}
      <div className={
        currentPage === "posts" ? "container posts-container" : 
        currentPage === "login" ? "container login-container" : 
        currentPage === "signup" ? "container signup-container" : 
        currentPage === "userdash" ? "container userdash-container" :
        "container"
      }>
        {/* Conditional Rendering of Pages */}
        {currentPage === "posts" && <PostsPage />}
        {currentPage === "login" && <LoginPage onLoginSuccess={handlePageChange} />}
        {currentPage === "signup" && <SignUpPage />}
        {currentPage === "userdash" && <UserDash onLogout={handlePageChange} />}
        
        {/* Home Page Content */}
        {currentPage === "home" && (
          <div className="home-content">
            <h1 class="bounce">Welcome to Haggle Hub! </h1>
            <p>The marketplace where <strong>buyers and sellers</strong> negotiate the best deals! List your items, make offers, and haggle your way to the perfect price.</p>
            <p>Start exploring now!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;