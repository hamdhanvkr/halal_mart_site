const { Product, ProductVariant } = require("../models");

// CREATE VARIANT
const createProductVariant = async (req, res) => {
  try {
    const { product_id, name, sku, price, stock, status } = req.body;

    if (!product_id || !name || !sku) {
      return res.status(400).json({
        success: false,
        message: "product_id, name and sku are required",
      });
    }

    // Check product
    const product = await Product.findByPk(product_id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check duplicate SKU
    const existingSku = await ProductVariant.findOne({
      where: { sku },
    });

    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: "Variant SKU already exists",
      });
    }

    const variant = await ProductVariant.create({
      product_id,
      name,
      sku,
      price: price ?? null,
      stock: stock ?? 0,
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Product variant created successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Create variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product variant",
      error: error.message,
    });
  }
};

// GET ALL VARIANTS
const getProductVariants = async (req, res) => {
  try {
    const variants = await ProductVariant.findAll({
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "sku"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: variants,
    });
  } catch (error) {
    console.error("Get variants error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get product variants",
      error: error.message,
    });
  }
};

// GET VARIANT BY ID
const getProductVariantById = async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await ProductVariant.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "sku"],
        },
      ],
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    return res.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    console.error("Get variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get product variant",
      error: error.message,
    });
  }
};

// UPDATE VARIANT
const updateProductVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await ProductVariant.findByPk(id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    const {
      product_id,
      name,
      sku,
      price,
      stock,
      status,
    } = req.body;

    // If product is changed
    if (product_id !== undefined) {
      const product = await Product.findByPk(product_id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    // Check duplicate SKU
    if (sku !== undefined && sku !== variant.sku) {
      const existingSku = await ProductVariant.findOne({
        where: { sku },
      });

      if (existingSku) {
        return res.status(409).json({
          success: false,
          message: "Variant SKU already exists",
        });
      }
    }

    await variant.update({
      product_id:
        product_id !== undefined
          ? product_id
          : variant.product_id,

      name:
        name !== undefined
          ? name
          : variant.name,

      sku:
        sku !== undefined
          ? sku
          : variant.sku,

      price:
        price !== undefined
          ? price
          : variant.price,

      stock:
        stock !== undefined
          ? stock
          : variant.stock,

      status:
        status !== undefined
          ? status
          : variant.status,
    });

    return res.json({
      success: true,
      message: "Product variant updated successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Update variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product variant",
      error: error.message,
    });
  }
};

// DELETE VARIANT
const deleteProductVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await ProductVariant.findByPk(id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    await variant.destroy();

    return res.json({
      success: true,
      message: "Product variant deleted successfully",
    });
  } catch (error) {
    console.error("Delete variant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product variant",
      error: error.message,
    });
  }
};

module.exports = {
  createProductVariant,
  getProductVariants,
  getProductVariantById,
  updateProductVariant,
  deleteProductVariant,
};