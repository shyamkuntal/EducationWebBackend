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

      // Creating jwt for user

      let token = await services.authService.generateCmsAuthToken(user);

      res
        .cookie("ExamCare-token", token, {
          expires: services.authService.setExpiry(7),
        })
        .status(httpStatus.OK)
        .send(user);
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
      if (auth && user) {
        res.status(httpStatus.OK).send(user);
      }
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
