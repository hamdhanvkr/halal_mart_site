const {
  Order,
  OrderItem,
  Product,
  StockMovement,
} = require("../models");

const { sequelize } = require("../config/database");

/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
*/

const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
*/

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/

const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      payment_method = "COD",
      payment_status = "pending",
      notes,
      items,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate customer information
    |--------------------------------------------------------------------------
    */

    if (
      !customer_name ||
      !customer_phone ||
      !delivery_address
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Customer name, phone and delivery address are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate items
    |--------------------------------------------------------------------------
    */

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "At least one product is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Allowed payment methods
    |--------------------------------------------------------------------------
    */

    const allowedPaymentMethods = [
      "COD",
      "UPI",
    ];

    /*
    |--------------------------------------------------------------------------
    | Allowed payment statuses
    |--------------------------------------------------------------------------
    */

    const allowedPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    /*
    |--------------------------------------------------------------------------
    | Validate payment method
    |--------------------------------------------------------------------------
    */

    if (
      !allowedPaymentMethods.includes(
        payment_method
      )
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method. Use COD or UPI",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate payment status
    |--------------------------------------------------------------------------
    */

    if (
      !allowedPaymentStatuses.includes(
        payment_status
      )
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate subtotal
    |--------------------------------------------------------------------------
    */

    let subtotal = 0;

    const orderItems = [];

    for (const item of items) {
      const product =
        await Product.findByPk(
          item.product_id,
          {
            transaction,
            lock: transaction.LOCK.UPDATE,
          }
        );

      if (!product) {
        throw new Error(
          `Product with ID ${item.product_id} not found`
        );
      }

      const quantity =
        Number(item.quantity);

      /*
      |--------------------------------------------------------------------------
      | Validate quantity
      |--------------------------------------------------------------------------
      */

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          `Invalid quantity for ${product.name}`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Use discount price when available
      |--------------------------------------------------------------------------
      */

      const unitPrice =
        product.discount_price !== null &&
        product.discount_price !== undefined &&
        Number(product.discount_price) > 0
          ? Number(product.discount_price)
          : Number(product.price);

      const totalPrice =
        unitPrice * quantity;

      subtotal += totalPrice;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate order number
    |--------------------------------------------------------------------------
    */

    const orderNumber =
      `ORD-${Date.now()}`;

    /*
    |--------------------------------------------------------------------------
    | Create order
    |--------------------------------------------------------------------------
    */

    const order =
      await Order.create(
        {
          order_number: orderNumber,

          customer_name,
          customer_phone,

          customer_email:
            customer_email || null,

          delivery_address,

          subtotal,
          delivery_charge: 0,
          discount: 0,
          total_amount: subtotal,

          payment_method,
          payment_status,

          status: "pending",

          notes: notes || null,
        },
        {
          transaction,
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Create order items
    |--------------------------------------------------------------------------
    */

    for (const item of orderItems) {
      await OrderItem.create(
        {
          order_id: order.id,

          product_id: item.product_id,

          product_name:
            item.product_name,

          sku: item.sku,

          quantity: item.quantity,

          unit_price:
            item.unit_price,

          total_price:
            item.total_price,
        },
        {
          transaction,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await transaction.commit();

    /*
    |--------------------------------------------------------------------------
    | Return created order
    |--------------------------------------------------------------------------
    */

    const createdOrder =
      await Order.findByPk(
        order.id,
        {
          include: [
            {
              model: OrderItem,
              as: "items",
            },
          ],
        }
      );

    return res.status(201).json({
      success: true,
      message:
        "Order created successfully",
      data: createdOrder,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error(
      "Create order error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ORDER
|--------------------------------------------------------------------------
|
| Admin can update:
|
| 1. Order Status
|    - pending
|    - confirmed
|    - processing
|    - shipped
|    - delivered
|    - cancelled
|
| 2. Payment Method
|    - COD
|    - UPI
|
| 3. Payment Status
|    - pending
|    - paid
|    - failed
|    - refunded
|
|--------------------------------------------------------------------------
| IMPORTANT STOCK RULE
|--------------------------------------------------------------------------
|
| - Payment method changes do NOT affect stock.
| - Payment status changes do NOT affect stock.
| - Stock is deducted only once when an order is moved
|   to any non-cancelled status.
| - Stock is restored only when a cancelled order had
|   previously deducted stock.
|
|--------------------------------------------------------------------------
*/

const updateOrderStatus = async (
  req,
  res
) => {
  const transaction =
    await sequelize.transaction();

  try {
    const { id } = req.params;

    const {
      status,
      payment_method,
      payment_status,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Allowed order statuses
    |--------------------------------------------------------------------------
    */

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    /*
    |--------------------------------------------------------------------------
    | Allowed payment methods
    |--------------------------------------------------------------------------
    */

    const allowedPaymentMethods = [
      "COD",
      "UPI",
    ];

    /*
    |--------------------------------------------------------------------------
    | Allowed payment statuses
    |--------------------------------------------------------------------------
    */

    const allowedPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    /*
    |--------------------------------------------------------------------------
    | Validate order status
    |--------------------------------------------------------------------------
    */

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate payment method
    |--------------------------------------------------------------------------
    */

    if (
      payment_method !== undefined &&
      !allowedPaymentMethods.includes(
        payment_method
      )
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method. Use COD or UPI",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate payment status
    |--------------------------------------------------------------------------
    */

    if (
      payment_status !== undefined &&
      !allowedPaymentStatuses.includes(
        payment_status
      )
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find order
    |--------------------------------------------------------------------------
    */

    const order =
      await Order.findByPk(id, {
        include: [
          {
            model: OrderItem,
            as: "items",
          },
        ],

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

    /*
    |--------------------------------------------------------------------------
    | Order not found
    |--------------------------------------------------------------------------
    */

    if (!order) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldStatus =
      order.status;

    /*
    |--------------------------------------------------------------------------
    | Check whether this order already deducted stock
    |--------------------------------------------------------------------------
    |
    | We use the SALE / OUT stock movement linked
    | to this order number.
    |
    */

    const existingSaleMovement =
      await StockMovement.findOne({
        where: {
          reference:
            order.order_number,

          type: "OUT",
        },

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

    /*
    |--------------------------------------------------------------------------
    | Check whether this order stock was already restored
    |--------------------------------------------------------------------------
    */

    const existingRestoreMovement =
      await StockMovement.findOne({
        where: {
          reference:
            order.order_number,

          type: "IN",

          reason:
            "ORDER_CANCELLED",
        },

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

    /*
    |--------------------------------------------------------------------------
    | STOCK DEDUCTION
    |--------------------------------------------------------------------------
    |
    | If admin changes:
    |
    | pending → confirmed
    | pending → processing
    | pending → shipped
    | pending → delivered
    |
    | stock is deducted.
    |
    | But it happens ONLY ONCE.
    |
    */

    if (
      status !== undefined &&
      status !== "cancelled" &&
      oldStatus !== status &&
      !existingSaleMovement
    ) {
      for (const item of order.items) {
        /*
        |--------------------------------------------------------------------------
        | Lock product row
        |--------------------------------------------------------------------------
        */

        const product =
          await Product.findByPk(
            item.product_id,
            {
              transaction,
              lock: transaction.LOCK.UPDATE,
            }
          );

        /*
        |--------------------------------------------------------------------------
        | Product not found
        |--------------------------------------------------------------------------
        */

        if (!product) {
          throw new Error(
            `Product ${item.product_name} no longer exists`
          );
        }

        const requiredQuantity =
          Number(item.quantity);

        const currentStock =
          Number(product.stock);

        /*
        |--------------------------------------------------------------------------
        | Check stock
        |--------------------------------------------------------------------------
        */

        if (
          currentStock <
          requiredQuantity
        ) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${currentStock}, Required: ${requiredQuantity}`
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Deduct stock
        |--------------------------------------------------------------------------
        */

        product.stock =
          currentStock -
          requiredQuantity;

        /*
        |--------------------------------------------------------------------------
        | Mark out of stock
        |--------------------------------------------------------------------------
        */

        if (
          Number(product.stock) === 0
        ) {
          product.status =
            "out_of_stock";
        }

        /*
        |--------------------------------------------------------------------------
        | Save product
        |--------------------------------------------------------------------------
        */

        await product.save({
          transaction,
        });

        /*
        |--------------------------------------------------------------------------
        | Create OUT stock movement
        |--------------------------------------------------------------------------
        */

        await StockMovement.create(
          {
            product_id:
              product.id,

            type: "OUT",

            quantity:
              requiredQuantity,

            reason: "SALE",

            reference:
              order.order_number,

            notes:
              `Stock deducted for order ${order.order_number}`,
          },
          {
            transaction,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK RESTORATION
    |--------------------------------------------------------------------------
    |
    | If admin changes any active status → cancelled,
    | restore stock ONLY if it was previously deducted.
    |
    | Example:
    |
    | confirmed → cancelled
    | processing → cancelled
    | shipped → cancelled
    | delivered → cancelled
    |
    */

    if (
      status === "cancelled" &&
      oldStatus !== "cancelled" &&
      existingSaleMovement &&
      !existingRestoreMovement
    ) {
      for (const item of order.items) {
        /*
        |--------------------------------------------------------------------------
        | Lock product row
        |--------------------------------------------------------------------------
        */

        const product =
          await Product.findByPk(
            item.product_id,
            {
              transaction,
              lock: transaction.LOCK.UPDATE,
            }
          );

        /*
        |--------------------------------------------------------------------------
        | Product not found
        |--------------------------------------------------------------------------
        */

        if (!product) {
          throw new Error(
            `Product ${item.product_name} no longer exists`
          );
        }

        const restoreQuantity =
          Number(item.quantity);

        const currentStock =
          Number(product.stock);

        /*
        |--------------------------------------------------------------------------
        | Restore stock
        |--------------------------------------------------------------------------
        */

        product.stock =
          currentStock +
          restoreQuantity;

        /*
        |--------------------------------------------------------------------------
        | Restore product status
        |--------------------------------------------------------------------------

        */

        if (
          product.status ===
            "out_of_stock" &&
          Number(product.stock) > 0
        ) {
          product.status =
            "active";
        }

        /*
        |--------------------------------------------------------------------------
        | Save product
        |--------------------------------------------------------------------------
        */

        await product.save({
          transaction,
        });

        /*
        |--------------------------------------------------------------------------
        | Create IN stock movement
        |--------------------------------------------------------------------------
        */

        await StockMovement.create(
          {
            product_id:
              product.id,

            type: "IN",

            quantity:
              restoreQuantity,

            reason:
              "ORDER_CANCELLED",

            reference:
              order.order_number,

            notes:
              `Stock restored because order ${order.order_number} was cancelled`,
          },
          {
            transaction,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE ORDER STATUS
    |--------------------------------------------------------------------------
    */

    if (status !== undefined) {
      order.status = status;
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE PAYMENT METHOD
    |--------------------------------------------------------------------------
    */

    if (
      payment_method !== undefined
    ) {
      order.payment_method =
        payment_method;
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE PAYMENT STATUS
    |--------------------------------------------------------------------------
    */

    if (
      payment_status !== undefined
    ) {
      order.payment_status =
        payment_status;
    }

    /*
    |--------------------------------------------------------------------------
    | Save order
    |--------------------------------------------------------------------------
    */

    await order.save({
      transaction,
    });

    /*
    |--------------------------------------------------------------------------
    | Commit transaction
    |--------------------------------------------------------------------------
    */

    await transaction.commit();

    /*
    |--------------------------------------------------------------------------
    | Get updated order
    |--------------------------------------------------------------------------
    */

    const updatedOrder =
      await Order.findByPk(
        order.id,
        {
          include: [
            {
              model: OrderItem,
              as: "items",
            },
          ],
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Success response
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,
      message:
        "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Rollback on error
    |--------------------------------------------------------------------------
    */

    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error(
      "Update order error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE ORDER
|--------------------------------------------------------------------------
|
| Only cancelled orders can be deleted.
|
|--------------------------------------------------------------------------
*/

const deleteOrder = async (
  req,
  res
) => {
  const transaction =
    await sequelize.transaction();

  try {
    const { id } = req.params;

    /*
    |--------------------------------------------------------------------------
    | Find order
    |--------------------------------------------------------------------------
    */

    const order =
      await Order.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    /*
    |--------------------------------------------------------------------------
    | Order not found
    |--------------------------------------------------------------------------
    */

    if (!order) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Only cancelled orders can be deleted
    |--------------------------------------------------------------------------
    */

    if (
      order.status !== "cancelled"
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Only cancelled orders can be deleted",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Delete order items
    |--------------------------------------------------------------------------
    */

    await OrderItem.destroy({
      where: {
        order_id: order.id,
      },

      transaction,
    });

    /*
    |--------------------------------------------------------------------------
    | Delete order
    |--------------------------------------------------------------------------
    */

    await order.destroy({
      transaction,
    });

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    await transaction.commit();

    return res.json({
      success: true,
      message:
        "Order deleted successfully",
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error(
      "Delete order error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to delete order",
    });
  }
};

/*
|--------------------------------------------------------------------------
| EXPORT CONTROLLERS
|--------------------------------------------------------------------------
*/

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};