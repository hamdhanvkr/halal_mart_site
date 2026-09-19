const express = require("express");

const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| CUSTOMER ORDER CREATION
|--------------------------------------------------------------------------
|
| Public route.
|
| Customers can create orders without admin login.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  createOrder
);

/*
|--------------------------------------------------------------------------
| ADMIN / STAFF ORDER MANAGEMENT
|--------------------------------------------------------------------------
|
| Required permission:
| orders
|
| Admin automatically has full access.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  permissionMiddleware("orders"),
  getOrders
);

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("orders"),
  getOrderById
);

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/status",
  authMiddleware,
  permissionMiddleware("orders"),
  updateOrderStatus
);

/*
|--------------------------------------------------------------------------
| DELETE ORDER
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("orders"),
  deleteOrder
);

module.exports = router;