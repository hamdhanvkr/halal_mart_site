const { Admin } = require("../models");

const permissionMiddleware = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      // Authentication required
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Admin has full access
      if (req.admin.role === "admin") {
        return next();
      }

      // Find current staff account
      const staff = await Admin.findByPk(req.admin.id);

      if (!staff) {
        return res.status(401).json({
          success: false,
          message: "Staff account not found",
        });
      }

      // Check account status
      if (staff.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Your account is inactive",
        });
      }

      const permissions = Array.isArray(
        staff.permissions
      )
        ? staff.permissions
        : [];

      // Check whether staff has at least one required permission
      const hasPermission = requiredPermissions.some(
        (permission) =>
          permissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action",
        });
      }

      // Store latest staff information
      req.admin = {
        ...req.admin,
        permissions,
      };

      next();
    } catch (error) {
      console.error(
        "Permission middleware error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Permission check failed",
      });
    }
  };
};

module.exports = permissionMiddleware;