const Sequelize = require("sequelize");
const db = require("../config/database");

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

// SubBoard.belongsTo(Board, {
//   foreignKey: { name: "boardId" },
// });

//SubBoard.hasMany(Subject, { foreignKey: 'subBoardId' });

module.exports = { User, Roles };
