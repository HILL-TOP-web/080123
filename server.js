import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to users.json
const USERS_FILE = path.join(__dirname, 'users.json');

// Helper functions
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ---------------- API ROUTES ----------------

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Mine SKD route
app.post('/mine/:username', (req, res) => {
  const username = req.params.username.trim();
  if (!username) return res.status(400).json({ error: 'Username required' });

  const users = readUsers();
  let user = users.find(u => u.username === username);

  if (!user) {
    user = { username, balance: 0 };
    users.push(user);
  }

  user.balance += 1; // ⛏️ mining logic
  writeUsers(users);

  res.json({ message: 'Mining successful ⛏️', balance: user.balance });
});

// Get all users (leaderboard)
app.get('/api/users', (req, res) => {
  const users = readUsers();
  // Sort descending by balance
  users.sort((a, b) => b.balance - a.balance);
  res.json(users);
});

// ---------------- FRONTEND FALLBACK ----------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
