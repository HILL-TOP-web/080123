// ================================
//  Mine App - Meteor Backend Setup
//  Author: Daniel David Oluwayimika
// ================================

// Import Meteor core packages
import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";

// Import dotenv to load environment variables
import dotenv from "dotenv";

// Load .env file from project root
dotenv.config();

// ✅ Define your main() function
function main() {
  console.log("====================================");
  console.log("🚀 Mine App Custom Main() Started ✅");
  console.log("====================================");

  // Display environment variable statuses
  if (process.env.MONIEPOINT_API_KEY) {
    console.log("🔑 Moniepoint API Key:", process.env.MONIEPOINT_API_KEY);
  } else {
    console.warn("⚠️ Missing: MONIEPOINT_API_KEY not found in .env file");
  }

  if (process.env.SECRET_KEY) {
    console.log("🛡️ Secret Key loaded successfully ✅");
  } else {
    console.warn("⚠️ Missing: SECRET_KEY not found in .env file");
  }

  console.log("====================================");
}

// ✅ Meteor automatically calls this block when the server is ready
Meteor.startup(() => {
  console.log("🚀 Meteor Startup Running...");
  main(); // Call your custom main() function here

  // ✅ Set Meteor to listen on port 3000 explicitly
  const PORT = process.env.PORT || 3000;
  WebApp.httpServer.listen(PORT, () => {
    console.log(`✅ Mine App Server running on port ${PORT}`);
  });
});

// ✅ Create a simple root web route
WebApp.connectHandlers.use("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("🚀 Mine App Running... Environment Keys Loaded ✅");
});
