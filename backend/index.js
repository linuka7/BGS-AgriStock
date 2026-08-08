require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");
const productsRouter = require("./routes/products");
const activitiesRouter = require("./routes/activities");
const authenticateToken = require("./middleware/auth");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- CORS ---------- */

const allowedOrigins = [
  "http://localhost:5173",
   "http://localhost:5174",
  "http://localhost:4173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Requests without an Origin header include tools such
       * as Postman, Railway health checks and server requests.
       */
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("This origin is not allowed by CORS.")
      );
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ---------- HEALTH CHECK ---------- */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BGS AgriStock backend is running.",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
  });
});

/* ---------- PUBLIC ROUTES ---------- */

app.use("/api/auth", authRouter);

/* ---------- PROTECTED ROUTES ---------- */

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

/* ---------- DATABASE TEST ---------- */

app.get("/api/test-database", (req, res) => {
  db.query(
    "SELECT 1 AS databaseConnected",
    (error, results) => {
      if (error) {
        console.error(
          "Database connection test failed:",
          error.message
        );

        return res.status(500).json({
          success: false,
          message: "Database connection failed.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "MySQL database is connected.",
        result: results[0],
      });
    }
  );
});

/* ---------- NOT FOUND ---------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

/* ---------- ERROR HANDLER ---------- */

app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

/* ---------- START SERVER ---------- */

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `BGS AgriStock backend running on port ${PORT}`
  );
});