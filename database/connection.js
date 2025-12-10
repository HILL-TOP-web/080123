import { MongoClient } from "mongodb";

const uri = "mongodb+srv://oluwayimikad0_db_user:MySecretPass123@cluster0.leilj77.mongodb.net/mineapp?retryWrites=true&w=majority";

const client = new MongoClient(uri);

export const connectDB = async () => {
  await client.connect();
  console.log("MongoDB connected");
};

export const db = client.db("mineapp");
export const users = db.collection("users");
