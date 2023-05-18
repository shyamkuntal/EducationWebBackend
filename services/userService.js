const { Op, Sequelize } = require("sequelize");
const { User, Roles } = require("../models/User.js");

const checkUserRole = async (userId, role) => {
  try {
    const checkUser = await User.findAll({
      where: { id: userId },
      include: [{ model: Roles, attributes: ["roleName"] }],
      raw: true,
      nest: true,
    });

    let userData = checkUser;

    let roleData = checkUser[0].role;

    if (roleData.roleName === role) {
      return userData;
    } else {
      return false;
    }
  } catch (error) {
    throw error;
  }
};
const findUserById = async (userId) => {
  try {
  } catch (err) {
    throw err;
  }
};

module.exports = { checkUserRole, findUserById };
