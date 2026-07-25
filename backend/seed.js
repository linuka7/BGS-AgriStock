require("dotenv").config();

const db = require("./db");

const catalogue = [
  {
    category: "Insecticides",
    categorySinhala: "කෘමි නාශක",
    products: [
      { name: "Trebon", sizes: ["400ml", "200ml", "100ml", "50ml"] },
      { name: "Marshal 20", sizes: ["400ml", "200ml", "100ml"] },
      { name: "Harii", sizes: ["200ml", "100ml", "50ml"] },
      {
        name: "Profenophus H",
        sizes: ["400ml", "200ml", "100ml", "50ml"],
      },
      { name: "Corajan", sizes: ["5ml"] },
      { name: "Zoro Aba", sizes: ["200ml", "100ml", "50ml"] },
      { name: "Mitsu Aba", sizes: ["100ml", "50ml"] },
      { name: "Hb Insecta", sizes: ["100ml"] },
      { name: "Dora", sizes: ["5g"] },
      { name: "Basa 50", sizes: ["400ml", "200ml", "100ml"] },
      {
        name: "Fipronil",
        sizes: ["400ml", "200ml", "100ml", "50ml"],
      },
      { name: "Cruser", sizes: ["10g", "5g"] },
      { name: "Fipronil GR", sizes: ["500g"] },
    ],
  },
  {
    category: "Herbicides",
    categorySinhala: "වල් නාශක",
    products: [
      {
        name: "Glyphosate",
        sizes: ["4L", "2L", "1L", "400ml", "200ml"],
      },
      { name: "Paara", sizes: ["100g"] },
      {
        name: "Glufosinate A",
        sizes: ["4L", "2L", "1L", "400ml"],
      },
    ],
  },
  {
    category: "Fungicides",
    categorySinhala: "දිලීර නාශක",
    products: [
      { name: "Mancozeb", sizes: ["500g"] },
      { name: "Carbendazim", sizes: ["100g"] },
      { name: "Sulfur", sizes: ["500g", "200g"] },
    ],
  },
];

const openingStockRecords = [
  {
    name: "Trebon",
    category: "Insecticides",
    size: "400ml",
    invoice: "INV-2026-001",
    expiry: "2027-08-15",
    received: 40,
    balance: 24,
    minimum: 10,
    unitPrice: 1750,
  },
  {
    name: "Trebon",
    category: "Insecticides",
    size: "100ml",
    invoice: "INV-2026-002",
    expiry: "2027-06-20",
    received: 30,
    balance: 7,
    minimum: 10,
    unitPrice: 1250,
  },
  {
    name: "Corajan",
    category: "Insecticides",
    size: "5ml",
    invoice: "INV-2026-003",
    expiry: "2026-10-05",
    received: 20,
    balance: 3,
    minimum: 8,
    unitPrice: 1500,
  },
  {
    name: "Marshal 20",
    category: "Insecticides",
    size: "200ml",
    invoice: "INV-2026-004",
    expiry: "2027-12-18",
    received: 40,
    balance: 25,
    minimum: 10,
    unitPrice: 1500,
  },
  {
    name: "Fipronil GR",
    category: "Insecticides",
    size: "500g",
    invoice: "INV-2026-005",
    expiry: "2027-04-28",
    received: 25,
    balance: 19,
    minimum: 8,
    unitPrice: 1500,
  },
  {
    name: "Glyphosate",
    category: "Herbicides",
    size: "1L",
    invoice: "INV-2026-006",
    expiry: "2027-09-30",
    received: 30,
    balance: 9,
    minimum: 10,
    unitPrice: 2000,
  },
  {
    name: "Glyphosate",
    category: "Herbicides",
    size: "4L",
    invoice: "INV-2026-007",
    expiry: "2028-01-12",
    received: 20,
    balance: 14,
    minimum: 6,
    unitPrice: 4000,
  },
  {
    name: "Glufosinate A",
    category: "Herbicides",
    size: "2L",
    invoice: "INV-2026-008",
    expiry: "2027-11-24",
    received: 24,
    balance: 17,
    minimum: 8,
    unitPrice: 2500,
  },
  {
    name: "Mancozeb",
    category: "Fungicides",
    size: "500g",
    invoice: "INV-2026-009",
    expiry: "2026-09-10",
    received: 25,
    balance: 17,
    minimum: 8,
    unitPrice: 1500,
  },
  {
    name: "Carbendazim",
    category: "Fungicides",
    size: "100g",
    invoice: "INV-2026-010",
    expiry: "2027-03-14",
    received: 30,
    balance: 24,
    minimum: 8,
    unitPrice: 800,
  },
  {
    name: "Sulfur",
    category: "Fungicides",
    size: "500g",
    invoice: "INV-2026-011",
    expiry: "2027-07-22",
    received: 35,
    balance: 22,
    minimum: 10,
    unitPrice: 1000,
  },
  {
    name: "Paara",
    category: "Herbicides",
    size: "100g",
    invoice: "INV-2026-012",
    expiry: "2026-08-08",
    received: 15,
    balance: 5,
    minimum: 8,
    unitPrice: 1500,
  },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function createProductKey(category, name, size) {
  return [
    normalize(category),
    normalize(name),
    normalize(size),
  ].join("|");
}

const openingStockMap = new Map(
  openingStockRecords.map((item) => [
    createProductKey(item.category, item.name, item.size),
    item,
  ])
);

function buildProducts() {
  const products = [];

  catalogue.forEach((categoryGroup) => {
    categoryGroup.products.forEach((product) => {
      product.sizes.forEach((size) => {
        const key = createProductKey(
          categoryGroup.category,
          product.name,
          size
        );

        const openingStock = openingStockMap.get(key);

        products.push({
          name: product.name,
          category: categoryGroup.category,
          categorySinhala: categoryGroup.categorySinhala,
          size,
          invoice: openingStock?.invoice || "TO-UPDATE",
          expiry: openingStock?.expiry || null,
          received: Number(openingStock?.received || 0),
          balance: Number(openingStock?.balance || 0),
          minimum: Number(openingStock?.minimum ?? 5),
          unitPrice: Number(openingStock?.unitPrice || 0),
        });
      });
    });
  });

  return products;
}

async function seedProducts() {
  let connection;

  try {
    const products = buildProducts();

    connection = await db.promise().getConnection();

    await connection.beginTransaction();

    const [existingProducts] = await connection.query(`
      SELECT
        id,
        name,
        category,
        size
      FROM products
    `);

    const existingKeys = new Set(
      existingProducts.map((product) =>
        createProductKey(
          product.category,
          product.name,
          product.size
        )
      )
    );

    let insertedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const productKey = createProductKey(
        product.category,
        product.name,
        product.size
      );

      if (existingKeys.has(productKey)) {
        skippedCount += 1;
        continue;
      }

      await connection.query(
        `
          INSERT INTO products (
            name,
            category,
            category_sinhala,
            size,
            invoice,
            expiry,
            received,
            balance,
            minimum_stock,
            unit_price
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          product.name,
          product.category,
          product.categorySinhala,
          product.size,
          product.invoice,
          product.expiry,
          product.received,
          product.balance,
          product.minimum,
          product.unitPrice,
        ]
      );

      existingKeys.add(productKey);
      insertedCount += 1;
    }

    await connection.commit();

    console.log("");
    console.log("BGS AgriStock database seeded successfully.");
    console.log(`Inserted products: ${insertedCount}`);
    console.log(`Skipped existing products: ${skippedCount}`);
    console.log(`Catalogue records: ${products.length}`);
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    console.error("Database seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      connection.release();
    }

    await db.promise().end();
  }
}

seedProducts();