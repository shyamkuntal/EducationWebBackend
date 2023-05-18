const { User } = require("../models/User.js");

const checkValidRole = (allowedRolesId) => {
  return async (req, res, next) => {
    //here we will take user info from jwt signed token
    const id = req.body.user.id;

    const user = await User.findByPk(id);

    const userRoleId = user.roleId;

    if (allowedRolesId.includes(userRoleId)) {
      // User has a valid role, proceed to the next middleware or route handler
      next();
    } else {
      // User does not have a valid role, send an error response
      res.status(403).json({ error: "Unauthorized" });
    }
  };
};

module.exports = { checkValidRole };
