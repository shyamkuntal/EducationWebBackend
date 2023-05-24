const {
  Roles,
  User,
  UserBoardMapping,
  UserSubBoardMapping,
  UserQualificationMapping,
  UserSubjectMapping,
} = require("../../models/User.js");
const { roleNames } = require("../../constants/constants.js");
const { Sequelize } = require("sequelize");

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

  async getallroles(req, res) {
    //const userId = req.params.userId;
    try {
      const roles = await Roles.findAll({
        attributes: ["roleName", "id"],
      });
      return res.status(200).json({ roles });
    } catch (error) {
      return res.status(200).json({ msg: error.message });
    }
  },

  async createUser(req, res) {
    const {
      Name,
      userName,
      email,
      password,
      roleId,
      boardIds,
      subboardIds,
      qualifications,
      subjects,
    } = req.body;
    try {
      const user = await User.create({
        Name,
        userName,
        email,
        password,
        roleId,
      });

      //Create boardmapping entries
      if (boardIds && boardIds.length > 0) {
        const boardmapping = boardIds.map((boardid) => ({
          userId: user.id,
          boardID: boardid,
        }));

        await UserBoardMapping.bulkCreate(boardmapping);
      }
      if (subboardIds && subboardIds.length > 0) {
        const subboardmapping = subboardIds.map((subboardid) => ({
          userId: user.id,
          subBoardID: subboardid,
        }));

        await UserSubBoardMapping.bulkCreate(subboardmapping);
      }

      if (qualifications && qualifications.length > 0) {
        const qmapping = qualifications.map((range) => ({
          userId: user.id,
          gradeQualification: range,
        }));

        await UserQualificationMapping.bulkCreate(qmapping);
      }

      if (subjects && subjects.length > 0) {
        const subjectmapping = subjects.map((subjectid) => ({
          userId: user.id,
          subjectNameIds: subjectid,
        }));

        await UserSubjectMapping.bulkCreate(subjectmapping);
      }

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(200).json({ msg: error.message });
    }
  },

  async getusernoroleweise(req, res) {
    try {
      const results = await User.findAll({
        attributes: [
          "roleId",
          [Sequelize.fn("count", Sequelize.col("id")), "totalUsers"],
        ],
        group: "roleId",
      });

      const summary = results.map((result) => {
        const { roleId, totalUsers } = result.dataValues;
        return { roleId, totalUsers };
      });

      summary.forEach((item) => {
        console.log(`Role ID: ${item.roleId} - ${item.totalUsers} users`);
      });
      return res.status(200).json({ summary });
    } catch (error) {
      return res.status(200).json({ msg: error.message });
    }
  },
};
module.exports = AccountManagementController;
