const express = require("express");
const router = express.Router();
const db = require("../db");

// Create order
router.post("/add", (req, res) => {
  const { customer_id, service_name, quantity } = req.body;

  if (!customer_id || !service_name || !quantity || Number(quantity) < 1) {
    return res.json({ success: false, message: "Invalid data. Please select customer, provide service name and quantity >= 1" });
  }

  db.query(
    "INSERT INTO orders (customer_id, service_name, quantity) VALUES (?, ?, ?)",
    [customer_id, service_name, quantity],
    (err, result) => {
      if (err) return res.json({ success: false, message: err.message });
      return res.json({ success: true, message: "Order created successfully", id: result.insertId });
    }
  );
});

// List orders with customer name
router.get("/list", (req, res) => {
  const query = `
    SELECT o.*, c.name AS customer_name
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.id
    ORDER BY o.id DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.json({ success: false, message: err.message });
    return res.json({ success: true, data: result });
  });
});

// Update order status
router.put("/status/:id", (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.json({ success: false, message: "Status is required" });
  }

  db.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, req.params.id],
    (err) => {
      if (err) return res.json({ success: false, message: err.message });
      return res.json({ success: true, message: "Order status updated" });
    }
  );
});

// Update order (service_name, quantity)
router.put("/update/:id", (req, res) => {
  const { service_name, quantity } = req.body;

  if (!service_name || !quantity || Number(quantity) < 1) {
    return res.json({ success: false, message: "Invalid data" });
  }

  const sql = "UPDATE orders SET service_name=?, quantity=? WHERE id=?";
  db.query(sql, [service_name, quantity, req.params.id], (err) => {
    if (err) return res.json({ success: false, message: err.message });
    return res.json({ success: true, message: "Order updated successfully" });
  });
});

// Delete order
router.delete("/delete/:id", (req, res) => {
  const sql = "DELETE FROM orders WHERE id=?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.json({ success: false, message: err.message });
    return res.json({ success: true, message: "Order deleted successfully" });
  });
});


module.exports = router;
