const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const sql = `
    SELECT
      id,
      type,
      product_id AS productId,
      product_name AS productName,
      size,
      quantity,
      balance,
      message,
      created_at AS createdAt
    FROM activities
    ORDER BY created_at DESC, id DESC
    LIMIT 100
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to load activities.",
        error: error.message,
      });
    }

    const activities = results.map((activity) => ({
      ...activity,
      quantity: Number(activity.quantity || 0),
      balance:
        activity.balance === null
          ? null
          : Number(activity.balance),
    }));

    return res.json({
      success: true,
      activities,
    });
  });
});

module.exports = router;