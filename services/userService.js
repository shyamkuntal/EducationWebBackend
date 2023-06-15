const { Op, Sequelize } = require("sequelize");
const { User, Roles } = require("../models/User.js");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");

const createUser = async (Name, userName, email, password, roleId) => {
  try {
    let user = await User.create({
      Name,
      userName,
      email,
      password,
      roleId,
    });

    return user;
  } catch (err) {
    throw err;
  }
};

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

const findUserByEmail = async (email) => {
  try {
    let user = await User.findOne({ where: { email: email }, raw: true });

    return user;
  } catch (err) {
    throw err;
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

const checkUserEmail = async (email, roleId) => {
  try {
    let user = await User.findOne({
      where: { email: email, roleId: roleId },
      include: [{ model: Roles, attributes: ["roleName"] }],
      nest: true,
    });

    if (user) {
      console.log(user);
      console.log(user.roleId);
      console.log(roleId);

      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "EmailId already exists for this role!"
      );
    }
  } catch (err) {
    throw err;
  }
};

const updatePassword = async (userId, newPassword) => {
  try {
    console.log(userId, newPassword);
    let updatePass = await User.findOne({
      where: { id: userId },
      attributes: ["id"],
    }).then((record) => {
      return record.update({ password: newPassword });
    });
    return updatePass;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  finduser,
  checkUserEmailPassword,
  findByRoleName,
  findUserByEmail,
  updatePassword,
  checkUserEmail,
  createUser,
};
