const fs = require("fs");
const path = require("path");
const db = require("./db");

async function setupDatabase() {
  const schemaPath = path.join(
    __dirname,
    "schema.sql"
  );

  const schema = fs.readFileSync(
    schemaPath,
    "utf8"
  );

  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  const promiseDb = db.promise();

  for (const statement of statements) {
    try {
      await promiseDb.query(statement);
    } catch (error) {
      /*
       * Ignore an index that already exists when the
       * setup script runs again during a redeployment.
       */
      if (error.code === "ER_DUP_KEYNAME") {
        continue;
      }

      throw error;
    }
  }

  console.log(
    "BGS AgriStock database tables are ready."
  );

  await promiseDb.end();
}

setupDatabase().catch((error) => {
  console.error(
    "Database setup failed:",
    error.message
  );

  process.exit(1);
});