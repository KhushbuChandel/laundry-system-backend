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
