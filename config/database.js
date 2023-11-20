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
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    retry: {
      match: [/Deadlock/i, Sequelize.ConnectionError], // Retry on connection errors
      max: 3, // Maximum retry 3 times
      backoffBase: 3000, // Initial backoff duration in ms. Default: 100,
      backoffExponent: 1.5, // Exponent to increase backoff each try. Default: 1.1
    },
    logging: (msg) => console.log(msg),
  }
);

module.exports = db;
