import { getPermissions } from "../config/roles.js";

// to authorize
const authorize = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Assuming user role is stored in req.user

    // Get all permissions for the role (including inherited ones)
    const permissions = getPermissions(userRole);

    // Check if any permission grants access to the resource and action
    const hasPermission = permissions.some(
      (perm) => (perm.resource === resource || perm.resource === "*") && (perm.actions.includes(action) || perm.actions.includes("manage"))
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: You don't have permission." });
    }

    next(); // User has permission, proceed to next middleware
  };
};

export { authorize };
