const Sequelize = require("sequelize");
const db = require("../config/database");
const bcrypt = require("bcrypt");
const { Board, SubBoard } = require("./Board");
const { subjectName } = require("./Subject");
const { grades, roleNames, modules } = require("../constants/constants");
const roles = [
  "Uploader2",
  "Teacher",
  "Pricer",
  "Reviewer",
  "DataGenerator",
  "PastPaper",
  "Supervisor",
  "Superadmin",
];
const User = db.define(
  "user",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    Name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    roleId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSaltSync(10, "a");
          user.password = bcrypt.hashSync(user.password, salt);
        }
      },
    },
    instanceMethods: {
      validPassword: (password) => {
        return bcrypt.compareSync(password, this.password);
      },
    },
  }
);

User.sync().then(() => {
  console.log("User created");
});
User.prototype.validPassword = async (password, hash) => {
  return await bcrypt.compareSync(password, hash);
};

const Roles = db.define("roles", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  roleName: {
    type: Sequelize.STRING,
    enum: roles,
    allowNull: false,
    unique: true,
  },
});

User.belongsTo(Roles, { foreignKey: "roleId" });

Roles.sync().then(() => {
  console.log("Roles created");
});

const UserBoardMapping = db.define("userboardmapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  boardID: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

UserBoardMapping.belongsTo(User, { foreignKey: "userId" });

UserBoardMapping.belongsTo(Board, {
  foreignKey: "boardID",
  targetKey: "id",
  schema: "boards",
});
User.hasMany(UserBoardMapping, { foreignKey: "userId" });

UserBoardMapping.sync().then(() => {
  console.log("UserBoardMapping created");
});

const UserSubBoardMapping = db.define("usersubboardmapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  subBoardId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

UserSubBoardMapping.belongsTo(SubBoard, {
  foreignKey: "subBoardId",
  targetKey: "id",
  schema: "subBoards",
});
UserSubBoardMapping.belongsTo(User, { foreignKey: "userId" });
User.hasMany(UserSubBoardMapping, { foreignKey: "userId" });
UserSubBoardMapping.sync().then(() => {
  console.log("UserSubBoardMapping created");
});

const UserQualificationMapping = db.define("userqualificationmapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  gradeQualification: {
    type: Sequelize.STRING,
    enum: grades,
    allowNull: false,
  },
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

UserQualificationMapping.belongsTo(User, { foreignKey: "userId" });
User.hasMany(UserQualificationMapping, { foreignKey: "userId" });

UserQualificationMapping.sync().then(() => {
  console.log("UserQualificationMapping created");
});

const UserSubjectMapping = db.define("usersubjectmapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  subjectNameIds: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

UserSubjectMapping.belongsTo(subjectName, {
  foreignKey: "subjectNameIds",
  targetKey: "id",
  schema: "subjectNames",
});

User.hasMany(UserSubjectMapping, { foreignKey: "userId" });

UserSubjectMapping.belongsTo(User, { foreignKey: "userId" });

UserSubjectMapping.sync().then(() => {
  console.log("UsersubjectMapping created");
});

const UserModuleMapping = db.define("usermodulemapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  module: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

User.hasMany(UserModuleMapping, { foreignKey: "userId" });
UserModuleMapping.belongsTo(User, { foreignKey: "userId" });

UserModuleMapping.sync().then(() => {
  console.log("UserModuleMapping created");
});

module.exports = {
  User,
  Roles,
  UserQualificationMapping,
  UserSubBoardMapping,
  UserBoardMapping,
  UserSubjectMapping,
  UserModuleMapping,
};
