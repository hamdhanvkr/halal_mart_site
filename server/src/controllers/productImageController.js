const fs = require("fs");
const path = require("path");

const {
  Product,
  ProductImage,
} = require("../models");

// ==========================================
// GET PRODUCT IMAGES
// ==========================================

const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;

    const images = await ProductImage.findAll({
      where: {
        product_id: productId,
      },

      order: [
        ["is_primary", "DESC"],
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error(
      "GET PRODUCT IMAGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load product images",
    });
  }
};

// ==========================================
// UPLOAD PRODUCT IMAGE
// ==========================================

const uploadProductImage = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);

    if (!product) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    // Find current primary image
    const oldPrimaryImage = await ProductImage.findOne({
      where: {
        product_id: productId,
        is_primary: true,
      },
    });

    // Delete old physical image
    if (oldPrimaryImage?.image_url) {
      const oldFilePath = path.join(
        __dirname,
        "../../",
        oldPrimaryImage.image_url.replace(/^\/+/, "")
      );

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;

    // If primary image exists, update it
    if (oldPrimaryImage) {
      await oldPrimaryImage.update({
        image_url: imageUrl,
        is_primary: true,
      });

      await product.update({
        image: imageUrl,
      });

      return res.status(200).json({
        success: true,
        message: "Product image replaced successfully",
        data: oldPrimaryImage,
      });
    }

    // No primary image exists, create one
    const productImage = await ProductImage.create({
      product_id: productId,
      image_url: imageUrl,
      is_primary: true,
      sort_order: 0,
    });

    await product.update({
      image: imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Product image uploaded successfully",
      data: productImage,
    });
  } catch (error) {
    console.error(
      "UPLOAD PRODUCT IMAGE ERROR:",
      error
    );

    if (req.file?.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (fileError) {
        console.error(
          "FILE CLEANUP ERROR:",
          fileError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to upload product image",
    });
  }
};

// ==========================================
// DELETE PRODUCT IMAGE
// ==========================================

const deleteProductImage = async (req, res) => {
  try {
    const { productId, imageId } =
      req.params;

    const image =
      await ProductImage.findOne({
        where: {
          id: imageId,
          product_id: productId,
        },
      });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Product image not found",
      });
    }

    const wasPrimary = image.is_primary;

    // Delete physical file
    if (image.image_url) {
      const filePath = path.join(
        __dirname,
        "../../",
        image.image_url.replace(
          /^\/+/,
          ""
        )
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await image.destroy();

    // If primary image was deleted,
    // choose another image as primary
    if (wasPrimary) {
      const nextImage =
        await ProductImage.findOne({
          where: {
            product_id: productId,
          },
          order: [["id", "ASC"]],
        });

      const product =
        await Product.findByPk(productId);

      if (nextImage) {
        await nextImage.update({
          is_primary: true,
        });

        await product.update({
          image: nextImage.image_url,
        });
      } else {
        await product.update({
          image: null,
        });
      }
    }

    return res.json({
      success: true,
      message:
        "Product image deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT IMAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete product image",
    });
  }
};

module.exports = {
  getProductImages,
  uploadProductImage,
  deleteProductImage,
};