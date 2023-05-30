const { Op, Sequelize } = require("sequelize");
const { User, Roles } = require("../models/User.js");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");

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

const findByRoleName = async (roleName) => {
  try {
    let role = Roles.findOne({ where: { roleName: roleName }, raw: true });

    return role;
  } catch (err) {
    throw error;
  }
};

const checkUserEmailPassword = async (email, password, roleId) => {
  try {
    let user = await User.findOne({
      where: { email: email },
      include: [{ model: Roles, attributes: ["roleName"] }],
      nest: true,
    });

    if (user) {
      if (user.roleId === roleId) {
        if (await user.validPassword(password, user.password)) {
          return user;
        } else {
          throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Password!");
        }
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Access Denied, Invalid Role!"
        );
      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Email!");
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  finduser,
  checkUserEmailPassword,
  findByRoleName,
};
