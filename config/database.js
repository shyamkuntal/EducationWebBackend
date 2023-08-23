const Sequelize = require("sequelize");
require("dotenv").config();

const db = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: "eduplanet-dev.cf9kzprqr4ax.ap-south-1.rds.amazonaws.com",
    dialect: "postgres",
    synchronize: true, // Automatically creates tables based on model definitions
    logging: true,
  }
);

module.exports = db;
