// database/connection.js
import { MongoClient } from "mongodb";

// Render will inject your MongoDB URL into this variable
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ ERROR: MONGO_URI is missing. Add it in Render Environment Variables.");
  process.exit(1); // Stop server if no DB URL
}

const client = new MongoClient(uri, {
  useUnifiedTopology: true
});

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export const db = client.db("mineapp");

// Collections
export const users = db.collection("users");
export const transactions = db.collection("transactions");
export const mining = db.collection("mining");
