const { Op, Sequelize } = require("sequelize");
const {
  User,
  Roles,
  UserSubjectMapping,
  UserBoardMapping,
  UserSubBoardMapping,
  UserQualificationMapping,
  UserModuleMapping,
} = require("../models/User.js");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");
const bcrypt = require("bcrypt");

const bulkCreateRoles = async (rolesArray) => {
  try {
    let bulkCreateRoles = await Roles.bulkCreate(rolesArray, {
      returning: ["id", "roleName"],
      updateOnDuplicate: ["roleName"],
    });

    return bulkCreateRoles;
  } catch (err) {
    throw err;
  }
};

const createUser = async (Name, userName, email, password, roleId) => {
  try {
    let user = await User.create({
      Name,
      userName,
      email: email.toLowerCase(),
      password,
      roleId,
    });

    return user;
  } catch (err) {
    throw err;
  }
};

const updateUser = async (dataToBeUpdated, whereQuery) => {
  try {
    let user = await User.update(dataToBeUpdated, whereQuery);

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

const getUserAssignedSubjects = async (userId) => {
  try {
    const getUserSubjects = await UserSubjectMapping.findAll({
      where: { userId: userId },
      raw: true,
      nest: true,
    });
    return getUserSubjects;
  } catch (error) {
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    let user = await User.findOne({ where: { email: email.toLowerCase(), }, raw: true });

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

const findRoleById = async (roleId) => {
  try {
    let role = Roles.findOne({ where: { id: roleId }, raw: true });

    return role;
  } catch (err) {
    throw err;
  }
};

const checkUserEmailPassword = async (email, password, roleId) => {
  try {
    let user = await User.findOne({
      where: { email: email.toLowerCase(), roleId: roleId },
      include: [{ model: Roles, attributes: ["roleName"] }],
      nest: true,
    });

    if (user) {
      if (user.roleId === roleId) {
        if (await user.validPassword(password, user.password)) {
          return user;
        } else {
          throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Email or Password!");
        }
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, "Access Denied, Invalid Role!");
      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Email or Password!");
    }
  } catch (err) {
    throw err;
  }
};

const checkUserEmail = async (email, roleId) => {
  try {
    let user = await User.findOne({
      where: { email: email.toLowerCase(), roleId: roleId },
      include: [{ model: Roles, attributes: ["roleName"] }],
      raw: true,
      nest: true,
    });

    if (user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email Id already exists for this role!");
    }
  } catch (err) {
    throw err;
  }
};

const checkUserName = async (userName, roleId) => {
  try {
    let user = await User.findOne({
      where: { userName: userName, roleId: roleId },
      include: [{ model: Roles, attributes: ["roleName"] }],
      raw: true,
      nest: true,
    });

    if (user) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User Name taken for this role, Please choose a different User Name"
      );
    }
  } catch (err) {
    throw err;
  }
};

const updatePassword = async (userId, newPassword) => {
  try {
    const salt = await bcrypt.genSaltSync(10, "a");
    let hashedPass = bcrypt.hashSync(newPassword, salt);

    console.log(hashedPass);

    let updatePass = await User.update({ password: hashedPass }, { where: { id: userId } });
    return updatePass;
  } catch (err) {
    throw err;
  }
};

const findUserSubjectsBoardSubBoardQualificationModules = async (id) => {
  try {
    let userDetails = await User.findOne({
      where: { id: id },
      attributes: ["id", "Name", "email", "userName", "roleId"],
      include: [
        { model: UserBoardMapping, attributes: ["boardID"] },
        { model: UserSubBoardMapping, attributes: ["subBoardId"] },
        { model: UserSubjectMapping, attributes: ["subjectNameIds", "userId"] },
        {
          model: UserQualificationMapping,
          attributes: ["id", "gradeQualification", "userId"],
        },
        {
          model: UserModuleMapping,
          attributes: ["id", "module", "userId"],
        },
      ],
    });

    return userDetails;
  } catch (err) {
    throw err;
  }
};

const bulkCreateUserBoardMappings = async (boardmapping) => {
  try {
    let bulkCreate = await UserBoardMapping.bulkCreate(boardmapping);
    return bulkCreate;
  } catch (err) {
    throw err;
  }
};

const bulkCreateUserSubBoardMappings = async (subboardmapping) => {
  try {
    let bulkCreate = await UserSubBoardMapping.bulkCreate(subboardmapping);
    return bulkCreate;
  } catch (err) {
    throw err;
  }
};

const bulkCreateUserQualificationMappings = async (qmapping) => {
  try {
    let bulkCreate = await UserQualificationMapping.bulkCreate(qmapping);
    return bulkCreate;
  } catch (err) {
    throw err;
  }
};

const bulkCreateUserSubjectMappings = async (subjectmapping) => {
  try {
    let bulkCreate = await UserSubjectMapping.bulkCreate(subjectmapping);
    return bulkCreate;
  } catch (err) {
    throw err;
  }
};

const bulkCreateUserModuleMappings = async (moduleMappings) => {
  try {
    let bulkCreateModuleMappings = await UserModuleMapping.bulkCreate(moduleMappings);
    return bulkCreateModuleMappings;
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
  findUserSubjectsBoardSubBoardQualificationModules,
  updateUser,
  getUserAssignedSubjects,
  bulkCreateUserBoardMappings,
  bulkCreateUserSubBoardMappings,
  bulkCreateUserQualificationMappings,
  bulkCreateUserSubjectMappings,
  bulkCreateRoles,
  findRoleById,
  checkUserName,
  bulkCreateUserModuleMappings,
};
