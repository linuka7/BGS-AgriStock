require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const db = require("./db");
const productsRouter = require("./routes/products");
const activitiesRouter = require("./routes/activities");
const authenticateToken = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* API routes */
/* Public authentication route */
app.use("/api/auth", authRouter);

/* Protected inventory routes */
app.use(
  "/api/products",
  authenticateToken,
  productsRouter
);

app.use(
  "/api/activities",
  authenticateToken,
  activitiesRouter
);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BGS AgriStock backend is running.",
  });
});

app.get("/api/test-database", (req, res) => {
  db.query(
    "SELECT 1 AS databaseConnected",
    (error, results) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Database connection failed.",
          error: error.message,
        });
      }

      return res.json({
        success: true,
        message: "MySQL database is connected.",
        result: results[0],
      });
    }
  );
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

app.listen(PORT, () => {
  console.log(
    `BGS AgriStock backend running at http://localhost:${PORT}`
  );
});