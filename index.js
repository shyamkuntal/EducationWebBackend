const express = require("express");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes/index.js");
const db = require("./config/database.js");
const { convertToApiError, handleError } = require("./middlewares/apiError.js");

const app = express();
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URLS,
    methods: ["POST", "GET", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

// Test DB
db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

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
