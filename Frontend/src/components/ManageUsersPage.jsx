import React, { useState, useEffect } from "react";
import styles from "./ManageUsersPage.module.scss";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all users and groups
  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          fetch("http://localhost:8000/api/users"),
          fetch("http://localhost:8000/api/groups"),
        ]);

        if (!usersRes.ok || !groupsRes.ok) {
          throw new Error("Failed to fetch users or groups");
        }

        const usersData = await usersRes.json();
        const groupsData = await groupsRes.json();

        const formattedUsers = usersData.map((user) => ({
          ...user,
          id: user._id.toString(),
        }));

        setUsers(formattedUsers);
        setGroups(groupsData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsersAndGroups();
  }, []);

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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Group name cannot be empty");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName }),
      });

      if (!res.ok) {
        throw new Error("Failed to create group");
      }

      const data = await res.json();
      setGroups((prevGroups) => [...prevGroups, { _id: data.groupId, name: newGroupName }]);
      setNewGroupName("");
      alert("Group created successfully!");
    } catch (err) {
      alert("Error creating group: " + err.message);
    }
  };

  const handleViewGroupUsers = async (groupId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/users`);
      if (!res.ok) {
        throw new Error("Failed to fetch group users");
      }
      const data = await res.json();
      setGroupUsers(data);
      setSelectedGroup(groupId); // Set the selected group
    } catch (err) {
      alert("Error fetching group users: " + err.message);
    }
  };

  const handleAddUserToGroup = async (groupId, userId) => {
    if (!groupId || !userId) {
      alert("Group or user is not selected");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/add-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error("Failed to add user to group");
      }

      alert("User added to group successfully!");
      handleViewGroupUsers(groupId);
    } catch (err) {
      alert("Error adding user to group: " + err.message);
    }
  };

  const handleRemoveUserFromGroup = async (groupId, userId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/groups/${groupId}/remove-user/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove user from group");
      }

      alert("User removed from group successfully!");
      handleViewGroupUsers(groupId); // Refresh group users
    } catch (err) {
      alert("Error removing user from group: " + err.message);
    }
  };

  if (loading) return <p>Loading users and groups...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.manageUsersContainer}>
      <h1>Manage Users and Groups</h1>

      {/* Groups Section */}
      <div className={styles.groupsSection}>
        <h2>Groups</h2>
        <div className={styles.groupsList}>
          {groups.map((group) => (
            <div key={group._id} className={styles.groupCard}>
              <p>{group.name}</p>
              <button
                className={styles.actionButton}
                onClick={() => handleViewGroupUsers(group._id)}
              >
                View Users
              </button>
            </div>
          ))}
        </div>
        <div className={styles.createGroup}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
          />
          <button className={styles.actionButton} onClick={handleCreateGroup}>
            Create Group
          </button>
        </div>
      </div>

      {/* Group Users Section */}
      {selectedGroup && (
        <div className={styles.groupUsersSection}>
          <h3>Users in Selected Group</h3>
          {groupUsers.length > 0 ? (
            <ul>
              {groupUsers.map((user) => (
                <li key={user._id}>
                  {user.username} ({user.email}){" "}
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleRemoveUserFromGroup(selectedGroup, user._id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No users found in this group.</p>
          )}
        </div>
      )}

      {/* Users Section */}
      <div className={styles.usersSection}>
        <h2>Users</h2>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
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
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleAddUserToGroup(selectedGroup, user.id)}
                    disabled={!selectedGroup}
                  >
                    Add to Group
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsersPage;