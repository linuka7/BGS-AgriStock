const mysql = require("mysql2");

const db = mysql.createPool({
  host:
    process.env.MYSQLHOST ||
    process.env.DB_HOST ||
    "localhost",

  port: Number(
    process.env.MYSQLPORT ||
      process.env.DB_PORT ||
      3306
  ),

  user:
    process.env.MYSQLUSER ||
    process.env.DB_USER ||
    "root",

  password:
    process.env.MYSQLPASSWORD ||
    process.env.DB_PASSWORD ||
    "",

  database:
    process.env.MYSQLDATABASE ||
    process.env.DB_NAME ||
    "bgs_agristock",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((error, connection) => {
  if (error) {
    console.error(
      "MySQL connection failed:",
      error.message
    );

    return;
  }

  console.log(
    "Connected to BGS AgriStock MySQL database."
  );

  connection.release();
});

module.exports = db;