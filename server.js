import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------- SETUP ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- FILE PATH ----------
const WALLET_FILE = path.join(__dirname, "wallet.json");

// ---------- HELPERS ----------
function readWallet() {
  if (!fs.existsSync(WALLET_FILE)) {
    fs.writeFileSync(
      WALLET_FILE,
      JSON.stringify(
        {
          balance: 0,
          wallet: { ngn: 0, usd: 0 },
          locked: 0,
          lastMined: Date.now()
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

// ---------- CONFIG ----------
const SKD_TO_NGN = 3000000; // 1 SKD = ₦3,000,000
const SKD_TO_USD = 2000;    // 1 SKD = $2,000
const MIN_WITHDRAW_SKD = 500;

// ---------- AUTO-MINE FUNCTION ----------
function updateMining() {
  const wallet = readWallet();
  const now = Date.now();
  const last = wallet.lastMined || now;
  const secondsPassed = Math.floor((now - last) / 1000);

  if (secondsPassed > 0) {
    wallet.balance += secondsPassed * 20; // 20 SKD per second
    wallet.lastMined = now;
    writeWallet(wallet);
  }

  return wallet;
}

// ---------- ROUTES ----------

// ⛏️ MINE
app.post("/mine", (req, res) => {
  const wallet = updateMining();
  res.json(wallet);
});

// 🔁 CONVERT SKD → NGN / USD
app.post("/convert", (req, res) => {
  const { amount, currency } = req.body;
  const wallet = updateMining();

  if (!amount || amount <= 0 || amount > wallet.balance) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  wallet.balance -= amount;

  if (currency === "NGN") {
    wallet.wallet.ngn += amount * SKD_TO_NGN;
  } else if (currency === "USD") {
    wallet.wallet.usd += amount * SKD_TO_USD;
  } else {
    return res.status(400).json({ error: "Invalid currency" });
  }

  writeWallet(wallet);
  res.json(wallet);
});

// 💸 WITHDRAW
app.post("/withdraw", (req, res) => {
  const { amountNGN, bank } = req.body;
  const wallet = updateMining();

  if (!amountNGN || !bank) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (amountNGN < MIN_WITHDRAW_SKD * SKD_TO_NGN) {
    return res.status(400).json({ error: "Below minimum withdrawal" });
  }

  if (amountNGN > wallet.wallet.ngn) {
    return res.status(400).json({ error: "Insufficient wallet balance" });
  }

  wallet.wallet.ngn -= amountNGN;
  wallet.locked += amountNGN;

  writeWallet(wallet);
  res.json({ message: "Withdrawal pending approval" });
});

// 👛 WALLET STATUS
app.get("/wallet", (req, res) => {
  const wallet = updateMining();
  res.json(wallet);
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
