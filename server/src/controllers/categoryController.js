const fs = require("fs");
const path = require("path");

const { Category } = require("../models");

// =========================
// SLUG GENERATOR
// =========================

const generateSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// =========================
// UNIQUE SLUG
// =========================

const generateUniqueSlug = async (
  name,
  excludeId = null
) => {
  const baseSlug = generateSlug(name);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const where = {
      slug,
    };

    if (excludeId) {
      const { Op } = require("sequelize");

      where.id = {
        [Op.ne]: excludeId,
      };
    }

    const existingCategory =
      await Category.findOne({
        where,
      });

    if (!existingCategory) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// =========================
// DELETE IMAGE FILE
// =========================

const deleteImageFile = (imagePath) => {
  if (!imagePath) {
    return;
  }

  try {
    let filePath = imagePath;

    if (imagePath.startsWith("/uploads/")) {
      filePath = path.join(
        __dirname,
        "../../",
        imagePath
      );
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      console.log(
        "Deleted category image:",
        filePath
      );
    }
  } catch (error) {
    console.error(
      "IMAGE DELETE ERROR:",
      error.message
    );
  }
};

// =========================
// GET ALL
// =========================

const getCategories = async (req, res) => {
  try {
    const categories =
      await Category.findAll({
        order: [["created_at", "DESC"]],
      });

    return res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(
      "GET CATEGORIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// =========================
// GET ONE
// =========================

const getCategoryById = async (
  req,
  res
) => {
  try {
    const category =
      await Category.findByPk(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "GET CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

// =========================
// CREATE
// =========================

const createCategory = async (
  req,
  res
) => {
  try {
    const {
      name,
      slug,
      description,
      status,
    } = req.body;

    if (!name?.trim()) {
      if (req.file) {
        deleteImageFile(
          `/uploads/categories/${req.file.filename}`
        );
      }

      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const finalSlug =
      slug?.trim() ||
      (await generateUniqueSlug(name));

    // Check manually supplied slug
    const existingSlug =
      await Category.findOne({
        where: {
          slug: finalSlug,
        },
      });

    if (existingSlug) {
      if (req.file) {
        deleteImageFile(
          `/uploads/categories/${req.file.filename}`
        );
      }

      return res.status(409).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    const image = req.file
      ? `/uploads/categories/${req.file.filename}`
      : null;

    const category =
      await Category.create({
        name: name.trim(),
        slug: finalSlug,
        description:
          description?.trim() || null,
        status: status || "active",
        image,
      });

    return res.status(201).json({
      success: true,
      message:
        "Category created successfully",
      category,
    });
  } catch (error) {
    console.error(
      "CREATE CATEGORY ERROR:",
      error
    );

    if (req.file) {
      deleteImageFile(
        `/uploads/categories/${req.file.filename}`
      );
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create category",
    });
  }
};

// =========================
// UPDATE
// =========================

const updateCategory = async (
  req,
  res
) => {
  try {
    const category =
      await Category.findByPk(
        req.params.id
      );

    if (!category) {
      if (req.file) {
        deleteImageFile(
          `/uploads/categories/${req.file.filename}`
        );
      }

      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      slug,
      description,
      status,
    } = req.body;

    if (!name?.trim()) {
      if (req.file) {
        deleteImageFile(
          `/uploads/categories/${req.file.filename}`
        );
      }

      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const finalSlug =
      slug?.trim() ||
      generateSlug(name);

    // Check slug
    const existingSlug =
      await Category.findOne({
        where: {
          slug: finalSlug,
          id: {
            [require("sequelize").Op.ne]:
              category.id,
          },
        },
      });

    if (existingSlug) {
      if (req.file) {
        deleteImageFile(
          `/uploads/categories/${req.file.filename}`
        );
      }

      return res.status(409).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    const oldImage = category.image;

    const newImage = req.file
      ? `/uploads/categories/${req.file.filename}`
      : oldImage;

    await category.update({
      name: name.trim(),
      slug: finalSlug,
      description:
        description?.trim() || null,
      status: status || "active",
      image: newImage,
    });

    // Delete old image only after successful update
    if (
      req.file &&
      oldImage &&
      oldImage !== newImage
    ) {
      deleteImageFile(oldImage);
    }

    return res.json({
      success: true,
      message:
        "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      error
    );

    if (req.file) {
      deleteImageFile(
        `/uploads/categories/${req.file.filename}`
      );
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update category",
    });
  }
};

// =========================
// DELETE
// =========================

const deleteCategory = async (
  req,
  res
) => {
  try {
    const category =
      await Category.findByPk(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const oldImage = category.image;

    await category.destroy();

    if (oldImage) {
      deleteImageFile(oldImage);
    }

    return res.json({
      success: true,
      message:
        "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete category",
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};