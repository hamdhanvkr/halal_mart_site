const {
  Product,
  ProductVariant,
  StockMovement,
} = require("../models");

const { sequelize } = require("../config/database");

// CREATE STOCK MOVEMENT
const createStockMovement = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      product_id,
      variant_id,
      type,
      quantity,
      reason,
      reference,
      notes,
    } = req.body;

    // Required fields
    if (!product_id || !type || !quantity || !reason) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "product_id, type, quantity and reason are required",
      });
    }

    // Validate movement type
    const allowedTypes = ["IN", "OUT", "ADJUSTMENT"];

    if (!allowedTypes.includes(type)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Invalid movement type. Use IN, OUT or ADJUSTMENT",
      });
    }

    // Quantity must be a positive number
    if (Number(quantity) < 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Quantity cannot be negative",
      });
    }

    // Find product
    const product = await Product.findByPk(product_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!product) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let newStock;

    // ==========================================
    // VARIANT STOCK
    // ==========================================

    if (variant_id) {
      const variant = await ProductVariant.findOne({
        where: {
          id: variant_id,
          product_id,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!variant) {
        await transaction.rollback();

        return res.status(404).json({
          success: false,
          message:
            "Variant not found or does not belong to this product",
        });
      }

      const currentStock = Number(variant.stock);
      const movementQuantity = Number(quantity);

      if (type === "IN") {
        newStock = currentStock + movementQuantity;
      }

      if (type === "OUT") {
        if (movementQuantity > currentStock) {
          await transaction.rollback();

          return res.status(400).json({
            success: false,
            message: "Insufficient variant stock",
            current_stock: currentStock,
            requested_quantity: movementQuantity,
          });
        }

        newStock = currentStock - movementQuantity;
      }

      if (type === "ADJUSTMENT") {
        newStock = movementQuantity;
      }

      await variant.update(
        {
          stock: newStock,
          status:
            newStock === 0
              ? "out_of_stock"
              : "active",
        },
        { transaction }
      );
    }

    // ==========================================
    // PRODUCT STOCK
    // ==========================================

    else {
      const currentStock = Number(product.stock);
      const movementQuantity = Number(quantity);

      if (type === "IN") {
        newStock = currentStock + movementQuantity;
      }

      if (type === "OUT") {
        if (movementQuantity > currentStock) {
          await transaction.rollback();

          return res.status(400).json({
            success: false,
            message: "Insufficient product stock",
            current_stock: currentStock,
            requested_quantity: movementQuantity,
          });
        }

        newStock = currentStock - movementQuantity;
      }

      if (type === "ADJUSTMENT") {
        newStock = movementQuantity;
      }

      await product.update(
        {
          stock: newStock,
          status:
            newStock === 0
              ? "out_of_stock"
              : "active",
        },
        { transaction }
      );
    }

    // ==========================================
    // CREATE MOVEMENT RECORD
    // ==========================================

    const movement = await StockMovement.create(
      {
        product_id,
        variant_id: variant_id || null,
        type,
        quantity,
        reason,
        reference: reference || null,
        notes: notes || null,
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Stock movement created successfully",
      data: {
        movement,
        new_stock: newStock,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Create stock movement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create stock movement",
      error: error.message,
    });
  }
};

// GET ALL STOCK MOVEMENTS
const getStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.findAll({
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "sku"],
        },
        {
          model: ProductVariant,
          as: "variant",
          attributes: ["id", "name", "sku"],
          required: false,
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    console.error("Get stock movements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get stock movements",
      error: error.message,
    });
  }
};

// GET STOCK MOVEMENT BY ID
const getStockMovementById = async (req, res) => {
  try {
    const { id } = req.params;

    const movement = await StockMovement.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "sku"],
        },
        {
          model: ProductVariant,
          as: "variant",
          attributes: ["id", "name", "sku"],
          required: false,
        },
      ],
    });

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: "Stock movement not found",
      });
    }

    return res.json({
      success: true,
      data: movement,
    });
  } catch (error) {
    console.error("Get stock movement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get stock movement",
      error: error.message,
    });
  }
};

// UPDATE STOCK MOVEMENT
// const updateStockMovement = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const movement = await StockMovement.findByPk(id);

//     if (!movement) {
//       return res.status(404).json({
//         success: false,
//         message: "Stock movement not found",
//       });
//     }

//     const {
//       type,
//       quantity,
//       reason,
//       reference,
//       notes,
//     } = req.body;

//     if (type !== undefined) {
//       const allowedTypes = ["IN", "OUT", "ADJUSTMENT"];

//       if (!allowedTypes.includes(type)) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Invalid movement type. Use IN, OUT or ADJUSTMENT",
//         });
//       }
//     }

//     if (
//       quantity !== undefined &&
//       Number(quantity) <= 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Quantity must be greater than 0",
//       });
//     }

//     await movement.update({
//       type:
//         type !== undefined
//           ? type
//           : movement.type,

//       quantity:
//         quantity !== undefined
//           ? quantity
//           : movement.quantity,

//       reason:
//         reason !== undefined
//           ? reason
//           : movement.reason,

//       reference:
//         reference !== undefined
//           ? reference
//           : movement.reference,

//       notes:
//         notes !== undefined
//           ? notes
//           : movement.notes,
//     });

//     return res.json({
//       success: true,
//       message: "Stock movement updated successfully",
//       data: movement,
//     });
//   } catch (error) {
//     console.error("Update stock movement error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update stock movement",
//       error: error.message,
//     });
//   }
// };

// UPDATE STOCK MOVEMENT
const updateStockMovement = async (req, res) => {
  return res.status(405).json({
    success: false,
    message:
      "Stock movements cannot be edited. Create a new adjustment instead.",
  });
};


// DELETE STOCK MOVEMENT
// const deleteStockMovement = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const movement = await StockMovement.findByPk(id);

//     if (!movement) {
//       return res.status(404).json({
//         success: false,
//         message: "Stock movement not found",
//       });
//     }

//     await movement.destroy();

//     return res.json({
//       success: true,
//       message: "Stock movement deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete stock movement error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete stock movement",
//       error: error.message,
//     });
//   }
// };

// DELETE STOCK MOVEMENT
const deleteStockMovement = async (req, res) => {
  return res.status(405).json({
    success: false,
    message:
      "Stock movements cannot be deleted because they are part of inventory history.",
  });
};

module.exports = {
  createStockMovement,
  getStockMovements,
  getStockMovementById,
  updateStockMovement,
  deleteStockMovement,
};