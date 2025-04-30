import React, { useState, useEffect } from "react";
import styles from "./ManageUsersPage.module.scss"; // Import SCSS for styling

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/users"); // Replace with your API endpoint
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();

        // Ensure all user IDs are strings
        const formattedData = data.map((user) => ({
          ...user,
          id: user._id.toString(), // Convert _id to string if necessary
        }));

        setUsers(formattedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Delete a user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  // Modify user role
  const handleModifyRole = async (userId, newRole) => {
    try {
      // Ensure the role is converted to lowercase before sending
      const role = newRole.toLowerCase();

      const res = await fetch(`http://localhost:8000/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }), // Send the role in lowercase
      });

      if (!res.ok) {
        throw new Error("Failed to modify user role");
      }

      alert("User role updated successfully!");

      // Update the local state to reflect the new role
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role } : user
        )
      );
    } catch (err) {
      alert("Error modifying user role: " + err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.manageUsersContainer}>
      <h2>Manage Users</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleModifyRole(user.id, e.target.value)}
                    className={styles.roleDropdown}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsersPage;