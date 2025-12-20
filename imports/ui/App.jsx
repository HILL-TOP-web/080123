import React, { useState } from "react";

const App = () => {
  const [balance, setBalance] = useState(0);

  const handleMine = async () => {
    try {
      const res = await fetch("/mine", { method: "POST" });
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch {
      alert("Error connecting to server");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Mine SKD (React)</h1>
      <button onClick={handleMine} style={{ padding: "10px" }}>
        Mine
      </button>
      <div style={{ marginTop: "10px" }}>Balance: {balance}</div>
    </div>
  );
};

export default App;
