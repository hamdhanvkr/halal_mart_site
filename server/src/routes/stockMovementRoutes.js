const express = require("express");

const {
  createStockMovement,
  getStockMovements,
  getStockMovementById,
  updateStockMovement,
  deleteStockMovement,
} = require("../controllers/stockMovementController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| INVENTORY / STOCK MANAGEMENT
|--------------------------------------------------------------------------
|
| Required permission:
| inventory
|
| Admin automatically has full access.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| CREATE STOCK MOVEMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("inventory"),
  createStockMovement
);

/*
|--------------------------------------------------------------------------
| GET STOCK MOVEMENTS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("inventory"),
  getStockMovements
);

/*
|--------------------------------------------------------------------------
| GET SINGLE STOCK MOVEMENT
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("inventory"),
  getStockMovementById
);

/*
|--------------------------------------------------------------------------
| UPDATE STOCK MOVEMENT
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("inventory"),
  updateStockMovement
);

/*
|--------------------------------------------------------------------------
| DELETE STOCK MOVEMENT
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("inventory"),
  deleteStockMovement
);

module.exports = router;