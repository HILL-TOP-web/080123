import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- FILES ----------
const WALLET_FILE = path.join(__dirname, "wallet.json");
const TX_FILE = path.join(__dirname, "transactions.json");

// ---------- HELPERS ----------
function readWallet() {
  if (!fs.existsSync(WALLET_FILE)) {
    fs.writeFileSync(
      WALLET_FILE,
      JSON.stringify(
        {
          balance: 0,
          locked: 0,
          wallet: { ngn: 0, usd: 0 }
        },
        null,
        2
      )
    );
  }
  return JSON.parse(fs.readFileSync(WALLET_FILE, "utf-8"));
}

function writeWallet(wallet) {
  fs.writeFileSync(WALLET_FILE, JSON.stringify(wallet, null, 2));
}

function readTx() {
  if (!fs.existsSync(TX_FILE)) fs.writeFileSync(TX_FILE, "[]");
  return JSON.parse(fs.readFileSync(TX_FILE));
}

// ---------- CONFIG ----------
const SKD_TO_NGN = 100; // 1 SKD = ₦100
const MIN_WITHDRAW_SKD = 500;

// ---------- ROUTES ----------

// ✅ MINE (NO USERNAME)
app.post("/mine", (req, res) => {
  const wallet = readWallet();
  wallet.balance += 1;
  writeWallet(wallet);
  res.json({ balance: wallet.balance });
});

// ✅ CONVERT
app.post("/convert", (req, res) => {
  const { amount, currency } = req.body;
  const wallet = readWallet();

  if (amount <= 0 || amount > wallet.balance)
    return res.status(400).json({ error: "Invalid amount" });

  wallet.balance -= amount;

  if (currency === "NGN") {
    wallet.wallet.ngn += amount * SKD_TO_NGN;
  } else if (currency === "USD") {
    wallet.wallet.usd += (amount * SKD_TO_NGN) / 1500;
  }

  writeWallet(wallet);
  res.json(wallet.wallet);
});

// ✅ WITHDRAW (LOCKING ENABLED)
app.post("/withdraw", (req, res) => {
  const { amountNGN, bank } = req.body;
  const wallet = readWallet();
  const txs = readTx();

  if (amountNGN < MIN_WITHDRAW_SKD * SKD_TO_NGN)
    return res.status(400).json({ error: "Below minimum withdrawal" });

  if (amountNGN > wallet.wallet.ngn)
    return res.status(400).json({ error: "Insufficient wallet balance" });

  wallet.wallet.ngn -= amountNGN;
  wallet.locked += amountNGN;

  txs.push({
    id: Date.now(),
    amountNGN,
    bank,
    status: "PENDING"
  });

  writeWallet(wallet);
  fs.writeFileSync(TX_FILE, JSON.stringify(txs, null, 2));

  res.json({ message: "Withdrawal pending approval" });
});

// ✅ WALLET STATUS
app.get("/wallet", (req, res) => {
  res.json(readWallet());
});

// ---------- FRONTEND FALLBACK ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log("✅ Server running"));
