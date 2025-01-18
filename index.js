const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes/index.js");
const db = require("./config/database.js");
const { convertToApiError, handleError } = require("./middlewares/apiError.js");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./utils/swagger.json");
const logger = require("./middlewares/loggerMiddleware");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(logger); 

//API DOCS
if (process.env.NODE_ENV === "dev") {
  app.use('/logs', express.static('logs'));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// CORS
if (process.env.NODE_ENV === "production") {
  app.use(
    cors({
      origin: process.env.CLIENT_URLS,
      methods: ["POST", "GET", "PUT", "DELETE"],
      credentials: true,
    })
  );
} else {
  app.use(
    cors({
      origin: "*",
      methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
    })
  );
}

// Test DB
db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

//MongoDb Connection
const mongoUri = process.env.MONGO_DB_URL;

mongoose.connect(mongoUri);

const connection = mongoose.connection;

if (connection) {
  console.log("MongoDB Connected!");
}


// api route
app.use("/api", routes);

//API ERROR HANDLING
app.use(convertToApiError);
app.use((err, req, res, next) => {
  handleError(err, res);
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
