require("dotenv").config();
const httpStatus = require("http-status");
const services = require("../services/index");
const CONSTANTS = require("../constants/constants");

exports.AuthSuperadmin = () => async (req, res, next) => {
  try {
    let token = req.headers["authorization"].split(" ")[1];
    let decoded = await services.authService.validateToken(token);

    let roleDetails = await services.userService.findByRoleName(CONSTANTS.roleNames.Superadmin);

    if (roleDetails.id === decoded.roleId) {
      req.user = decoded;
      next();
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: "Invalid Role, Access Denied", status: false });
    }
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).send({ error: "Access Denied", status: false });
  }
};

exports.AuthSupervisor = () => async (req, res, next) => {
  try {
    let token = req.headers["authorization"].split(" ")[1];
    let decoded = await services.authService.validateToken(token);

    let roleDetails = await services.userService.findByRoleName(CONSTANTS.roleNames.Supervisor);

    if (roleDetails.id === decoded.roleId) {
      req.user = decoded;
      next();
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: "Invalid Role, Access Denied", status: false });
    }
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).send({ error: "Access Denied", status: false });
  }
};

exports.AuthReviewer = () => async (req, res, next) => {
  try {
    console.log("in auth");
    let token = req.headers["authorization"].split(" ")[1];
    let decoded = await services.authService.validateToken(token);

    let roleDetails = await services.userService.findByRoleName(CONSTANTS.roleNames.Reviewer);

    if (roleDetails.id === decoded.roleId) {
      req.user = decoded;
      next();
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: "Invalid Role, Access Denied", status: false });
    }
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).send({ error: "Access Denied", status: false });
  }
};

exports.AuthPastPaper = () => async (req, res, next) => {
  try {
    let token = req.headers["authorization"].split(" ")[1];
    let decoded = await services.authService.validateToken(token);

    let roleDetails = await services.userService.findByRoleName(CONSTANTS.roleNames.PastPaper);

    if (roleDetails.id === decoded.roleId) {
      req.user = decoded;
      next();
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: "Invalid Role, Access Denied", status: false });
    }
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).send({ error: "Access Denied", status: false });
  }
};

exports.AuthDataGenerator = () => async (req, res, next) => {
  try {
    let token = req.headers["authorization"].split(" ")[1];
    let decoded = await services.authService.validateToken(token);

    let roleDetails = await services.userService.findByRoleName(CONSTANTS.roleNames.DataGenerator);

    if (roleDetails.id === decoded.roleId) {
      req.user = decoded;
      next();
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: "Invalid Role, Access Denied", status: false });
    }
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).send({ error: "Access Denied", status: false });
  }
};

exports.AuthSuperadminSupervisor = () => async (req, res, next) => {
  try {
    let token = req.headers["authorization"].split(" ")[1];

    let decoded = await services.authService.validateToken(token);

    let superadminRoleDetails = await services.userService.findByRoleName(
      CONSTANTS.roleNames.Superadmin
    );

    let supervisorRoleDetails = await services.userService.findByRoleName(
      CONSTANTS.roleNames.Supervisor
    );

    if (
      superadminRoleDetails.id === decoded.roleId ||
      supervisorRoleDetails.id === decoded.roleId
    ) {
      req.user = decoded;
      next();
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: "Invalid Role, Access Denied", status: false });
    }
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).send({ error: "Access Denied", status: false });
  }
};

exports.AuthUploader2 = () => async (req, res, next) => {
  try {
    let token = req.headers["authorization"].split(" ")[1];

    let decoded = await services.authService.validateToken(token);

    let uploader2RoleDetails = await services.userService.findByRoleName(
      CONSTANTS.roleNames.Uploader2
    );

    if (uploader2RoleDetails.id === decoded.roleId) {
      req.user = decoded;
      next();
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: "Invalid Role, Access Denied", status: false });
    }
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).send({ error: "Access Denied", status: false });
  }
};

exports.AuthTeacher = () => async (req, res, next) => {
  try {
    let token = req.headers["authorization"].split(" ")[1];

    let decoded = await services.authService.validateToken(token);

    let teacherRoleDetail = await services.userService.findByRoleName(
      CONSTANTS.roleNames.Teacher
    );

    if (teacherRoleDetail.id === decoded.roleId) {
      req.user = decoded;
      next();
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: "Invalid Role, Access Denied", status: false });
    }
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).send({ error: "Access Denied", status: false });
  }
};

exports.Auth = () => async (req, res, next) => {
  try {
    let token = req.headers["authorization"].split(" ")[1];

    console.log(token);
    let decoded = await services.authService.validateToken(token);

    if (decoded) {
      req.user = decoded;
      next();
    }
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).send({ error: "Access Denied", status: false });
  }
};

// const checkValidRole = (allowedRolesId) => {
//   return async (req, res, next) => {
//     //here we will take user info from jwt signed token
//     const id = req.body.user.id;

//     const user = await User.findByPk(id);

//     const userRoleId = user.roleId;

//     if (allowedRolesId.includes(userRoleId)) {
//       // User has a valid role, proceed to the next middleware or route handler
//       next();
//     } else {
//       // User does not have a valid role, send an error response
//       res.status(403).json({ error: "Unauthorized" });
//     }
//   };
// };
