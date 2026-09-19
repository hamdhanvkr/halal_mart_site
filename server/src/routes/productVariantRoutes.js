const express = require("express");

const {
  createProductVariant,
  getProductVariants,
  getProductVariantById,
  updateProductVariant,
  deleteProductVariant,
} = require("../controllers/productVariantController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Public GET
router.get("/", getProductVariants);
router.get("/:id", getProductVariantById);

// Admin only
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createProductVariant
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateProductVariant
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteProductVariant
);

module.exports = router;