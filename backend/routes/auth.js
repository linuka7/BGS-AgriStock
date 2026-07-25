const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

/* =========================================================
   ADMIN LOGIN
========================================================= */

router.post("/login", (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Enter your email and password.",
    });
  }

  const sql = `
    SELECT
      id,
      name,
      email,
      password,
      role
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(sql, [email], async (error, results) => {
    if (error) {
      console.error("Login database error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to complete login.",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const user = results[0];

    try {
      const passwordMatches = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: "Incorrect email or password.",
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "8h",
        }
      );

      return res.json({
        success: true,
        message: "Login successful.",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (passwordError) {
      console.error(
        "Password comparison error:",
        passwordError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to complete login.",
      });
    }
  });
});

module.exports = router;