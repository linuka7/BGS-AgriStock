const express = require("express");
const db = require("../db");

const router = express.Router();

/* =========================================================
   GET ALL PRODUCTS
========================================================= */

router.get("/", (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      category,
      category_sinhala AS categorySinhala,
      size,
      invoice,
      DATE_FORMAT(expiry, '%Y-%m-%d') AS expiry,
      received,
      balance,
      minimum_stock AS minimum,
      unit_price AS unitPrice,
      created_at AS createdAt
    FROM products
    ORDER BY created_at DESC, id DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to load products.",
        error: error.message,
      });
    }

    const products = results.map((product) => ({
      ...product,
      received: Number(product.received || 0),
      balance: Number(product.balance || 0),
      minimum: Number(product.minimum || 0),
      unitPrice: Number(product.unitPrice || 0),
    }));

    return res.json({
      success: true,
      products,
    });
  });
});

/* =========================================================
   ADD PRODUCT
========================================================= */

router.post("/", (req, res) => {
  const {
    category,
    categorySinhala,
    productName,
    size,
    invoiceNumber,
    expiryDate,
    receivedQuantity,
    minimum = 5,
    unitPrice = 0,
  } = req.body;

  const quantity = Number(receivedQuantity);
  const minimumStock = Number(minimum);
  const price = Number(unitPrice);

  if (
    !category ||
    !productName?.trim() ||
    !size?.trim() ||
    !invoiceNumber?.trim() ||
    !expiryDate
  ) {
    return res.status(400).json({
      success: false,
      message: "Please complete all required product fields.",
    });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message:
        "Received quantity must be a whole number greater than zero.",
    });
  }

  if (!Number.isInteger(minimumStock) || minimumStock < 0) {
    return res.status(400).json({
      success: false,
      message:
        "Minimum stock must be a whole number of zero or more.",
    });
  }

  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Unit price cannot be negative.",
    });
  }

  db.beginTransaction((transactionError) => {
    if (transactionError) {
      return res.status(500).json({
        success: false,
        message: "Unable to start database transaction.",
        error: transactionError.message,
      });
    }

    const productSql = `
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
    `;

    const productValues = [
      productName.trim(),
      category,
      categorySinhala || category,
      size.trim(),
      invoiceNumber.trim(),
      expiryDate,
      quantity,
      quantity,
      minimumStock,
      price,
    ];

    db.query(
      productSql,
      productValues,
      (productError, productResult) => {
        if (productError) {
  return db.rollback(() => {
    if (
      productError.code === "ER_DUP_ENTRY" ||
      productError.errno === 1062
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This product and size already exist. Use Restock Product instead.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save the product.",
      error: productError.message,
    });
  });
}

        const productId = productResult.insertId;

        const activitySql = `
          INSERT INTO activities (
            type,
            product_id,
            product_name,
            size,
            quantity,
            balance,
            message
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const activityValues = [
          "product-added",
          productId,
          productName.trim(),
          size.trim(),
          quantity,
          quantity,
          `Added ${productName.trim()} ${size.trim()}`,
        ];

        db.query(
          activitySql,
          activityValues,
          (activityError) => {
            if (activityError) {
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message:
                    "Product activity could not be saved.",
                  error: activityError.message,
                });
              });
            }

            db.commit((commitError) => {
              if (commitError) {
                return db.rollback(() => {
                  res.status(500).json({
                    success: false,
                    message:
                      "Product transaction could not be completed.",
                    error: commitError.message,
                  });
                });
              }

              return res.status(201).json({
                success: true,
                message: `${productName.trim()} ${size.trim()} added successfully.`,

                product: {
                  id: productId,
                  name: productName.trim(),
                  category,
                  categorySinhala:
                    categorySinhala || category,
                  size: size.trim(),
                  invoice: invoiceNumber.trim(),
                  expiry: expiryDate,
                  received: quantity,
                  balance: quantity,
                  minimum: minimumStock,
                  unitPrice: price,
                  createdAt: new Date().toISOString(),
                },
              });
            });
          }
        );
      }
    );
  });
});

/* =========================================================
   SELL PRODUCT / UPDATE STOCK
========================================================= */

router.patch("/:id/sell", (req, res) => {
  const productId = Number(req.params.id);
  const soldQuantity = Number(req.body.soldQuantity);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  if (
    !Number.isInteger(soldQuantity) ||
    soldQuantity <= 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Sold quantity must be a whole number greater than zero.",
    });
  }

  db.beginTransaction((transactionError) => {
    if (transactionError) {
      return res.status(500).json({
        success: false,
        message: "Unable to start stock transaction.",
        error: transactionError.message,
      });
    }

    const selectSql = `
      SELECT
        id,
        name,
        size,
        balance
      FROM products
      WHERE id = ?
      FOR UPDATE
    `;

    db.query(
      selectSql,
      [productId],
      (selectError, results) => {
        if (selectError) {
          return db.rollback(() => {
            res.status(500).json({
              success: false,
              message: "Unable to find the product.",
              error: selectError.message,
            });
          });
        }

        if (results.length === 0) {
          return db.rollback(() => {
            res.status(404).json({
              success: false,
              message: "Product could not be found.",
            });
          });
        }

        const product = results[0];
        const currentBalance = Number(
          product.balance || 0
        );

        if (soldQuantity > currentBalance) {
          return db.rollback(() => {
            res.status(400).json({
              success: false,
              message:
                "Sold quantity cannot exceed the current balance.",
            });
          });
        }

        const newBalance =
          currentBalance - soldQuantity;

        const updateSql = `
          UPDATE products
          SET balance = ?
          WHERE id = ?
        `;

        db.query(
          updateSql,
          [newBalance, productId],
          (updateError) => {
            if (updateError) {
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message:
                    "Unable to update the stock balance.",
                  error: updateError.message,
                });
              });
            }

            const activitySql = `
              INSERT INTO activities (
                type,
                product_id,
                product_name,
                size,
                quantity,
                balance,
                message
              )
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const activityValues = [
              "stock-updated",
              productId,
              product.name,
              product.size,
              soldQuantity,
              newBalance,
              `Sold ${soldQuantity} units of ${product.name} ${product.size}`,
            ];

            db.query(
              activitySql,
              activityValues,
              (activityError, activityResult) => {
                if (activityError) {
                  return db.rollback(() => {
                    res.status(500).json({
                      success: false,
                      message:
                        "Unable to save the stock activity.",
                      error: activityError.message,
                    });
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message:
                          "Unable to complete the stock update.",
                        error: commitError.message,
                      });
                    });
                  }

                  return res.json({
                    success: true,
                    message: `${product.name} ${product.size} updated successfully.`,

                    newBalance,

                    activity: {
                      id: activityResult.insertId,
                      type: "stock-updated",
                      productId,
                      productName: product.name,
                      size: product.size,
                      quantity: soldQuantity,
                      balance: newBalance,
                      createdAt: new Date().toISOString(),
                    },
                  });
                });
              }
            );
          }
        );
      }
    );
  });
});

