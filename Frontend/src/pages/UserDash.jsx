import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../components/UserDash.module.scss";
import styles from "../components/Sidebar.module.scss";
import AddItemForm from "../components/ItemForm";
import UsersItems from "../components/UsersItems";
import AddtoInventory from "../components/AddtoInventory";
import AddUserPost from "../components/AddUserPost";
import UserPosts from "../components/UserPosts";
import CurrentHaggles from "../components/CurrentHaggles";
import ManageUsersPage from "../components/ManageUsersPage"; // Import the ManageUsersPage component
import AllHagglesTable from "../components/AllHagglesTable";


const UserDash = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");

  const handleLogout = () => {
    logout();
    onLogout("login");
  };

  return (
    <div className="userdash-wrapper">
      <div className={styles.sidebar}>
        <h2>{user?.username}</h2>
        <ul>
          {user?.role === "admin" && (
            <li className={styles.dropdown}>
              <a onClick={() => setActiveTab("adminDash")}>Admin Dashboard ▾</a>
              <ul className={styles.dropdownMenu}>
                <li>
                  <a onClick={() => setActiveTab("addItems")}>➕ Add Items</a>
                </li>
                <li>
                  <a onClick={() => setActiveTab("manageUsers")}>👥 Manage Users</a>
                </li>
              </ul>
            </li>
          )}
          <li>
            <a onClick={() => setActiveTab("posts")}>My Posts</a>
          </li>
          <li>
            <a onClick={() => setActiveTab("items")}>My Items</a>
          </li>
          <li>
            <a onClick={() => setActiveTab("haggles")}>Current Haggles</a>
          </li>
          <li>
            <a onClick={handleLogout}>Logout</a>
          </li>
        </ul>
      </div>

      <main className="userdash-content">
        {activeTab === "adminDash" && (
          <div>
            <h2>Admin Dashboard</h2>
            <button
              onClick={() => setActiveTab("manageUsers")}
              className={styles.manageUsersButton}
            >
              Go to Manage Users
            </button>
            <AllHagglesTable />
          </div>
        )}

        {activeTab === "addItems" && (
          <div>
            <h2>Add Items</h2>
            <AddItemForm />
          </div>
        )}

        {activeTab === "manageUsers" && (
          <div>
            <ManageUsersPage /> {/* Render the ManageUsersPage component */}
          </div>
        )}

        {activeTab === "posts" && (
          <div>
            <h2>All Posts</h2>
            <button onClick={() => setActiveTab("addPost")}>
              Create a new Post
            </button>
            <UserPosts userId={user.id} />
          </div>
        )}

        {activeTab === "items" && (
          <div>
            <h2>My Items</h2>
            <button onClick={() => setActiveTab("addBelongs")}>
              ➕ Add Items To Your Knapsack
            </button>
            <UsersItems userId={user.id} />
          </div>
        )}

        {activeTab === "addBelongs" && (
          <div>
            <AddtoInventory userId={user.id} />
          </div>
        )}

        {activeTab === "addPost" && (
          <div>
            <AddUserPost userId={user.id} />
          </div>
        )}

        {activeTab === "haggles" && (
          <div>
            <CurrentHaggles userId={user.id} />
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDash;
