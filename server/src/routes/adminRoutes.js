const express = require("express");

const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// STAFF MANAGEMENT
// ADMIN ONLY
// ======================================================

router.get(
  "/staff",
  authMiddleware,
  roleMiddleware("admin"),
  getStaff
);

router.get(
  "/staff/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getStaffById
);

router.post(
  "/staff",
  authMiddleware,
  roleMiddleware("admin"),
  createStaff
);

router.put(
  "/staff/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateStaff
);

router.delete(
  "/staff/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteStaff
);

module.exports = router;