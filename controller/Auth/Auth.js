const { CmsLoginSchema } = require("../../validations/AuthCmsValidation.js");
const httpStatus = require("http-status");
const services = require("../../services/index");
const {
  CmsSendResetPasswordEmailSchema,
  CmsResetPasswordSchema,
} = require("../../validations/AuthCmsValidation.js");
const { ApiError } = require("../../middlewares/apiError.js");

const AuthController = {
  async CmsLogin(req, res, next) {
    try {
      let values = await CmsLoginSchema.validateAsync(req.body);

      let user = await services.userService.checkUserEmailPassword(
        values.email,
        values.password,
        values.roleId
      );
      let token = "";
      // Creating jwt for user
      if (values.remember === true) {
        token = await services.authService.generateCmsAuthToken(user, "20d");
      } else {
        token = await services.authService.generateCmsAuthToken(user, "10d");
      }

      let userDetailsToBeSent = {
        id: user.id,
        name: user.Name,
        userName: user.userName,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.roleName,
        token: token,
      };

      res.status(httpStatus.OK).send(userDetailsToBeSent);
    } catch (err) {
      next(err);
    }
  },

  async isAuth(req, res, next) {
    try {
      let auth = req.user;
      let userId = auth.id;
   
      let user = await services.userService.finduser(userId);

      let userDetailsToBeSent = {
        id: user.id,
        name: user.Name,
        userName: user.userName,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.roleName,
      };
      if (auth && user) {
        res.status(httpStatus.OK).send(userDetailsToBeSent);
      }
    } catch (err) {
      next(err);
    }
  },

  async sendPasswordResetEmail(req, res, next) {
    try {
      let values = await CmsSendResetPasswordEmailSchema.validateAsync(
        req.body
      );

      let user = await services.userService.findUserByEmail(values.toEmail);

      if (user) {
        let dataTobeSetInToken = {
          id: user.id,
        };
        // create token to verify on resetpassword api
        let token = await services.authService.generatePasswordResetAuthToken(
          dataTobeSetInToken,
          user.password,
          900
        );

       

        // password reset link with jwt to be sent on frontend
        let passResetLink =
          process.env.CLIENT_URL +
          process.env.CLIENT_PASSWORD_RESET_ROUTE +
          "?token=" +
          token;

        // sending email
        const mailOptions = {
          from: "sarvesh@turnkey.work",
          to: user.email,
          subject: "Reset Your Password",
          html: `<h1>Hello, Please find your password reset link below.</h1><br><a href="${passResetLink}"><b>Reset Password</b></a>`,
        };

        let sendEmail = await services.authService.sendResetPasswordEmail(
          mailOptions
        );
        if (sendEmail) {
          res
            .status(httpStatus.OK)
            .send({ message: "Password reset email sent!" });
        }
      } else {
        res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: "Email does not exist!" });
      }
    } catch (err) {
      next(err);
    }
  },
  async resetPassword(req, res, next) {
    try {
      let values = await CmsResetPasswordSchema.validateAsync(req.body);

      let decodeToken = await services.authService.decodeResetPasswordToken(
        values.token
      );

      if (decodeToken) {
        let user = await services.userService.finduser(decodeToken.id);

        let validateToken =
          await services.authService.validateResetPasswordToken(
            values.token,
            user.password
          );

        if (validateToken) {
          let updateNewPassword = await services.userService.updatePassword(
            validateToken.id,
            values.newPassword
          );

          if (updateNewPassword) {
            res
              .status(httpStatus.OK)
              .send({ message: "Password reset successfull!" });
          }
        }
      }
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
