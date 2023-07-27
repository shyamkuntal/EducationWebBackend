const services = require("../../services/index");
const httpStatus = require("http-status");
const {
  createTopicTaskSchema,
  updateTopicTaskSchema,
  assignTaskToDataGeneratorSchema,
  assignTaskToReviewerSchema,
  getTopicSubTopicVocabByTaskIdSchema,
  getAllTopicSubTopicVocabSchema,
  getTopicTaskLogsSchema,
} = require("../../validations/TopicManagementValidations");
const CONSTANTS = require("../../constants/constants");

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
  async updateTopicTask(req, res, next) {
    try {
      let values = await updateTopicTaskSchema.validateAsync(req.body);

      let dataToBeUpdated = {
        boardId: values.boardId,
        subBoardId: values.subBoardId,
        grade: values.grade,
        subjectId: values.subjectId,
        resources: values.resources,
        description: values.description,
        supervisorId: values.supervisorId,
      };

      let whereQuery = {
        where: { id: values.topicTaskId },
      };

      // await services.topicTaskService.checkTopicTask(dataToBeUpdated);

      let updatedTopicTask = await services.topicTaskService.updateTopicTask(
        dataToBeUpdated,
        whereQuery
      );

      if (updatedTopicTask.length > 0) {
        res.status(httpStatus.OK).send({ message: "Topic Task updated successfully!" });
      }
    } catch (err) {
      next(err);
    }
  },
  async assignTaskToDataGenerator(req, res, next) {
    try {
      let values = await assignTaskToDataGeneratorSchema.validateAsync(req.body);
      console.log(values);
      let userData = await services.userService.finduser(
        values.dataGeneratorId,
        CONSTANTS.roleNames.DataGenerator
      );

      let topicTaskData = await services.topicTaskService.findTopicTaskAndUser(values.topicTaskId);

      let responseMessage = {
        assinedUserToTask: "",
        UpdateTaskStatus: "",
        taskLog: "",
      };

      if (userData && topicTaskData) {
        // Checking if sheet is already assigned to Data Generator

        if (topicTaskData.assignedToUserId === userData.id) {
          res.status(httpStatus.OK).send({ mesage: "Task already assigned to Data Generator" });
        } else {
          //UPDATE task assignment & life cycle & task status

          let dataToBeUpdated = {
            assignedToUserId: userData.id,
            dataGeneratorId: userData.id,
            lifeCycle: CONSTANTS.roleNames.DataGenerator,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForDataGenerator: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToDataGenerator: values.supervisorComments,
          };

          let whereQuery = {
            where: { id: values.topicTaskId },
          };

          let updateTopicTask = await services.topicTaskService.updateTopicTask(
            dataToBeUpdated,
            whereQuery
          );

          if (updateTopicTask.length > 0) {
            responseMessage.assinedUserToTask =
              "Task assigned to Data Generator and lifeCycle updated successfully";
            responseMessage.UpdateTaskStatus = "Task Statuses updated successfully";
          }

          // CREATE task log for task assignment to dataGenerator

          let createLog = await services.topicTaskService.createTopicTaskLog(
            topicTaskData.id,
            topicTaskData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToDataGenerator
          );

          if (createLog) {
            responseMessage.taskLog =
              "Log record for task assignment to dataGenerator added successfully";
          }

          res.status(httpStatus.OK).send(responseMessage);
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Task Id" });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async assignTaskToReviewer(req, res, next) {
    try {
      let values = await assignTaskToReviewerSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(values.reviewerId);

      let topicTaskData = await services.topicTaskService.findTopicTaskAndUser(values.topicTaskId);

      let responseMessage = {
        assinedUserToTask: "",
        UpdateTaskStatus: "",
        taskLog: "",
      };

      if (userData && topicTaskData) {
        // Checking if sheet is already assigned to TopicTask reviewer
        if (topicTaskData.assignedToUserId === userData.id) {
          res.status(httpStatus.OK).send({ mesage: "Task already assigned to Data Generator" });
        } else {
          //UPDATE task assignment & life cycle & task status

          let dataToBeUpdated = {
            assignedToUserId: userData.id,
            reviewerId: userData.id,
            lifeCycle: CONSTANTS.roleNames.Reviewer,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForReviewer: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToReviewer: values.supervisorComments,
          };

          let whereQuery = {
            where: { id: values.topicTaskId },
          };

          let updateTopicTask = await services.topicTaskService.updateTopicTask(
            dataToBeUpdated,
            whereQuery
          );

          if (updateTopicTask.length > 0) {
            responseMessage.assinedUserToTask =
              "Task assigned to Reviewer and lifeCycle updated successfully";
            responseMessage.UpdateTaskStatus = "Task Statuses updated successfully";
          }

          // CREATE task log for task assignment to reviewer

          let createLog = await services.topicTaskService.createTopicTaskLog(
            topicTaskData.id,
            topicTaskData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToReviewer
          );

          if (createLog) {
            responseMessage.taskLog =
              "Log record for task assignment to reviewer added successfully";
          }

          res.status(httpStatus.OK).send(responseMessage);
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Task Id" });
      }
    } catch (err) {
      next(err);
    }
  },
  async getAllTopicSubTopicVocab(req, res, next) {
    try {
      let values = await getAllTopicSubTopicVocabSchema.validateAsync({
        boardId: req.query.boardId,
        subBoardId: req.query.subBoardId,
        grade: req.query.grade,
      });

      let filters = {
        where: {},
        attributes: [
          "id",
          "boardId",
          "subBoardId",
          "grade",
          "subjectId",
          "resources",
          "description",
          "lifeCycle",
          "supervisorId",
          "reviewerId",
          "dataGeneratorId",
          "assignedToUserId",
          "statusForSupervisor",
          "statusForDataGenerator",
          "statusForReviewer",
          "errorReport",
          "errorReportImg",
          "reviewerCommentToSupervisor",
          "supervisorCommentToReviewer",
          "supervisorCommentToDataGenerator",
          "isSpam",
          "isArchived",
          "isPublished",
        ],
        raw: true,
        nest: true,
      };

      if (values.boardId && values.boardId.length > 0) {
        filters.where.boardId = values.boardId;
      }
      if (values.subBoardId && values.subBoardId.length > 0) {
        filters.where.subBoardId = values.subBoardId;
      }
      if (values.grade && values.grade.length > 0) {
        filters.where.grade = values.grade;
      }

      // fetch topic tasks by filters

      let tasks = await services.topicTaskService.findTopicTasks(filters);

      let topics = [];
      // fetch topics by taskIds
      for (element of tasks) {
        let topicsByTaskId = await services.topicTaskService.findTopicTaskMappingsByTaskId(
          element.id
        );

        topicsByTaskId.map((ele) => {
          topics.push(ele);
        });
      }

      let topicSubTopicsVocab = [];

      for (element of topics) {
        // fetch subTopics
        let subTopics = await services.topicTaskService.findSubTopicMappingsByTopicId(
          element.topicId
        );
        // fetch vocab
        let vocab = await services.topicTaskService.findVocabMappingsByTopicId(element.topicId);

        topicSubTopicsVocab.push({
          topic: element.topic,
          subTopics: subTopics,
          vocab: vocab,
        });
      }

      res.status(httpStatus.OK).send(topicSubTopicsVocab);
    } catch (err) {
      next(err);
    }
  },
  async getTopicSubTopicVocabByTaskId(req, res, next) {
    try {
      let values = await getTopicSubTopicVocabByTaskIdSchema.validateAsync({
        topicTaskId: req.query.topicTaskId,
      });

      // fetchTopics
      let topicsMappings = await services.topicTaskService.findTopicTaskMappingsByTaskId(
        values.topicTaskId
      );

      let topicSubTopicsVocab = [];
      for (element of topicsMappings) {
        // fetch subTopics
        let subTopics = await services.topicTaskService.findSubTopicMappingsByTopicId(
          element.topicId
        );
        // fetch vocab
        let vocab = await services.topicTaskService.findVocabMappingsByTopicId(element.topicId);

        topicSubTopicsVocab.push({
          topic: element.topic,
          subTopics: subTopics,
          vocab: vocab,
        });
      }
      res.status(httpStatus.OK).send(topicSubTopicsVocab);
    } catch (err) {
      next(err);
    }
  },
  async getTopiTaskLogs(req, res, next) {
    try {
      let values = await getTopicTaskLogsSchema.validateAsync({
        topicTaskId: req.query.topicTaskId,
      });

      let logs = await services.topicTaskService.getTaskLogs(values.topicTaskId);

      res.status(httpStatus.OK).send(logs);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TopicManagementController;
