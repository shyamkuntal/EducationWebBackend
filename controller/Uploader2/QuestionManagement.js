const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");

const QuestionManagementController = {

    async createLongAnswer(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await createTopicTaskSchema.validateAsync(req.body);
            let dataToBeCreated = {
                longAnswer: values.data
            };
            await services.topicTaskService.checkTopicTask(dataToBeCreated);
            let topicTask = await services.topicTaskService.createTopicTask(dataToBeCreated, {
                transaction: t,
            });
            await t.commit();
            res.status(httpStatus.CREATED).send(topicTask);
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },

    async createFillText(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await createTopicTaskSchema.validateAsync(req.body);
            let dataToBeCreated = {
                boardId: values.data
            };
            await services.topicTaskService.checkTopicTask(dataToBeCreated);
            let topicTask = await services.topicTaskService.createTopicTask(dataToBeCreated, {
                transaction: t,
            });
            await t.commit();
            res.status(httpStatus.CREATED).send(topicTask);
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },

    async createConnect(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await createTopicTaskSchema.validateAsync(req.body);
            let dataToBeCreated = {
                boardId: values.data
            };
            await services.topicTaskService.checkTopicTask(dataToBeCreated);
            let topicTask = await services.topicTaskService.createTopicTask(dataToBeCreated, {
                transaction: t,
            });
            await t.commit();
            res.status(httpStatus.CREATED).send(topicTask);
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },

    async createQuestion(req, res, next) {
        try {
          let question = await services.questionService.createQuestion(req.body);
          res.status(httpStatus.OK).send(question);
        } catch (err) {
          next(err);
        }
      },
      
};

module.exports = QuestionManagementController;
