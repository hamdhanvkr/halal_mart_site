const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const productImageRoutes = require("./routes/productImageRoutes");
const productVariantRoutes = require("./routes/productVariantRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const orderRoutes = require("./routes/orderRoutes");

const path = require("path");


const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "Halal Mart API is running",
//   });
// });

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", productImageRoutes);
app.use("/api/product-variants", productVariantRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;