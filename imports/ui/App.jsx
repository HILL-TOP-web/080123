import React, { useState, useEffect } from "react";

const App = () => {
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to load leaderboard", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMine = async () => {
    if (!username.trim()) return alert("Enter a username");
    try {
      const res = await fetch(`/mine/${username}`, { method: "POST" });
      const data = await res.json();
      setBalance(data.balance || 0);
      fetchLeaderboard();
    } catch {
      alert("Error connecting to server");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Mine SKD (React)</h1>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        style={{ padding: "10px", marginRight: "10px" }}
      />
      <button onClick={handleMine} style={{ padding: "10px" }}>
        Mine
      </button>
      {balance !== null && <div style={{ marginTop: "10px" }}>Balance: {balance}</div>}
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((u) => (
          <li key={u.username}>
            {u.username}: {u.balance} SKD
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
