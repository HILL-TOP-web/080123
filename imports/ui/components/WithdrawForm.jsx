// src/components/WithdrawForm.jsx
import React, { useState } from "react";

export default function WithdrawForm({ onWithdraw, setStatus }) {
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [bank, setBank] = useState("");

  const handleWithdraw = async () => {
    if (!withdrawAmt || !bank) {
      setStatus("❌ Fill all fields");
      return;
    }
    try {
      await onWithdraw(Number(withdrawAmt), bank);
      setStatus("✅ Withdrawal request sent");
      setWithdrawAmt("");
      setBank("");
    } catch {
      setStatus("❌ Withdrawal failed");
    }
  };

  return (
    <div>
      <h3>Withdraw</h3>
      <input
        placeholder="₦ amount"
        value={withdrawAmt}
        onChange={(e) => setWithdrawAmt(e.target.value)}
      />
      <input
        placeholder="Bank / Moniepoint"
        value={bank}
        onChange={(e) => setBank(e.target.value)}
      />
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>
  );
}
