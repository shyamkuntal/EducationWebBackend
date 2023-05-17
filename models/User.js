// const Sequelize = require("sequelize");
// const db = require("../config/database");
import { Sequelize } from "sequelize";
import { db } from "../config/database.js";
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
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1,
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

export { User, Roles };
