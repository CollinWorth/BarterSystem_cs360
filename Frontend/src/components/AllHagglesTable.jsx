// components/AllHagglesTable.js
import React, { useEffect, useState } from "react";
import styles from "./AllHagglesTable.module.scss";

const AllHagglesTable = () => {
  const [haggles, setHaggles] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

  useEffect(() => {
    const fetchAllHaggles = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/all-haggles");
        const data = await res.json();
        if (Array.isArray(data)) {
          setHaggles(data);
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (err) {
        console.error("Failed to fetch haggles:", err);
      }
    };

    fetchAllHaggles();
  }, []);

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedHaggles = [...haggles].sort((a, b) => {
    const aVal = a[sortConfig.key]?.toString().toLowerCase();
    const bVal = b[sortConfig.key]?.toString().toLowerCase();
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className={styles.haggleContainer}>
      <h2>All Haggles (Admin View)</h2>
      <table className={styles.haggleTable}>
        <thead>
          <tr>
            <th onClick={() => sortData("id")}>Haggle ID{renderSortIndicator("id")}</th>
            <th onClick={() => sortData("senderId")}>Sender ID{renderSortIndicator("senderId")}</th>
            <th onClick={() => sortData("senderItemName")}>Sender Item{renderSortIndicator("senderItemName")}</th>
            <th onClick={() => sortData("recipientId")}>Recipient ID{renderSortIndicator("recipientId")}</th>
            <th onClick={() => sortData("recipientItemName")}>Recipient Item{renderSortIndicator("recipientItemName")}</th>
            <th onClick={() => sortData("status")}>Status{renderSortIndicator("status")}</th>
          </tr>
        </thead>
        <tbody>
          {sortedHaggles.map((haggle) => (
            <tr key={haggle.id}>
              <td>{haggle.id}</td>
              <td title={haggle.senderId}>{haggle.senderId.slice(0,8)}</td>
              <td>{haggle.senderItemName}</td>
              <td title={haggle.recipientId}>{haggle.recipientId.slice(0,8)}</td>
              <td>{haggle.recipientItemName}</td>
              <td><span className={`${styles.statusCell} ${styles[haggle.status]}`}>{haggle.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllHagglesTable;
