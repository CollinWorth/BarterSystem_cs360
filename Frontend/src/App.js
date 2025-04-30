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
        {currentPage === "signup" && <SignUpPage onSignupSuccess={handlePageChange} />}
        {currentPage === "userdash" && <UserDash onLogout={handlePageChange} />}
        
        {/* Home Page Content */}
        {currentPage === "home" && (
          <div className="home-content">
            <h1 className="bounce">Welcome to HaggleHub!</h1>
            <p>
              The marketplace where <strong>buyers and sellers</strong> negotiate the best deals! List your items, make offers, and haggle your way to the perfect price.
            </p>
            <p>
              <strong>What is HaggleHub?</strong> HaggleHub is a dynamic platform designed to bring buyers and sellers together in a fun and interactive way. Unlike traditional marketplaces, HaggleHub encourages negotiation and creativity in every transaction.
            </p>
            <p>
              <strong>How does it work?</strong> It's simple:
              <ul>
                <li>📦 <strong>List Your Items:</strong> Post items you want to sell or trade.</li>
                <li>💬 <strong>Make Offers:</strong> Browse listings and make offers on items you like.</li>
                <li>🤝 <strong>Haggle:</strong> Negotiate with other users to reach the perfect deal.</li>
              </ul>
            </p>
            <p>
              Whether you're looking to buy, sell, or trade, HaggleHub is the place to make it happen. Start exploring now and join the community of savvy hagglers!
            </p>
            <div className="home-buttons">
              <button className="signup-button" onClick={() => handlePageChange("signup")}>
                Sign Up
              </button>
              <button className="login-button" onClick={() => handlePageChange("login")}>
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;