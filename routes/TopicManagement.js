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

// /api/topicmanagement/getalltopicsubtopicvocab
router.get("/getalltopicsubtopicvocab", TopicManagementController.getAllTopicSubTopicVocab);

// /api/topicmanagement/gettopicsubtopicvocabbytopictaskid
router.get(
  "/gettopicsubtopicvocabbytopictaskid",
  TopicManagementController.getTopicSubTopicVocabByTaskId
);

// /api/topicmanagement/updatetopictask
router.put("/updatetopictask", TopicManagementController.updateTopicTask);

// /api/topicmanagement/assigntasktodatagenerator
router.patch("/asssigntasktodatagenerator", TopicManagementController.assignTaskToDataGenerator);

// /api/topicmanagement/assigntasktoreviewer
router.patch("/assigntasktoreviewer", TopicManagementController.assignTaskToReviewer);

// /api/topicmanagement/getsheetlogs

// /api/getsubjectnames -get

// /api/topicmanagement/getallboards -get

// /api/topicmanagement/getallsubboards -get

module.exports = router;
