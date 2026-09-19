const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StockMovement = sequelize.define(
  "StockMovement",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    variant_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    type: {
      type: DataTypes.ENUM(
        "IN",
        "OUT",
        "ADJUSTMENT"
      ),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    reference: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "stock_movements",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = StockMovement;