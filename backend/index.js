import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./database/connection.js";

import miningRoutes from "./routes/miningRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

app.use("/mine", miningRoutes);
app.use("/user", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App running on port ${PORT}`));
