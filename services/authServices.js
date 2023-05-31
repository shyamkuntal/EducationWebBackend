const jwt = require("jsonwebtoken");
require("dotenv").config;
const transporter = require("../config/nodemailerSES");
const httpStatus = require("http-status");
const { ApiError } = require("../middlewares/apiError.js");

const setExpiry = (days) => {
  let date = new Date(Date.now() + days * 24 * 3600000);

  return date;
};

const generateCmsAuthToken = async (user, expiryInDays) => {
  try {
    let userId = user.dataValues.id;
    let userRoleId = user.dataValues.roleId;
    let roleName = user.dataValues.role.dataValues.roleName;

    const userObj = { id: userId, roleId: userRoleId, roleName: roleName };
    const token = jwt.sign(userObj, process.env.APP_SECRET, {
      expiresIn: expiryInDays,
    });

    return token;
  } catch (err) {
    throw err;
  }
};

const generatePasswordResetAuthToken = async (
  tokenData,
  secret,
  expiryInMins
) => {
  try {
    const token = jwt.sign(tokenData, secret, {
      expiresIn: expiryInMins,
    });

    return token;
  } catch (err) {
    throw err;
  }
};

const validateToken = async (token) => {
  return jwt.verify(token, process.env.APP_SECRET);
};

const decodeResetPasswordToken = async (token) => {
  return jwt.decode(token);
};

const validateResetPasswordToken = async (token, passwordSecret) => {
  let decode = await jwt.verify(token, passwordSecret, (err, decode) => {
    if (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Token!");
    } else {
      console.log(decode);
      return decode;
    }
  });

  return decode;
};

const sendResetPasswordEmail = async (mailOptions, toEmail) => {
  try {
    console.log("in email");

    let emailResponse = await transporter.sendMail({
      ...mailOptions,
    });

    if (emailResponse.accepted) {
      return true;
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  setExpiry,
  generateCmsAuthToken,
  validateToken,
  sendResetPasswordEmail,
  generatePasswordResetAuthToken,
  decodeResetPasswordToken,
  validateResetPasswordToken,
};
