const express = require("express");
const TopicDGController = require("../../controller/DataGenerator/TopicManagement");
const TopicManagementController = require("../../controller/Supervisor/TopicManagement.js");
const paginatedTopicTasks = require("../../middlewares/paginatedTopicTasks");

const router = express.Router();

router.get("/getalltopictasks", paginatedTopicTasks(), (req, res) => {
  res.json(res.paginatedResults);
});
router.post("/createtopic", TopicDGController.createTopic);
router.post("/createsubtopic", TopicDGController.createSubTopic);
router.post("/createvocabulary", TopicDGController.createVocabulary);
router.patch("/submitopictasktosupervisor", TopicDGController.SubmitTopicTaskToSupervisor);
// /api/topicmanagement/getalltopicsubtopicvocab
router.get("/getalltopicsubtopicvocab", TopicManagementController.getAllTopicSubTopicVocab);
// /api/topicmanagement/gettopicsubtopicvocabbytopictaskid
router.get(
  "/gettopicsubtopicvocabbytopictaskid",
  TopicManagementController.getTopicSubTopicVocabByTaskId
);
// /api/topicmanagement/getsubtopicvocabbytopicid
router.get("/getsubtopicvocabbytopicid", TopicManagementController.getSubTopicVocabByTopicId);
// /api/topicmanagement/getsubtopicvocabbytopicid
router.get("/getsubtopicvocabbytaskid", TopicManagementController.getSubTopicVocabByTaskId);
router.patch("/marktopictaskasinprogress", TopicDGController.MarkTopicTaskasInProgress);
router.patch("/marktopictaskascomplete", TopicDGController.MarkTopicTaskascomplete);
router.post("/editsubtopics", TopicDGController.EditSubTopic);
router.post("/editvocabulary", TopicDGController.EditVocabulary);
router.post("/deletetopicandrelateddata", TopicDGController.DeleteTopicAndAllRelatedData);
module.exports = router;
