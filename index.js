import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import BoardRouters from "./routes/BoardManagement.js";
import SubjectRouters from "./routes/SubjectManagement.js";
import PPMSupervisor from "./routes/PPMSupervisor.js";
import AccountManagement from "./routes/AccountManagement.js";
dotenv.config();
import { db } from "./config/database.js";
const app = express();
app.use(express.json());
app.use(cors());

// import pg from "pg";
// import { connectDb } from "./db.js";
//import User from "./models/User.js";

/* Mongoose setup */
//connectDb();

// Database
//const db = require("./config/database");

// Test DB
db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

// db.sequelize
//   .sync()
//   .then(() => {
//     console.log("Synced db.");
//   })
//   .catch((err) => {
//     console.log("Failed to sync db: " + err.message);
//   });

app.use("/boardmanagement", BoardRouters);
app.use("/subjectmanagement", SubjectRouters);
app.use("/ppmsupervisor", PPMSupervisor);
app.use("/accountmanagement", AccountManagement);
app.post("/users", async (req, res) => {
  try {
    // Extract user details from the request body
    const { name, email, password } = req.body;

    // Create a new user in the database
    const newUser = await User.create({ name, email, password });

    // Send a response with the newly created user
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.get("/getusers", async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(500).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello developer");
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
