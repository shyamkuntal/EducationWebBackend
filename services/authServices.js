const jwt = require("jsonwebtoken");
require("dotenv").config;

const setExpiry = (days) => {
  let date = new Date(Date.now() + days * 24 * 3600000);

  return date;
};

const generateCmsAuthToken = async (user) => {
  try {
    let userId = user.dataValues.id;
    let userRoleId = user.dataValues.roleId;
    let roleName = user.dataValues.role.dataValues.roleName;

    const userObj = { id: userId, roleId: userRoleId, roleName: roleName };
    const token = jwt.sign(userObj, process.env.APP_SECRET, {
      expiresIn: "7d",
    });

    return token;
  } catch (err) {
    throw err;
  }
};

const validateToken = async (token) => {
  return jwt.verify(token, process.env.APP_SECRET);
};

module.exports = {
  setExpiry,
  generateCmsAuthToken,
  validateToken,
};
