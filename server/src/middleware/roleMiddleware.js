const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    // Make sure authentication middleware ran first
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check admin role
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;