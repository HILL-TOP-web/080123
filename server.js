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

const USERS_FILE = path.join(__dirname, "users.json");
const TX_FILE = path.join(__dirname, "transactions.json");

// ---------- HELPERS ----------
function readJSON(file, fallback) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
  return JSON.parse(fs.readFileSync(file));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------- CONFIG ----------
const SKD_TO_NGN = 100; // 1 SKD = ₦100
const MIN_WITHDRAW_SKD = 500;

// ---------- ROUTES ----------

// Mine (no username)
app.post("/mine", (req, res) => {
  const users = readJSON(USERS_FILE, []);
  let user = users[0];

  if (!user) {
    user = {
      balance: 0,
      locked: 0,
      wallet: { ngn: 0, usd: 0 }
    };
    users.push(user);
  }

  user.balance += 1;
  writeJSON(USERS_FILE, users);

  res.json({ balance: user.balance });
});

// Convert SKD → NGN / USD
app.post("/convert", (req, res) => {
  const { amount, currency } = req.body;
  const users = readJSON(USERS_FILE, []);
  const user = users[0];

  if (amount <= 0 || amount > user.balance)
    return res.status(400).json({ error: "Invalid amount" });

  user.balance -= amount;

  if (currency === "NGN") {
    user.wallet.ngn += amount * SKD_TO_NGN;
  } else if (currency === "USD") {
    user.wallet.usd += amount * (SKD_TO_NGN / 1500);
  }

  writeJSON(USERS_FILE, users);
  res.json(user.wallet);
});

// Withdraw (LOCKING ENABLED)
app.post("/withdraw", (req, res) => {
  const { amountNGN, bank } = req.body;
  const users = readJSON(USERS_FILE, []);
  const txs = readJSON(TX_FILE, []);
  const user = users[0];

  if (amountNGN < MIN_WITHDRAW_SKD * SKD_TO_NGN)
    return res.status(400).json({ error: "Below minimum withdrawal" });

  if (amountNGN > user.wallet.ngn)
    return res.status(400).json({ error: "Insufficient wallet balance" });

  user.wallet.ngn -= amountNGN;
  user.locked += amountNGN;

  txs.push({
    id: Date.now(),
    amountNGN,
    bank,
    status: "PENDING"
  });

  writeJSON(USERS_FILE, users);
  writeJSON(TX_FILE, txs);

  res.json({ message: "Withdrawal pending approval" });
});

// Wallet status
app.get("/wallet", (req, res) => {
  const users = readJSON(USERS_FILE, []);
  res.json(users[0]);
});

app.listen(PORT, () => console.log("✅ Server running"));
