const express = require("express");
const router = express.Router();
const db = require("../db");


// ADD CUSTOMER

router.post("/add", (req, res) => {
  const { name, phone, address } = req.body;

  if (!name || !phone) {
    return res.json({ success: false, message: "Name and phone are required" });
  }

  const sql = "INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)";
  db.query(sql, [name, phone, address], (err, result) => {
    if (err) return res.json({ success: false, message: err.message });

    return res.json({
      success: true,
      message: "Customer added successfully",
      id: result.insertId
    });
  });
});


// LIST CUSTOMERS

router.get("/list", (req, res) => {
  const sql = "SELECT * FROM customers ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) return res.json({ success: false, message: err.message });

    return res.json({ success: true, data: result });
  });
});



// SEARCH CUSTOMER (NAME or PHONE)

router.get("/search", (req, res) => {
  const q = req.query.q;

  if (!q) {
    return res.json({
      success: false,
      message: "Search query missing"
    });
  }

  const sql = `
    SELECT * FROM customers
    WHERE name LIKE ? OR phone LIKE ?
  `;

  db.query(sql, [`%${q}%`, `%${q}%`], (err, result) => {
    if (err) return res.json({ success: false, message: err.message });

    return res.json({ success: true, data: result });
  });
});


// UPDATE CUSTOMER

router.put("/update/:id", (req, res) => {
  const { name, phone, address } = req.body;

  if (!name || !phone) {
    return res.json({
      success: false,
      message: "Name & phone required"
    });
  }

  const sql = `
    UPDATE customers 
    SET name=?, phone=?, address=? 
    WHERE id=?
  `;

  db.query(sql, [name, phone, address, req.params.id], (err) => {
    if (err) return res.json({ success: false, message: err.message });

    return res.json({
      success: true,
      message: "Customer updated successfully"
    });
  });
});



// DELETE CUSTOMER (PREVENT foreign key crash)

router.delete("/delete/:id", (req, res) => {
  const customerId = req.params.id;

  // FIRST check if this customer has any orders
  const checkOrdersSQL = "SELECT * FROM orders WHERE customer_id=?";

  db.query(checkOrdersSQL, [customerId], (err, result) => {
    if (err) return res.json({ success: false, message: err.message });

    if (result.length > 0) {
      return res.json({
        success: false,
        message:
          "Cannot delete customer because related orders exist. Delete their orders first."
      });
    }

    // If no orders → delete customer safely
    const deleteSQL = "DELETE FROM customers WHERE id=?";
    db.query(deleteSQL, [customerId], (err2) => {
      if (err2) return res.json({ success: false, message: err2.message });

      return res.json({
        success: true,
        message: "Customer deleted successfully"
      });
    });
  });
});

module.exports = router;
