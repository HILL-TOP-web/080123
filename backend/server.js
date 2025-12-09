// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors());

const uri = "mongodb+srv://oluwayimikad0_db_user:MySecretPass123@cluster0.leilj77.mongodb.net/mineapp?retryWrites=true&w=majority";
const client = new MongoClient(uri);
let db, users;

async function connectDB() {
  await client.connect();
  db = client.db('mineapp');
  users = db.collection('users');
  console.log("MongoDB connected");
}

connectDB();

// Fetch user balance
app.get('/balance/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = await users.findOne({ _id: ObjectId(userId) });
  if (user) res.json({ balance: user.balance || 0 });
  else res.status(404).json({ message: "User not found" });
});

// Update user balance
app.post('/mine/:userId', async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  const result = await users.findOneAndUpdate(
    { _id: ObjectId(userId) },
    { $inc: { balance: amount } },
    { returnDocument: 'after', upsert: true }
  );

  res.json({ balance: result.value.balance });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
