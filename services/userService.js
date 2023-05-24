const { Op, Sequelize } = require("sequelize");
const { User, Roles } = require("../models/User.js");

const finduser = async (userId) => {
  try {
    const checkUser = await User.findOne({
      where: { id: userId },
      include: [{ model: Roles, attributes: ["roleName"] }],
      raw: true,
      nest: true,
    });

    return checkUser;
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

module.exports = { finduser, findUserById };
