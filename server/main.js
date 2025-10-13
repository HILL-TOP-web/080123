import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import dotenv from "dotenv";

// 🧩 Import all backend methods
import "./methods.js";

// ✅ Load environment variables from .env
dotenv.config();

// 🚀 Start server
Meteor.startup(() => {
  console.log("======================================");
  console.log("🚀 Mine App Server started successfully!");
  console.log("🌍 Port: 3000");
  console.log("🔐 Moniepoint API URL:", process.env.MONIEPOINT_API_URL || "Not set");
  console.log("======================================");
});

// 🌐 Basic route for server check
WebApp.connectHandlers.use("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("🚀 Mine SKD App is Live ✅");
});
