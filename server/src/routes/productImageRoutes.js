const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  uploadProductImage,
  getProductImages,
  deleteProductImage,
} = require("../controllers/productImageController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.join(
  __dirname,
  "../../uploads/products"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ==========================================
// MULTER STORAGE
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const fileName = `product-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${extension}`;

    cb(null, fileName);
  },
});

// ==========================================
// FILE FILTER
// ==========================================

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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ==========================================
// GET PRODUCT IMAGES
// PUBLIC
// ==========================================

router.get(
  "/:productId/images",
  getProductImages
);

// ==========================================
// UPLOAD PRODUCT IMAGE
// ADMIN ONLY
// ==========================================

router.post(
  "/:productId/images",
  authMiddleware,
  roleMiddleware("admin"),
  upload.single("image"),
  uploadProductImage
);

// ==========================================
// DELETE PRODUCT IMAGE
// ADMIN ONLY
// ==========================================

router.delete(
  "/:productId/images/:imageId",
  authMiddleware,
  roleMiddleware("admin"),
  deleteProductImage
);

module.exports = router;