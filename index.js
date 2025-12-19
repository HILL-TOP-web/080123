import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------
// Initialize Express
// ------------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ------------------------
// users.json helpers
// ------------------------
const USERS_FILE = path.join(__dirname, "users.json");

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ------------------------
// Routes
// ------------------------

// Render health check
app.get("/", (req, res) => {
  res.status(200).send("Render server working ✅ | Yodhehfox backend running 🚀");
});

// Get all users
app.get("/users", (req, res) => {
  try {
    const users = readUsers();
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to read users" });
  }
});

// Create new user
app.post("/users", (req, res) => {
  const { username, balance = 0 } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: "User already exists" });
  }

  const newUser = { username, balance };
  users.push(newUser);
  writeUsers(users);

  res.status(201).json(newUser);
});

// Mine endpoint
app.post("/mine/:username", (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.username === req.params.username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.balance += 1;
  writeUsers(users);

  res.json({
    message: "Mining successful ⛏️",
    balance: user.balance
  });
});

// ------------------------
// Start server (ONLY ONCE)
// ------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
