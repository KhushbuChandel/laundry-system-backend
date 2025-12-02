const mysql = require("mysql2");

// Create MySQL connection pool with reconnection support
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    rejectUnauthorized: false
  }
});

// Handle connection errors (important for Railway free plan)
db.on('connection', (connection) => {
  console.log("🔄 New MySQL connection created");

  connection.on('error', (err) => {
    console.log("❗ MySQL error:", err.code);

    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("⚠️ Connection lost — waiting for pool to auto-reconnect...");
    }
  });

  connection.on('close', () => {
    console.log("⚠️ MySQL connection closed — pool will create a new one.");
  });
});

// Test pool
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully!");
    connection.release();
  }
});

module.exports = db;
