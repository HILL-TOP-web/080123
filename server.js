import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route for single-page apps
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
