const bcrypt = require("bcryptjs");

const { Admin } = require("../models");

// ======================================================
// ALLOWED STAFF PERMISSIONS
// ======================================================

const ALLOWED_PERMISSIONS = [
  "products",
  "categories",
  "inventory",
  "orders",
  "customers",
  "reports",
];

// ======================================================
// REMOVE PASSWORD FROM RESPONSE
// ======================================================

const formatStaff = (staff) => {
  return {
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
    permissions: Array.isArray(staff.permissions)
      ? staff.permissions
      : [],
    status: staff.status,
    created_at: staff.created_at,
    updated_at: staff.updated_at,
  };
};

// ======================================================
// GET ALL STAFF
// ======================================================

const getStaff = async (req, res) => {
  try {
    const staff = await Admin.findAll({
      where: {
        role: "staff",
      },
      attributes: {
        exclude: ["password"],
      },
      order: [["id", "DESC"]],
    });

    return res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Get staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE STAFF
// ======================================================

const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Admin.findOne({
      where: {
        id,
        role: "staff",
      },
      attributes: {
        exclude: ["password"],
      },
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    return res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Get staff by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      error: error.message,
    });
  }
};

// ======================================================
// CREATE STAFF
// ======================================================

const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      permissions = [],
      status = "active",
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // Validate permissions
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message:
          "Permissions must be an array",
      });
    }

    const invalidPermissions =
      permissions.filter(
        (permission) =>
          !ALLOWED_PERMISSIONS.includes(
            permission
          )
      );

    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid permissions",
        invalidPermissions,
      });
    }

    // Check email
    const existingAdmin = await Admin.findOne({
      where: {
        email,
      },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // Create staff
    const staff = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "staff",
      permissions,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: formatStaff(staff),
    });
  } catch (error) {
    console.error("Create staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create staff",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE STAFF
// ======================================================

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      password,
      permissions,
      status,
    } = req.body;

    const staff = await Admin.findOne({
      where: {
        id,
        role: "staff",
      },
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    // Email validation
    if (email && email !== staff.email) {
      const existingEmail =
        await Admin.findOne({
          where: {
            email,
          },
        });

      if (
        existingEmail &&
        existingEmail.id !== staff.id
      ) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists",
        });
      }

      staff.email = email;
    }

    if (name) {
      staff.name = name;
    }

    // Update password only if supplied
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters",
        });
      }

      staff.password =
        await bcrypt.hash(password, 12);
    }

    // Update permissions
    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message:
            "Permissions must be an array",
        });
      }

      const invalidPermissions =
        permissions.filter(
          (permission) =>
            !ALLOWED_PERMISSIONS.includes(
              permission
            )
        );

      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid permissions",
          invalidPermissions,
        });
      }

      staff.permissions = permissions;
    }

    // Update status
    if (status !== undefined) {
      if (
        !["active", "inactive"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      staff.status = status;
    }

    await staff.save();

    return res.json({
      success: true,
      message: "Staff updated successfully",
      data: formatStaff(staff),
    });
  } catch (error) {
    console.error("Update staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update staff",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE STAFF
// ======================================================

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Admin.findOne({
      where: {
        id,
        role: "staff",
      },
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    await staff.destroy();

    return res.json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    console.error("Delete staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete staff",
      error: error.message,
    });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};