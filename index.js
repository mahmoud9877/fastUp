import dotenv from "dotenv";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import initApp from "./src/index.router.js";

// Set up __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, "./config/.env") });

// Initialize Express
const app = express();

// Initialize routes and middleware
initApp(app, express);
console.log('kldsjflkdf;skldjfd;lkjsdkflj');

// Setup port
const port = process.env.PORT || 5000;

// Start the server
app.listen(port, () => {
  console.log(
    chalk.hex("#09c")(`Server is running on port `) +
      chalk.green.bold(`${port}`)
  );
});
