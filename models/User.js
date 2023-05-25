const Sequelize = require("sequelize");
const db = require("../config/database");
const gradeRange = ["1-5", "6-8", "9-10", "11-12"];
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
const User = db.define("user", {
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
});

User.sync().then(() => {
  console.log("User created");
});

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

UserBoardMapping.sync().then(() => {
  console.log("UserBoardMapping created");
});

const UserSubBoardMapping = db.define("usersubboardmapping", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  subBoardID: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

UserSubBoardMapping.belongsTo(User, { foreignKey: "userId" });

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
    enum: gradeRange,
    allowNull: false,
  },
  userId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
});

UserQualificationMapping.belongsTo(User, { foreignKey: "userId" });

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

User.hasMany(UserSubjectMapping, { foreignKey: "userId" });
UserSubjectMapping.belongsTo(User, { foreignKey: "userId" });

UserSubjectMapping.sync().then(() => {
  console.log("UsersubjectMapping created");
});

// SubBoard.belongsTo(Board, {
//   foreignKey: { name: "boardId" },
// });

//SubBoard.hasMany(Subject, { foreignKey: 'subBoardId' });

module.exports = {
  User,
  Roles,
  UserQualificationMapping,
  UserSubBoardMapping,
  UserBoardMapping,
  UserSubjectMapping,
};
