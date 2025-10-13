import React, { useState } from "react";
import { Meteor } from "meteor/meteor";

export default function Dashboard() {
  const [mining, setMining] = useState(false);

  const toggleMining = () => {
    const userId = "demo-user";
    if (mining) {
      Meteor.call("mine.stop", userId);
    } else {
      Meteor.call("mine.start", userId);
    }
    setMining(!mining);
  };

  return (
    <div>
      <button onClick={toggleMining}>
        {mining ? "🛑 Stop Mining" : "⛏️ Start Mining"}
      </button>
      <p>Status: {mining ? "Mining..." : "Idle"}</p>
    </div>
  );
}
