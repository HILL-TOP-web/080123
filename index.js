// ------------------------
// 1️⃣ Check environment
// ------------------------
if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is not set in environment variables");
}

// ------------------------
// 2️⃣ Imports
// ------------------------
import express from "express";
import { connectToDatabase, getDb } from "./connection.js";

// ------------------------
// 3️⃣ Initialize Express
// ------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ------------------------
// 4️⃣ Connect to MongoDB
// ------------------------
connectToDatabase().then(() => {
  const db = getDb();
  const users = db.collection("users"); // Example collection

  // ------------------------
  // 5️⃣ Routes
  // ------------------------

  // Health check
  app.get("/", (req, res) => {
    res.send("Yodhehfox backend running 🚀");
  });

  // Example: fetch all users
  app.get("/users", async (req, res) => {
    try {
      const allUsers = await users.find({}).toArray();
      res.json(allUsers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // ------------------------
  // 6️⃣ Start server
  // ------------------------
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
