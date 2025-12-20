import express from 'express';
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

// ---------------- Global balance ----------------
let globalBalance = 0;

// ---------------- API ROUTES ----------------

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Mine SKD route (no username)
app.post('/mine', (req, res) => {
  globalBalance += 1; // ⛏️ mining logic
  res.json({ message: 'Mining successful ⛏️', balance: globalBalance });
});

// Get current balance (optional)
app.get('/api/balance', (req, res) => {
  res.json({ balance: globalBalance });
});

// ---------------- FRONTEND FALLBACK ----------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
