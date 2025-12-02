require("dotenv").config();   // Load environment variables

const express = require("express");
const cors = require("cors");
const app = express();

// Use PORT from Railway or fallback
const port = process.env.PORT || 5000;


// CORS FIX (IMPORTANT FOR CPANEL FRONTEND)

app.use(cors({
  origin: "*",  // Allow all for now — safest
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Body parser
app.use(express.json());


// TEST DB CONNECTION ROUTE

app.get("/test-db", (req, res) => {
  const db = require("./db");

  db.query("SELECT 1", (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "DB ERROR: " + err.message
      });
    }

    res.json({
      success: true,
      message: "DB working 🚀"
    });
  });
});

// --------------------------------------
// CHECK IF CUSTOMERS TABLE EXISTS
// --------------------------------------
app.get("/check-customers-table", (req, res) => {
  const db = require("./db");

  db.query("SHOW TABLES LIKE 'customers'", (err, result) => {
    if (err) return res.json({ success: false, message: err.message });

    if (result.length === 0) {
      return res.json({
        success: false,
        message: "❌ customers table DOES NOT EXIST"
      });
    }

    res.json({
      success: true,
      message: "✅ customers table exists"
    });
  });
});

// --------------------------------------
// HEALTH ROUTE
// --------------------------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Laundry Backend Running Successfully",
    environment: process.env.NODE_ENV || "development",
    database: process.env.DB_NAME || "not_set"
  });
});

// --------------------------------------
// MAIN ROUTES
// --------------------------------------
try {
  app.use("/customers", require("./routes/customers"));
  app.use("/orders", require("./routes/orders"));
} catch (error) {
  console.error("Route loading error:", error);
}

// --------------------------------------
// 404 Handler (MUST BE LAST)
// --------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// --------------------------------------
// START SERVER
// --------------------------------------
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
