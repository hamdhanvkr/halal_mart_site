const Admin = require("./AdminUser");
const Category = require("./Category");
const Product = require("./Product");
const ProductImage = require("./ProductImage");
const ProductVariant = require("./ProductVariant");
const StockMovement = require("./StockMovement");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

// Category → Products
Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});

Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// Product → Images
Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images",
  onDelete: "CASCADE",
});

ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// Product → Variants
Product.hasMany(ProductVariant, {
  foreignKey: "product_id",
  as: "variants",
  onDelete: "CASCADE",
});

ProductVariant.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});


// Product → Stock Movements
Product.hasMany(StockMovement, {
  foreignKey: "product_id",
  as: "stockMovements",
  onDelete: "CASCADE",
});

StockMovement.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// Product Variant → Stock Movements
ProductVariant.hasMany(StockMovement, {
  foreignKey: "variant_id",
  as: "stockMovements",
  onDelete: "SET NULL",
});

StockMovement.belongsTo(ProductVariant, {
  foreignKey: "variant_id",
  as: "variant",
});


Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
  onDelete: "CASCADE",
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

Product.hasMany(OrderItem, {
  foreignKey: "product_id",
  as: "orderItems",
});

OrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

module.exports = {
  Admin,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  StockMovement,
  Order,
  OrderItem,
};