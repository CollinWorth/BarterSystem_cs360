import React , { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../components/UserDash.module.scss';
import styles from '../components/Sidebar.module.scss';

const UserDash = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("settings");
  console.log("User in context: ", user);
  const handleLogout = () =>{
    logout();
    onLogout("login");
  }

return(
  <div className="userdash-wrapper">
    <div className={styles.sidebar}>
      <h2>{user?.username}</h2>
      <ul>
        {user?.role === "admin" && <li><a onClick={() => setActiveTab("adminDash")}>Admin Dashboard</a></li>}
        <li><a onClick={() => setActiveTab("settings")}>User Settings</a></li>
        <li><a onClick={() => setActiveTab("items")}>My Items</a></li>
        <li><a onClick={handleLogout}>Logout</a></li>
      </ul>
    </div>

  <main className="userdash-content">
    {activeTab === "adminDash" && (
      <div>
        <h2>Admin Dashboard</h2>
        <ul>
          <li><a>Add Items</a></li>
          <li><a>Manage Users</a></li>
        </ul>
      </div>
    )}

    {activeTab === "settings" && (
      <div>
        <h2>User Settings</h2>
        <p>Update email, password, etc.</p>
      </div>
    )}

    {activeTab === "items" && (
      <div>
        <h2>My Items</h2>
        <p>You don't have any items yet!</p>
      </div>
    )}
  </main>
</div>
);

};

export default UserDash;
