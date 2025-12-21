import { useEffect, useState } from "react";
import ConvertForm from "./components/ConvertForm";
import WithdrawForm from "./components/WithdrawForm";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState("");

  // 🔄 Load wallet from backend
  async function loadWallet() {
    try {
      const res = await fetch("/wallet");
      const data = await res.json();
      setWallet(data);
    } catch {
      setStatus("❌ Failed to load wallet");
    }
  }

  // ⛏️ AUTO-MINING (runs every second)
  useEffect(() => {
    loadWallet();

    const interval = setInterval(async () => {
      try {
        await fetch("/mine", { method: "POST" });
        loadWallet();
      } catch {
        setStatus("❌ Mining connection error");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔁 Convert SKD → NGN / USD
  async function convert(amount, currency) {
    if (!amount) {
      setStatus("❌ Enter SKD amount");
      return;
    }

    try {
      await fetch("/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency })
      });

      setStatus("✅ Conversion successful");
      loadWallet();
    } catch {
      setStatus("❌ Conversion failed");
    }
  }

  // 💸 Withdraw NGN
  async function withdraw(amountNGN, bank) {
    if (!amountNGN || !bank) {
      setStatus("❌ Fill all fields");
      return;
    }

    try {
      const res = await fetch("/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountNGN, bank })
      });

      const data = await res.json();
      setStatus(data.message || data.error);
      loadWallet();
    } catch {
      setStatus("❌ Withdrawal failed");
    }
  }

  // ⏳ Loading state
  if (!wallet) {
    return (
      <div style={styles.body}>
        <p>Loading wallet...</p>
      </div>
    );
  }

  // 🖥️ UI
  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <h1>⛏️ Mine SKD</h1>
        <p><strong>Balance:</strong> {wallet.balance} SKD</p>

        <hr />

        {/* ✅ Conversion Form */}
        <ConvertForm onConvert={convert} setStatus={setStatus} />

        <hr />

        <h3>SkyWallet</h3>
        <p>₦ Wallet: {wallet.wallet.ngn.toLocaleString()}</p>
        <p>$ Wallet: {wallet.wallet.usd.toLocaleString()}</p>
        <p>Locked: {wallet.locked.toLocaleString()}</p>

        <hr />

        {/* ✅ Withdrawal Form */}
        <WithdrawForm onWithdraw={withdraw} setStatus={setStatus} />

        <p style={{ marginTop: "10px" }}>{status}</p>
      </div>
    </div>
  );
}

const styles = {
  body: {
    background: "#0f0f0f",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    background: "#1a1a1a",
    padding: "20px",
    borderRadius: "8px",
    width: "340px",
    textAlign: "center"
  }
};
