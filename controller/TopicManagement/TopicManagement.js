const { createTopicTaskSchema, createTopicSchema } = require("../../validations/TopicManagementValidations");
const services = require("../../services/index");
const httpStatus = require("http-status");
const { createTopic } = require("../../services/TopicTaskServices");

const TopicManagementController = {

  async createTopicTask(req, res, next) {
    try {
      let values = await createTopicTaskSchema.validateAsync(req.body);

      let dataToBeCreated = {
        boardId: values.boardId,
        subBoardId: values.subBoardId,
        grade: values.grade,
        subjectId: values.subjectId,
        resources: values.resources,
        description: values.description,
        supervisorId: values.supervisorId,
      };

      await services.topicTaskService.checkTopicTask(dataToBeCreated);

      let topicTask = await services.topicTaskService.createTopicTask(dataToBeCreated);

      res.status(httpStatus.CREATED).send(topicTask);
    } catch (err) {
      next(err);
    }
  },



};

module.exports = TopicManagementController;
