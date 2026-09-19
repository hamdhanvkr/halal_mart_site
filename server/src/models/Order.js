const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    customer_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    customer_phone: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },

    customer_email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    delivery_charge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // Payment Method
    // COD = Cash on Delivery
    // UPI = UPI Payment
    payment_method: {
      type: DataTypes.ENUM(
        "COD",
        "UPI"
      ),
      allowNull: false,
      defaultValue: "COD",
    },

    // Payment Status
    payment_status: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "failed",
        "refunded"
      ),
      allowNull: false,
      defaultValue: "pending",
    },

    // Order Status
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Order;