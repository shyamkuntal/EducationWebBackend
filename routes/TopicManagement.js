const express = require("express");
const TopicManagementController = require("../controller/TopicManagement/TopicManagement");
const paginatedTopicTasks = require("../middlewares/paginatedTopicTasks");

const router = express.Router();

// /api/topicmanagement/createtopictask
router.post("/createtopictask", TopicManagementController.createTopicTask);

// /api/topicmanagement/getalltopictasks
router.get("/getalltopictasks", paginatedTopicTasks(), (req, res) => {
  res.json(res.paginatedResults);
});

module.exports = router;
