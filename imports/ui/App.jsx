import React from "react";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        fontFamily: "Poppins, sans-serif",
        backgroundColor: "#000",
        color: "#00FF88",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1>🚀 Welcome to Mine App</h1>
      <p>Start mining SkyCoin (SKD) and manage your SkyWallet below.</p>
      <div style={{ marginTop: "40px" }}>
        <Dashboard />
      </div>
    </div>
  );
}
