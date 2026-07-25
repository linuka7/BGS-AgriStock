require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./db");

async function createAdmin() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
    );

    db.end();
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const sql = `
      INSERT INTO users (
        name,
        email,
        password,
        role
      )
      VALUES (?, ?, ?, 'admin')
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password = VALUES(password),
        role = 'admin'
    `;

    db.query(
      sql,
      [name, email.toLowerCase(), hashedPassword],
      (error) => {
        if (error) {
          console.error(
            "Unable to create admin account:",
            error.message
          );

          db.end();
          return;
        }

        console.log("");
        console.log("Admin account created successfully.");
        console.log(`Email: ${email}`);
        console.log("Password stored securely as a hash.");

        db.end();
      }
    );
  } catch (error) {
    console.error(
      "Unable to hash admin password:",
      error.message
    );

    db.end();
  }
}

createAdmin();