/* =========================================================
   RESTOCK EXISTING PRODUCT
========================================================= */

router.patch("/:id/restock", (req, res) => {
  const productId = Number(req.params.id);

  const {
    restockQuantity,
    invoiceNumber,
    expiryDate,
    unitPrice,
  } = req.body;

  const quantity = Number(restockQuantity);
  const price = Number(unitPrice);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message:
        "Restock quantity must be a whole number greater than zero.",
    });
  }

  if (!invoiceNumber?.trim() || !expiryDate) {
    return res.status(400).json({
      success: false,
      message:
        "Invoice number and expiry date are required.",
    });
  }

  if (!Number.isFinite(price) || price < 0) {
    return res.status(400).json({
      success: false,
      message: "Unit price cannot be negative.",
    });
  }

  db.beginTransaction((transactionError) => {
    if (transactionError) {
      return res.status(500).json({
        success: false,
        message: "Unable to start restock transaction.",
        error: transactionError.message,
      });
    }

    const selectSql = `
      SELECT
        id,
        name,
        size,
        received,
        balance
      FROM products
      WHERE id = ?
      FOR UPDATE
    `;

    db.query(
      selectSql,
      [productId],
      (selectError, results) => {
        if (selectError) {
          return db.rollback(() => {
            res.status(500).json({
              success: false,
              message: "Unable to find the product.",
              error: selectError.message,
            });
          });
        }

        if (results.length === 0) {
          return db.rollback(() => {
            res.status(404).json({
              success: false,
              message: "Product could not be found.",
            });
          });
        }

        const product = results[0];

        const newReceived =
          Number(product.received || 0) + quantity;

        const newBalance =
          Number(product.balance || 0) + quantity;

        const updateSql = `
          UPDATE products
          SET
            received = ?,
            balance = ?,
            invoice = ?,
            expiry = ?,
            unit_price = ?
          WHERE id = ?
        `;

        const updateValues = [
          newReceived,
          newBalance,
          invoiceNumber.trim(),
          expiryDate,
          price,
          productId,
        ];

        db.query(
          updateSql,
          updateValues,
          (updateError) => {
            if (updateError) {
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message:
                    "Unable to update the product stock.",
                  error: updateError.message,
                });
              });
            }

            const activitySql = `
              INSERT INTO activities (
                type,
                product_id,
                product_name,
                size,
                quantity,
                balance,
                message
              )
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const activityValues = [
              "stock-restocked",
              productId,
              product.name,
              product.size,
              quantity,
              newBalance,
              `Restocked ${quantity} units of ${product.name} ${product.size}`,
            ];

            db.query(
              activitySql,
              activityValues,
              (activityError, activityResult) => {
                if (activityError) {
                  return db.rollback(() => {
                    res.status(500).json({
                      success: false,
                      message:
                        "Unable to save the restock activity.",
                      error: activityError.message,
                    });
                  });
                }

                db.commit((commitError) => {
                  if (commitError) {
                    return db.rollback(() => {
                      res.status(500).json({
                        success: false,
                        message:
                          "Unable to complete the restock.",
                        error: commitError.message,
                      });
                    });
                  }

                  return res.json({
                    success: true,
                    message: `${product.name} ${product.size} restocked successfully.`,

                    product: {
                      id: productId,
                      received: newReceived,
                      balance: newBalance,
                      invoice: invoiceNumber.trim(),
                      expiry: expiryDate,
                      unitPrice: price,
                    },

                    activity: {
                      id: activityResult.insertId,
                      type: "stock-restocked",
                      productId,
                      productName: product.name,
                      size: product.size,
                      quantity,
                      balance: newBalance,
                      createdAt: new Date().toISOString(),
                    },
                  });
                });
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;