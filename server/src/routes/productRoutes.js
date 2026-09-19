const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getProducts,
  getProductById,
  previewSku,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Product Upload Directory
|--------------------------------------------------------------------------
*/

const uploadDirectory = path.join(
  __dirname,
  "../../uploads/products"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/*
|--------------------------------------------------------------------------
| Multer Storage
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const fileName = `product-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, fileName);
  },
});

/*
|--------------------------------------------------------------------------
| Image File Filter
|--------------------------------------------------------------------------
*/

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WebP images are allowed"
      ),
      false
    );
  }
};

/*
|--------------------------------------------------------------------------
| Multer
|--------------------------------------------------------------------------
*/

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

/*
|--------------------------------------------------------------------------
| SKU PREVIEW
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This must come before /:id
|
*/

router.get(
  "/preview-sku",
  previewSku
);

/*
|--------------------------------------------------------------------------
| GET PRODUCTS
|--------------------------------------------------------------------------
|
| Public
|
*/

router.get(
  "/",
  getProducts
);

/*
|--------------------------------------------------------------------------
| GET SINGLE PRODUCT
|--------------------------------------------------------------------------
|
| Public
|
*/

router.get(
  "/:id",
  getProductById
);

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
|
| Staff requires:
| products permission
|
| Admin automatically has full access.
|
*/

router.post(
  "/",
  authMiddleware,
  permissionMiddleware("products"),
  upload.single("image"),
  createProduct
);

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("products"),
  upload.single("image"),
  updateProduct
);

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("products"),
  deleteProduct
);

module.exports = router;