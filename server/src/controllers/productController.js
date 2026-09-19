const { Product, Category, ProductImage, ProductVariant } =
  require("../models");

const generateSlug = require("../utils/generateSlug");
const generateSku = require("../utils/generateSku");

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PRODUCT
|--------------------------------------------------------------------------
*/

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: ProductImage,
          as: "images",
        },
        {
          model: ProductVariant,
          as: "variants",
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| PREVIEW SKU
|--------------------------------------------------------------------------
*/

const previewSku = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || !name.trim()) {
      return res.status(200).json({
        success: true,
        sku: "",
      });
    }

    const sku = await generateSku(name);

    return res.status(200).json({
      success: true,
      sku,
    });
  } catch (error) {
    console.error("Preview SKU error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate SKU",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

const createProduct = async (req, res) => {
  try {
    console.log("========== CREATE PRODUCT ==========");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
      category_id,
      name,
      description,
      price,
      discount_price,
      stock,
      status,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Check Category
    |--------------------------------------------------------------------------
    */

    const category = await Category.findByPk(category_id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Slug
    |--------------------------------------------------------------------------
    */

    const generatedSlug = await generateSlug(
      name
    );

    /*
    |--------------------------------------------------------------------------
    | Generate SKU
    |--------------------------------------------------------------------------
    */

    const generatedSku = await generateSku(
      name
    );

    /*
    |--------------------------------------------------------------------------
    | Product Image
    |--------------------------------------------------------------------------
    */

    let imagePath = null;

console.log("========== IMAGE DEBUG ==========");
console.log("req.file:", req.file);

if (req.file) {
  console.log("FILE FIELD:", req.file.fieldname);
  console.log("FILE NAME:", req.file.filename);
  console.log("FILE PATH:", req.file.path);
  console.log("FILE TYPE:", req.file.mimetype);
  console.log("FILE SIZE:", req.file.size);

  imagePath = `/uploads/products/${req.file.filename}`;

  console.log("IMAGE PATH TO DB:", imagePath);
} else {
  console.log("❌ NO FILE RECEIVED BY MULTER");
}

    /*
    |--------------------------------------------------------------------------
    | Create Product
    |--------------------------------------------------------------------------
    */

    const product = await Product.create({
      category_id: Number(category_id),

      name: name.trim(),

      slug: generatedSlug,

      sku: generatedSku,

      description:
        description?.trim() || null,

      price: Number(price),

      discount_price:
        discount_price !== undefined &&
        discount_price !== null &&
        discount_price !== ""
          ? Number(discount_price)
          : null,

      stock:
        stock !== undefined &&
        stock !== null &&
        stock !== ""
          ? Number(stock)
          : 0,

      image: imagePath,

      status: status || "active",
    });

    /*
    |--------------------------------------------------------------------------
    | Create ProductImage Record
    |--------------------------------------------------------------------------
    |
    | This also keeps your product_images table synchronized.
    |
    */

    if (imagePath) {
      await ProductImage.create({
        product_id: product.id,
        image_url: imagePath,
        is_primary: true,
        sort_order: 0,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get Created Product
    |--------------------------------------------------------------------------
    */

    const createdProduct =
      await Product.findByPk(
        product.id,
        {
          include: [
            {
              model: Category,
              as: "category",
              attributes: [
                "id",
                "name",
                "slug",
              ],
            },
            {
              model: ProductImage,
              as: "images",
            },
          ],
        }
      );

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",

      product: createdProduct,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      name,
      description,
      price,
      discount_price,
      stock,
      status,
    } = req.body;

    console.log("========== UPDATE PRODUCT ==========");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    /*
    |--------------------------------------------------------------------------
    | Find Product
    |--------------------------------------------------------------------------
    */

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Check Category
    |--------------------------------------------------------------------------
    */

    const category =
      await Category.findByPk(
        category_id
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Keep Existing Image
    |--------------------------------------------------------------------------
    */

    let imagePath = product.image;

    /*
    |--------------------------------------------------------------------------
    | Replace Image
    |--------------------------------------------------------------------------
    */

    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;

      console.log(
        "New product image:",
        imagePath
      );

      /*
      |--------------------------------------------------------------------------
      | Update ProductImage
      |--------------------------------------------------------------------------
      */

      const primaryImage =
        await ProductImage.findOne({
          where: {
            product_id: product.id,
            is_primary: true,
          },
        });

      if (primaryImage) {
        await primaryImage.update({
          image_url: imagePath,
        });
      } else {
        await ProductImage.create({
          product_id: product.id,
          image_url: imagePath,
          is_primary: true,
          sort_order: 0,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Product
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | SKU is intentionally NOT changed.
    |
    */

    await product.update({
      category_id: Number(category_id),

      name: name.trim(),

      description:
        description?.trim() || null,

      price: Number(price),

      discount_price:
        discount_price !== undefined &&
        discount_price !== null &&
        discount_price !== ""
          ? Number(discount_price)
          : null,

      stock:
        stock !== undefined &&
        stock !== null &&
        stock !== ""
          ? Number(stock)
          : 0,

      image: imagePath,

      status: status || "active",
    });

    /*
    |--------------------------------------------------------------------------
    | Return Updated Product
    |--------------------------------------------------------------------------
    */

    const updatedProduct =
      await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: "category",
            attributes: [
              "id",
              "name",
              "slug",
            ],
          },
          {
            model: ProductImage,
            as: "images",
          },
        ],
      });

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product =
      await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  previewSku,
  createProduct,
  updateProduct,
  deleteProduct,
};