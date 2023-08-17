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
  getSubTopicVocabByTopicIdSchema,
  togglePublishTopicTaskSchema,
  findTopicTaskByIdSchema,
  getTaskErrorReportSchema,
  getTopicSubTopicVocabByTaskIdTopicIdSchema,
} = require("../../validations/TopicManagementValidations");
const CONSTANTS = require("../../constants/constants");
const { Board, SubBoard } = require("../../models/Board");
const { ApiError } = require("../../middlewares/apiError");
const db = require("../../config/database");

const TopicManagementController = {
  async createTopicTask(req, res, next) {
    const t = await db.transaction();
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

  async updateTopicTask(req, res, next) {
    const t = await db.transaction();
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
        whereQuery,
        { transaction: t }
      );
      await t.commit();
      res.status(httpStatus.OK).send({ message: "Topic Task updated successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async assignTaskToDataGenerator(req, res, next) {
    const t = await db.transaction();
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

      if (!userData && !topicTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Wrong user Id or Task Id!");
      }
      // Checking if sheet is already assigned to Data Generator

      if (topicTaskData.assignedToUserId !== userData.id) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Task already assigned to Data Generator!");
      }

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
        whereQuery,
        { transaction: t }
      );

      responseMessage.assinedUserToTask =
        "Task assigned to Data Generator and lifeCycle updated successfully";
      responseMessage.UpdateTaskStatus = "Task Statuses updated successfully";

      // CREATE task log for task assignment to dataGenerator
      let createLog = await services.topicTaskService.createTopicTaskLog(
        topicTaskData.id,
        topicTaskData.supervisor.Name,
        userData.Name,
        CONSTANTS.sheetLogsMessages.supervisorAssignToDataGenerator,
        { transaction: t }
      );

      responseMessage.taskLog =
        "Log record for task assignment to dataGenerator added successfully";

      await t.commit();
      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async assignTaskToReviewer(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await assignTaskToReviewerSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(values.reviewerId);

      let topicTaskData = await services.topicTaskService.findTopicTaskAndUser(values.topicTaskId);

      let responseMessage = {
        assinedUserToTask: "",
        UpdateTaskStatus: "",
        taskLog: "",
      };

      if (!userData && !topicTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Wrong user Id or Task Id!");
      }
      // Checking if sheet is already assigned to TopicTask reviewer
      if (topicTaskData.assignedToUserId === userData.id) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Task already assigned to Reviewer!");
      }

      //UPDATE task assignment & life cycle & task status

      let dataToBeUpdated = {
        assignedToUserId: userData.id,
        reviewerId: userData.id,
        lifeCycle: CONSTANTS.roleNames.Reviewer,
        statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
        statusForReviewer: CONSTANTS.sheetStatuses.NotStarted,
        supervisorCommentToReviewer: values.supervisorComments,
      };
      console.log(dataToBeUpdated);

      let whereQuery = {
        where: { id: values.topicTaskId },
      };

      let updateTopicTask = await services.topicTaskService.updateTopicTask(
        dataToBeUpdated,
        whereQuery,
        { transaction: t }
      );

      responseMessage.assinedUserToTask =
        "Task assigned to Reviewer and lifeCycle updated successfully";
      responseMessage.UpdateTaskStatus = "Task Statuses updated successfully";

      // CREATE task log for task assignment to reviewer

      let createLog = await services.topicTaskService.createTopicTaskLog(
        topicTaskData.id,
        topicTaskData.supervisor.Name,
        userData.Name,
        CONSTANTS.sheetLogsMessages.supervisorAssignToReviewer,
        { transaction: t }
      );

      responseMessage.taskLog = "Log record for task assignment to reviewer added successfully";
      await t.commit();
      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      await t.rollback();
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
        let subTopics = await services.topicTaskService.findSubTopicTaskMappingsByTaskId(
          element.topicTaskId,
          element.topicId
        );
        // fetch vocab
        let vocab = await services.topicTaskService.findVocabTaskMappingsByTaskId(
          element.topicTaskId,
          element.topicId
        );

        topicSubTopicsVocab.push({
          topic: element,
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
      if (topicsMappings.length > 0) {
        for (let i = 0; i < topicsMappings.length; i++) {
          // fetch subTopics
          let subTopics = await services.topicTaskService.findSubTopicTaskMappingsByTopicId(
            topicsMappings[i].topicId
          );
          // fetch vocab
          let vocab = await services.topicTaskService.findVocabTopicTaskMappingsByTopicId(
            topicsMappings[i].topicId
          );
          topicSubTopicsVocab.push({
            topicTaskId: values.topicTaskId,
            topic: topicsMappings[i].topic,
            topicWithAllAttributes: {
              id: topicsMappings[i].topic.id,
              name: topicsMappings[i].topic.name,
              isError: topicsMappings[i].isError,
              errorReport: topicsMappings[i].errorReport,
            },
            subTopics: subTopics,
            vocab: vocab,
          });
        }
      }

      res.status(httpStatus.OK).send(topicSubTopicsVocab);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getTopicSubTopicVocabByTaskIdTopicId(req, res, next) {
    try {
      let values = await getTopicSubTopicVocabByTaskIdTopicIdSchema.validateAsync({
        topicTaskId: req.query.topicTaskId,
        topicId: req.query.topicId,
      });

      // fetchTopics
      let topicsMappings =
        await services.topicTaskService.findTopicTaskMappingsByTopicTaskIdAndTopicId(
          values.topicTaskId,
          values.topicId
        );

      // fetch subTopics
      let subTopics = await services.topicTaskService.findSubTopicTaskMappingsByTaskId(
        values.topicTaskId,
        values.topicId
      );
      // fetch vocab
      let vocab = await services.topicTaskService.findVocabTaskMappingsByTaskId(
        values.topicTaskId,
        values.topicId
      );

      let result = {
        topic: topicsMappings[0],
        subTopics: subTopics,
        vocab: vocab,
      };

      res.status(httpStatus.OK).send(result);

      console.log(values);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getTopicSubTopicVocabByTaskIdTopicId(req, res, next) {
    try {
      let values = await getTopicSubTopicVocabByTaskIdTopicIdSchema.validateAsync({
        topicTaskId: req.query.topicTaskId,
        topicId: req.query.topicId,
      });

      // fetchTopics
      let topicsMappings =
        await services.topicTaskService.findTopicTaskMappingsByTopicTaskIdAndTopicId(
          values.topicTaskId,
          values.topicId
        );

      // fetch subTopics
      let subTopics = await services.topicTaskService.findSubTopicTaskMappingsByTaskId(
        values.topicTaskId,
        values.topicId
      );
      // fetch vocab
      let vocab = await services.topicTaskService.findVocabTaskMappingsByTaskId(
        values.topicTaskId,
        values.topicId
      );

      let result = {
        topic: topicsMappings[0],
        subTopics: subTopics,
        vocab: vocab,
      };

      res.status(httpStatus.OK).send(result);

      console.log(values);
    } catch (err) {
      next(err);
    }
  },

  async getSubTopicVocabByTopicId(req, res, next) {
    try {
      let values = await getSubTopicVocabByTopicIdSchema.validateAsync({
        topicId: req.query.topicId,
      });

      let topicSubTopicsVocab = [];
      // fetch subTopics
      let subTopics = await services.topicTaskService.findSubTopicTaskMappingsByTopicId(
        values.topicId
      );
      // fetch vocab
      let vocab = await services.topicTaskService.findVocabTaskMappingsByTopicId(values.topicId);

      topicSubTopicsVocab.push({
        topicId: values.topicId,
        subTopics: subTopics,
        vocab: vocab,
      });
      res.status(httpStatus.OK).send(topicSubTopicsVocab);
    } catch (err) {
      next(err);
    }
  },

  async getSubTopicVocabByTaskId(req, res, next) {
    try {
      let values = req.query;
      let topicSubTopicsVocab = [];
      // fetch subTopics
      let subTopics = await services.topicTaskService.findSubTopicTaskMappingsByTaskId(
        values.topicTaskId,
        values.topicId
      );
      // fetch vocab
      let vocab = await services.topicTaskService.findVocabTaskMappingsByTaskId(
        values.topicTaskId,
        values.topicId
      );

      topicSubTopicsVocab.push({
        topicId: values.topicId,
        subTopics: subTopics,
        vocab: vocab,
      });
      res.status(httpStatus.OK).send(topicSubTopicsVocab);
    } catch (err) {
      next(err);
    }
  },

  async getTopicTaskLogs(req, res, next) {
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

  async togglePublishTopicTask(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await togglePublishTopicTaskSchema.validateAsync(req.body);

      let responseMessage = {};

      let whereQueryForTaskFind = { where: { id: values.topicTaskId }, raw: true };

      let task = await services.topicTaskService.findTopicTasks(whereQueryForTaskFind);

      if (!task) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      let taskData = task[0];

      let dataToBeUpdated = {
        isPublished: !taskData.isPublished,
        isSpam: false,
      };

      let whereQuery = {
        where: { id: values.topicTaskId },
      };

      let updateTask = await services.topicTaskService.updateTopicTask(
        dataToBeUpdated,
        whereQuery,
        { transaction: t }
      );

      await t.commit();
      responseMessage.message = `Task IsPublished set to ${dataToBeUpdated.isPublished}`;

      res.status(httpStatus.OK).send(responseMessage);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async getTopicTaskById(req, res, next) {
    try {
      let values = await findTopicTaskByIdSchema.validateAsync({
        topicTaskId: req.query.topicTaskId,
      });
      let whereQuery = {
        where: { id: values.topicTaskId },
        include: [
          { model: Board, attributes: ["id", "boardName"] },
          { model: SubBoard, attributes: ["id", "subBoardName"] },
        ],
      };
      let task = await services.topicTaskService.findTopicTasks(whereQuery);

      res.status(httpStatus.OK).send(task);
    } catch (err) {
      next(err);
    }
  },

  async getErrorReportFile(req, res, next) {
    try {
      let values = await getTaskErrorReportSchema.validateAsync({
        topicTaskId: req.query.topicTaskId,
      });
      let whereQuery = {
        where: { id: values.topicTaskId },
        raw: true,
      };

      let task = await services.topicTaskService.findTopicTasks(whereQuery);

      if (!task) {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Task not found!" });
      }

      let fileUrl = await services.pastpaperService.getFilesUrlFromS3(task[0].errorReportImg);

      res.status(200).send({
        errorReportFile: task[0].errorReportImg,
        errorReportFileUrl: fileUrl,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = TopicManagementController;
