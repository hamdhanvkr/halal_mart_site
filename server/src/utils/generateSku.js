const { Op } = require("sequelize");
const { Product } = require("../models");

/**
 * Generate automatic SKU
 *
 * Examples:
 * Attar         -> ATTA-001
 * Attar         -> ATTA-002
 * Pants         -> PANT-001
 * Basmati Rice  -> BASM-001
 */
const generateSku = async (productName, transaction = null) => {
  if (!productName || !productName.trim()) {
    throw new Error("Product name is required to generate SKU");
  }

  // Remove spaces and special characters
  const cleanName = productName
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  if (!cleanName) {
    throw new Error("Unable to generate SKU from product name");
  }

  // First 4 characters
  const prefix = cleanName.substring(0, 4);

  // Find existing SKUs using the same prefix
  const products = await Product.findAll({
    attributes: ["sku"],
    where: {
      sku: {
        [Op.like]: `${prefix}-%`,
      },
    },
    order: [["sku", "DESC"]],
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });

  let nextNumber = 1;

  for (const product of products) {
    if (!product.sku) {
      continue;
    }

    const match = product.sku.match(
      new RegExp(`^${prefix}-(\\d+)$`)
    );

    if (!match) {
      continue;
    }

    const currentNumber = parseInt(match[1], 10);

    if (currentNumber >= nextNumber) {
      nextNumber = currentNumber + 1;
    }
  }

  return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
};

module.exports = generateSku;