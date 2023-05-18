import { Sequelize } from "sequelize";
import { db } from "../config/database.js";

const PastPaper = db.define("pastPaper", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  paperNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  googleLink: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  questionPdf: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  answerPdf: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  imagebanner: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

PastPaper.sync().then(() => {
  console.log("PastPaper created");
});

export { PastPaper };
