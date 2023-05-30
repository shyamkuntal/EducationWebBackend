const { CmsLoginSchema } = require("../../validations/AuthCmsValidation.js");
const httpStatus = require("http-status");
const services = require("../../services/index");

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
        token = await services.authService.generateCmsAuthToken(user, "7d");
      } else {
        token = await services.authService.generateCmsAuthToken(user, "1d");
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
      console.log(userId);
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
};

module.exports = AuthController;
