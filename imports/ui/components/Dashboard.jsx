import React, { useState } from "react";
import { Meteor } from "meteor/meteor";

export default function Dashboard() {
  const [mining, setMining] = useState(false);
  const [balance, setBalance] = useState({ gbp: 0, ngn: 0 });

  const userId = "demo-user";

  const toggleMining = () => {
    if (mining) {
      Meteor.call("mine.stop", userId);
    } else {
      Meteor.call("mine.start", userId);
      Meteor.call("wallet.credit", userId, 1, (err, res) => {
        if (!err && res) {
          setBalance(res);
        }
      });
    }
    setMining(!mining);
  };

  return (
    <div>
      <button onClick={toggleMining}>
        {mining ? "🛑 Stop Mining" : "⛏️ Start Mining"}
      </button>
      <p>Status: {mining ? "Mining..." : "Idle"}</p>
      <h3>💷 Balance: £{balance.gbp}</h3>
      <h3>💵 In Naira: ₦{balance.ngn}</h3>
    </div>
  );
        }
