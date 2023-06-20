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
const { subjectName } = require("../../models/Subject.js");
const { Sheet } = require("../../models/Sheet.js");
const { SubBoard, Board } = require("../../models/Board.js");
const services = require("../../services");
const { findRoleByNameSchema } = require("../../validations/RoleValidation.js");
const httpStatus = require("http-status");
const {
  getSubBoardsSchema,
  createAccountSchema,
  editAccountSchema,
  getSubjectNameByIdSchema,
  toggleActivateUserSchema,
  getUserBoardSubBoardSubjectSchema,
} = require("../../validations/AccountManagementValidation.js");

const AccountManagementController = {
  async createUserRole(req, res, next) {
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
    } catch (err) {
      next(err);
    }
  },

  async getallroles(req, res, next) {
    const roleId = req.params.roleId;
    try {
      const roles = await Roles.findAll({
        attributes: ["roleName", "id"],
      });
      return res.status(200).json({
        roles: roles,
      });
    } catch (err) {
      next(err);
    }
  },

  async getallrolesbyRole(req, res, next) {
    const roleId = req.params.roleId;
    try {
      const roles = await Roles.findAll({
        attributes: ["roleName", "id"],
      });
      const rolesForSupervisor = [
        "ce4afb0a-91b3-454a-a515-70c3cbb7b69b",
        "c0ac1044-4d52-4305-b764-02124bd66434",
      ];
      const rolesForSuperAdmin = [
        "ce4afb0a-91b3-454a-a515-70c3cbb7b69b",
        "c0ac1044-4d52-4305-b764-02124bd66434",
        "11be6989-f4c7-4646-a474-b5023d937c73",
      ];
      if (roleId === "11be6989-f4c7-4646-a474-b5023d937c73") {
        rolesForSuperAdmin.pop("11be6989-f4c7-4646-a474-b5023d937c73");
      }

      const avialableRoles = roles.filter((role) => {
        if (rolesForSuperAdmin.includes(role.id)) {
          return role;
        }
      });
      return res.status(200).json({
        roles: avialableRoles,
      });
    } catch (err) {
      next(err);
    }
  },

  async createUser(req, res, next) {
    try {
      let values = await createAccountSchema.validateAsync(req.body);

      let checkEmail = await services.userService.checkUserEmail(
        values.email,
        values.roleId
      );

      console.log(values);
      console.log(checkEmail);

      let user = await services.userService.createUser(
        values.Name,
        values.userName,
        values.email,
        values.password,
        values.roleId
      );

      //Create boardmapping entries
      if (values.boardIds && values.boardIds.length > 0) {
        console.log("in board mapping");
        const boardmapping = values.boardIds.map((boardid) => ({
          userId: user.id,
          boardID: boardid,
        }));

        await UserBoardMapping.bulkCreate(boardmapping);
      }
      if (values.subBoardIds && values.subBoardIds.length > 0) {
        console.log("in subboard mapping");
        const subboardmapping = values.subBoardIds.map((subboardid) => ({
          userId: user.id,
          subBoardId: subboardid,
        }));

        await UserSubBoardMapping.bulkCreate(subboardmapping);
      }

      if (values.qualifications && values.qualifications.length > 0) {
        const qmapping = qualifications.map((range) => ({
          userId: user.id,
          gradeQualification: range,
        }));

        await UserQualificationMapping.bulkCreate(qmapping);
      }

      if (values.subjectsIds && values.subjectsIds.length > 0) {
        console.log("in subject mapping");
        const subjectmapping = values.subjectsIds.map((subjectid) => ({
          userId: user.id,
          subjectNameIds: subjectid,
        }));

        await UserSubjectMapping.bulkCreate(subjectmapping);
      }

      res.status(httpStatus.OK).send({ user });
    } catch (err) {
      next(err);
    }
  },

  async editUser(req, res, next) {
    try {
      let values = await editAccountSchema.validateAsync(req.body);

      console.log(values);
      const user = await User.findByPk(values.userId);

      if (!user) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: "User not found" });
      }

      // Update user details
      user.Name = values.Name;
      user.userName = values.userName;

      await user.save();

      let dataToBeUpdated = {
        Name: values.Name,
        userName: values.userName,
      };
      let whereQuery = {
        where: {
          id: user.id,
        },
      };

      await services.userService.updateUser(dataToBeUpdated, whereQuery);

      if (values.password && values.password.length > 1) {
        await services.userService.updatePassword(
          values.userId,
          values.password
        );
      }

      // Update board mapping entries
      await UserBoardMapping.destroy({ where: { userId: values.userId } });
      if (values.boardIds && values.boardIds.length > 0) {
        const boardmapping = values.boardIds.map((boardId) => ({
          userId: values.userId,
          boardID: boardId,
        }));

        await UserBoardMapping.bulkCreate(boardmapping);
      }

      await UserSubBoardMapping.destroy({ where: { userId: values.userId } });
      // Update subboard mapping entries
      if (values.subBoardIds && values.subBoardIds.length > 0) {
        const subboardmapping = values.subBoardIds.map((subboardId) => ({
          userId: values.userId,
          subBoardId: subboardId,
        }));

        await UserSubBoardMapping.bulkCreate(subboardmapping);
      }

      if (values.qualifications) {
        await UserQualificationMapping.destroy({
          where: { userId: values.userId },
        });
        // Update qualification mapping entries
        if (values.qualifications && values.qualifications.length > 0) {
          const qmapping = values.qualifications.map((range) => ({
            userId: values.userId,
            gradeQualification: range,
          }));

          await UserQualificationMapping.bulkCreate(qmapping);
        }
      }

      await UserSubjectMapping.destroy({ where: { userId: values.userId } });
      // Update subject mapping entries
      if (values.subjectsIds && values.subjectsIds.length > 0) {
        const subjectmapping = values.subjectsIds.map((subjectId) => ({
          userId: values.userId,
          subjectNameIds: subjectId,
        }));

        await UserSubjectMapping.bulkCreate(subjectmapping);
      }

      return res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async getusernoroleweise(req, res, next) {
    try {
      const roleId = req.query.roleId;

      const results = await User.findAll({
        attributes: [
          "roleId",
          [Sequelize.fn("count", Sequelize.col("user.id")), "totalUsers"],
        ],
        include: [
          {
            model: Roles,
            attributes: ["roleName"],
          },
        ],
        group: ["roleId", "role.id"],
      });

      let userCount = {};

      results.map(
        (item) =>
          (userCount[item.role.roleName + "Count"] = item.dataValues.totalUsers)
      );

      return res.status(200).json(userCount);
    } catch (err) {
      next(err);
    }
  },

  async getallsubjects(req, res, next) {
    try {
      const subjects = await subjectName.findAll({
        attributes: ["id", "subjectName"],
      });
      return res.status(200).json({ subjects });
    } catch (err) {
      next(err);
    }
  },
  async getallsubjectNamebyid(req, res, next) {
    try {
      let values = await getSubjectNameByIdSchema.validateAsync({
        subjectNameId: req.query.subjectNameId,
      });
      let whereQuery = { where: { id: values.subjectNameId } };

      const subjects = await services.subjectService.findSubjectName(
        whereQuery
      );
      return res.status(httpStatus.OK).send(subjects);
    } catch (err) {
      next(err);
    }
  },

  async getAllUserByRole(req, res) {
    const roleId = req.query.roleId;
    try {
      const users = await User.findAll({
        attributes: ["userName", "email", "Name"],
        where: { roleId },
        include: { all: true, nested: true },
      });

      return res.status(200).json({ users });
    } catch (err) {
      next(err);
    }
  },

  async toggleActivateUser(req, res, next) {
    try {
      let values = await toggleActivateUserSchema.validateAsync(req.body);
      const user = await User.findByPk(values.userId);
      user.isActive = !user.isActive;
      await user.save();
      return res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },
  //{ all: true, nested: true }
  async getSupervisorInfo(req, res) {
    try {
      const roleId = "11be6989-f4c7-4646-a474-b5023d937c73";
      const users = await User.findAll({
        where: { roleId },
        include: { all: true, nested: true },
      });

      // Create an empty object to store the grouped subboard names for each user
      const userSubboardNames = {};

      users.forEach((user) => {
        // Create an empty object to store the grouped subboard names for the current user
        const subboardNamesByBoard = {};

        user.usersubboardmappings.forEach((mapping) => {
          const boardName = mapping.subBoard.board.boardName;
          const subBoardName = mapping.subBoard.SubBoardName;

          if (!subboardNamesByBoard.hasOwnProperty(boardName)) {
            subboardNamesByBoard[boardName] = [];
          }

          subboardNamesByBoard[boardName].push(subBoardName);
        });

        // Store the grouped subboard names for the current user
        userSubboardNames[user.id] = subboardNamesByBoard;
      });

      return res.status(200).json({ users, userSubboardNames });
    } catch (err) {
      next(err);
    }
  },
  async getRoleByName(req, res, next) {
    try {
      let values = await findRoleByNameSchema.validateAsync({
        roleName: req.params.roleName,
      });

      let role = await services.roleService.findRoleByName(values.roleName);

      res.status(httpStatus.OK).send(role);
    } catch (err) {
      next(err);
    }
  },
  async getAllBoards(req, res, next) {
    try {
      let boards = await services.boardService.findAllBoards();

      res.status(httpStatus.OK).send(boards);
    } catch (err) {
      next(err);
    }
  },

  async getSubBoardsById(req, res, next) {
    try {
      let values = await getSubBoardsSchema.validateAsync({
        boardId: req.query.boardId,
      });

      let subBoard = await services.boardService.getSubBoardsByBoardId(
        values.boardId
      );

      res.status(httpStatus.OK).send(subBoard);
    } catch (err) {
      next(err);
    }
  },

  async getUserSubjectBoardSubBord(req, res, next) {
    try {
      let values = await getUserBoardSubBoardSubjectSchema.validateAsync({
        userId: req.query.userId,
      });

      let userDetails =
        await services.userService.findUserSubjectsBoardSubBoard(values.userId);

      res.status(httpStatus.OK).send(userDetails);
    } catch (err) {
      next(err);
    }
  },
};
module.exports = AccountManagementController;
