const { Roles, User } = require("../../models/User.js");
const { roleNames } = require("../../constants/constants.js");

const AccountManagementController = {
  async createUserRole(req, res) {
    const roles = [
      roleNames.Superadmin,
      roleNames.Supervisor,
      roleNames.PastPaper,
      roleNames.Reviewer,
      roleNames.Teacher,
      roleNames.Pricer,
      roleNames.Uploader2,
    ];
    try {
      const role = await Roles.bulkCreate(
        roles.map((roleName) => ({
          roleName,
        }))
      );
      return res.status(200).json({ role });

      console.log(roles);
    } catch (error) {
      return res.status(200).json({ msg: error.message });
    }
  },

  async createUser(req, res) {
    const { Name, userName, email, password, roleId } = req.body;
    try {
      const user = await User.create({
        Name,
        userName,
        email,
        password,
        roleId,
      });

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(200).json({ msg: error.message });
    }
  },
};
module.exports = AccountManagementController;
