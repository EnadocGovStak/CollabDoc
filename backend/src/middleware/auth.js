// Mock auth middleware for development - no dependencies needed
const auth = () => (req, res, next) => {
    next();
};

/**
 * Check if the user has the required role
 * @param {string[]} roles Array of required roles
 */
const requireRole = (roles) => (req, res, next) => {
    next();
};

module.exports = { auth, requireRole }; 