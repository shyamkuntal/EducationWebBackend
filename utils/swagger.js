const swaggerAutogen = require("swagger-autogen")();

const config = {
  info: {
    version: "1.0.0",
    title: "Eduplanet Dev",
  },
  host: "localhost:3002",
  basePath: "/api",
  schemes: ["http"],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["../routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, config);
