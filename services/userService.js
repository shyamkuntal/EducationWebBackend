import { Sequelize } from "sequelize";
import { User, Roles } from "../models/User.js";

const userService = {
  async checkUserRole(userId, role) {
    try {
      const checkUser = await User.findAll({
        where: { id: userId },
        include: [{ model: Roles, attributes: ["roleName"] }],
        raw: true,
        nest: true,
      });

      let userData = checkUser;

      let roleData = checkUser[0].role;

      if (roleData.roleName === role) {
        return userData;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  },
  async findUserById(userId) {
    try {
    } catch (err) {
      throw err;
    }
  },
};

export { userService };
