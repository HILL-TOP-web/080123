// src/components/ConvertForm.jsx
import React, { useState } from "react";

export default function ConvertForm({ onConvert, setStatus }) {
  const [skdAmount, setSkdAmount] = useState("");

  const handleConvert = async (currency) => {
    if (!skdAmount) {
      setStatus("❌ Enter SKD amount");
      return;
    }
    try {
      await onConvert(Number(skdAmount), currency);
      setStatus("✅ Converted successfully");
      setSkdAmount("");
    } catch {
      setStatus("❌ Conversion failed");
    }
  };

  return (
    <div>
      <h3>Convert</h3>
      <input
        placeholder="SKD amount"
        value={skdAmount}
        onChange={(e) => setSkdAmount(e.target.value)}
      />
      <button onClick={() => handleConvert("NGN")}>SKD → ₦</button>
      <button onClick={() => handleConvert("USD")}>SKD → $</button>
    </div>
  );
}
