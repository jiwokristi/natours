import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Handle synchronous errors NOT caught anywhere in the code
// -------------------------------------------------------------
// uncaughtException happens when your code throws an error outside of any
// try/catch or Promise — e.g., a typo in variable names.
// The app should shut down immediately because the state may be corrupted.
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1); // Force shutdown
});

dotenv.config({ path: './.env' });

// Import Express app AFTER environment variables are loaded
// -------------------------------------------------------------
// The app may rely on process.env, so load it only after dotenv runs.
import app from './app.js';

// Build MongoDB connection string
// -------------------------------------------------------------
// Replace <db_password> placeholder with the real password from env vars.
// Use DATABASE_STANDARD for Windows, otherwise use DATABASE
let DB;
if (process.env.DATABASE_STANDARD && process.platform === 'win32') {
  console.log('Using standard MongoDB URI for Windows...');
  DB = process.env.DATABASE_STANDARD.replace(
    '<db_password>',
    process.env.DATABASE_PASSWORD,
  );
} else {
  DB = process.env.DATABASE.replace(
    '<db_password>',
    process.env.DATABASE_PASSWORD,
  );
}

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful! 😍'))
  .catch(err => {
    console.log('DB connection error! 💥');
    console.log(err.name, err.message);
  });

// Start server
// -------------------------------------------------------------
// Use PORT from environment variables or fallback to 3000.
// app.listen() returns a server instance so we can close it on errors.
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port} 💕`);
});

// Handle rejected Promises that weren't caught anywhere
// -------------------------------------------------------------
// unhandledRejection occurs when a Promise rejects and you forget .catch().
// This could leave the app in an unstable state, so we shut down gracefully:
// 1. Close the server
// 2. Exit the process
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // Exit only after server finishes existing requests
  });
});
