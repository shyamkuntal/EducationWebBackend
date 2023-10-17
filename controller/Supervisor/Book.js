const { ApiError } = require("../../middlewares/apiError");
const { Book, Chapter } = require("../../models/Book");
const { BookTask, BookTaskLog } = require("../../models/BookTask");
const { TaskBookMapping, TaskBookChapterMapping } = require("../../models/BookTaskMapping");
const services = require("../../services/index");
const httpStatus = require("http-status");
const db = require("../../config/database");
const {
  createBookTaskSchema,
  updateBookTaskSchema,
  assignTaskToDataGeneratorSchema,
  assignTaskToReviewerSchema,
} = require("../../validations/BookManagementValidations");
const CONSTANTS = require("../../constants/constants");
const { SubBoard, Board } = require("../../models/Board");
const { Subject } = require("../../models/Subject");

const BookManagementController = {
  
  async createBookTask(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await createBookTaskSchema.validateAsync(req.body);

      let taskDataToBeCreated = {
        boardId: values.boardId,
        subBoardId: values.subBoardId,
        grade: values.grade,
        subjectId: values.subjectId,
        resources: values.resources,
        description: values.description,
        supervisorId: values.supervisorId,
      };

      let checkTask = await BookTask.findOne({
        where: {
          boardId: values.boardId,
          subBoardId: values.subBoardId,
          grade: values.grade,
          subjectId: values.subjectId,
        },
        raw: true,
        transaction: t,
      });

      if (checkTask) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Book Task already exists with given parameters!"
        );
      }

      let bookTask = await BookTask.create(taskDataToBeCreated, { transaction: t });

      let bookPromises = values.bookNames.map(async (bookName) => {
        let bookDataToBeCreated = {
          name: bookName,
        };
        return await Book.create(bookDataToBeCreated, { transaction: t });
      });

      let createdBooks = await Promise.all(bookPromises);

      // Create mappings between each created book and the book task
      let mappingPromises = createdBooks.map(async (book) => {
        let mappingDataToBeCreated = {
          bookId: book.id,
          bookTaskId: bookTask.id,
        };
        return await TaskBookMapping.create(mappingDataToBeCreated, { transaction: t });
      });

      let createdTaskBookMapping = await Promise.all(mappingPromises);

      await t.commit();
      res
        .status(httpStatus.CREATED)
        .send({ Task: bookTask, Books: createdBooks, TaskBookMappings: createdTaskBookMapping });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async updateBookTask(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateBookTaskSchema.validateAsync(req.body);

      let taskDataToUpdate = {
        boardId: values.boardId,
        subBoardId: values.subBoardId,
        grade: values.grade,
        subjectId: values.subjectId,
        resources: values.resources,
        description: values.description,
      };

      let bookTaskId = values.bookTaskId;

      let updatedBookTask = await BookTask.update(taskDataToUpdate, {
        where: { id: bookTaskId },
        returning: true,
        transaction: t,
      });

      let updatedBookTaskInstance = updatedBookTask[1][0];

      if (values.bookNames && Array.isArray(values.bookNames)) {
        for (const bookInfo of values.bookNames) {
          let bookId = bookInfo.id;
          let newName = bookInfo.name;

          await Book.update(
            { name: newName },
            {
              where: { id: bookId },
              transaction: t,
            }
          );
        }
      }

      await t.commit();
      res.status(httpStatus.OK).send({
        message: "Book Task and associated data updated successfully",
        Task: updatedBookTaskInstance,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async assignTaskToDataGenerator(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await assignTaskToDataGeneratorSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.dataGeneratorId,
        CONSTANTS.roleNames.DataGenerator
      );

      let bookTaskData = await services.bookTaskService.findBookTaskAndUser(values.bookTaskId);

      let responseMessage = {
        assinedUserToTask: "",
        UpdateTaskStatus: "",
        UpdateTaskBookMapping: "",
        taskLog: "",
      };

      if (userData && bookTaskData) {
        // Checking if sheet is already assigned to Data Generator

        if (bookTaskData.assignedToUserId === userData.id) {
          res.status(httpStatus.OK).send({ message: "Task already assigned to Data Generator" });
        } else {
          // UPDATE task assignment & life cycle & task status

          let dataToBeUpdatedInTaskTable = {
            assignedToUserId: userData.id,
            dataGeneratorId: userData.id,
            lifeCycle: CONSTANTS.roleNames.DataGenerator,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForDataGenerator: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToDataGenerator: values.supervisorComments,
          };

          let updatedBookTask = await BookTask.update(dataToBeUpdatedInTaskTable, {
            where: { id: values.bookTaskId },
            returning: true,
            transaction: t,
          });

          if (updatedBookTask.length > 0) {
            responseMessage.assinedUserToTask =
              "Task assigned to Data Generator and lifeCycle updated successfully";
            responseMessage.UpdateTaskStatus = "Task Statuses updated successfully";
          }
          // Update taskBookMappings

          let dataToBeUpdatedForTaskBookMapping = {
            bookStatusForDataGenerator: CONSTANTS.sheetStatuses.NotStarted,
          };
          let whereQuery = {
            where: { bookTaskId: values.bookTaskId },
          };

          await services.bookTaskService.updateTaskBookMapping(
            dataToBeUpdatedForTaskBookMapping,
            whereQuery
          );

          responseMessage.UpdateTaskBookMapping = "Task Book Mapping updated successfully";

          // CREATE task log for task assignment to dataGenerator
          let createLog = await services.bookTaskService.createBookTaskLog(
            bookTaskData.id,
            bookTaskData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToDataGenerator,
            { transaction: t }
          );

          if (createLog) {
            responseMessage.taskLog =
              "Log record for task assignment to dataGenerator added successfully";
          }

          await t.commit();
          res.status(httpStatus.OK).send(responseMessage);
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Task Id" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async assignTaskToReviewer(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await assignTaskToReviewerSchema.validateAsync(req.body);

      let userData = await services.userService.finduser(
        values.reviewerId,
        CONSTANTS.roleNames.Reviewer
      );

      let bookTaskData = await services.bookTaskService.findBookTaskAndUser(values.bookTaskId);

      let responseMessage = {
        assinedUserToTask: "",
        UpdateTaskStatus: "",
        taskLog: "",
      };

      if (userData && bookTaskData) {
        // Checking if sheet is already assigned to Data Generator

        if (bookTaskData.assignedToUserId === userData.id) {
          res.status(httpStatus.OK).send({ message: "Task already assigned to Data Generator" });
        } else {
          // UPDATE task assignment & life cycle & task status

          let dataToBeUpdated = {
            assignedToUserId: userData.id,
            reviewerId: userData.id,
            lifeCycle: CONSTANTS.roleNames.Reviewer,
            statusForSupervisor: CONSTANTS.sheetStatuses.NotStarted,
            statusForReviewer: CONSTANTS.sheetStatuses.NotStarted,
            supervisorCommentToReviewer: values.supervisorComments,
          };

          let updatedBookTask = await BookTask.update(dataToBeUpdated, {
            where: { id: values.bookTaskId },
            returning: true,
            transaction: t,
          });

          if (updatedBookTask.length > 0) {
            responseMessage.assinedUserToTask =
              "Task assigned to Reviewer and lifeCycle updated successfully";
            responseMessage.UpdateTaskStatus = "Task Statuses updated successfully";
          }

          let dataToBeUpdatedForTaskBookMapping = {
            bookStatusForReviewer: CONSTANTS.sheetStatuses.NotStarted,
          };
          let whereQuery = {
            where: { bookTaskId: values.bookTaskId },
          };

          await services.bookTaskService.updateTaskBookMapping(
            dataToBeUpdatedForTaskBookMapping,
            whereQuery
          );

          responseMessage.UpdateTaskBookMapping = "Task Book Mapping updated successfully";

          // CREATE task log for task assignment to dataGenerator
          let createLog = await services.bookTaskService.createBookTaskLog(
            bookTaskData.id,
            bookTaskData.supervisor.Name,
            userData.Name,
            CONSTANTS.sheetLogsMessages.supervisorAssignToReviewer,
            { transaction: t }
          );

          if (createLog) {
            responseMessage.taskLog =
              "Log record for task assignment to reviewer added successfully";
          }

          await t.commit();
          res.status(httpStatus.OK).send(responseMessage);
        }
      } else {
        res.status(httpStatus.BAD_REQUEST).send({ message: "Wrong user Id or Task Id" });
      }
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async getAllBookTask(req, res, next) {
    try {
      const allBookTasks = await BookTask.findAll();

      res.status(httpStatus.OK).send(allBookTasks);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getAllBookChapterByTaskId(req, res, next) {
    try {
      let values = req.query.bookTaskId;

      const bookMapping = await TaskBookMapping.findAll({
        where: { bookTaskId: values },
        include: [{ model: Book, attributes: ["id", "name", "subTitle", "author", "publisher"] }],
      });

      let BookChapter = [];
      if (bookMapping.length > 0) {
        for (let i = 0; i < bookMapping.length; i++) {
          // fetch Chapters
          const chapter = await TaskBookChapterMapping.findAll({
            where: { bookTaskId: values, bookId: bookMapping[i].bookId },
            attributes: [
              "bookTaskId",
              "bookId",
              "chapterId",
              "errorReport",
              "isError",
              "isArchived",
            ],
            include: [{ model: Chapter, attributes: ["id", "name", "chapterNumber"] }],
          });

          BookChapter.push({
            bookTaskId: values,
            bookStatusForDataGenerator: bookMapping[i].bookStatusForDataGenerator,
            bookStatusForReviewer: bookMapping[i].bookStatusForReviewer,
            isError: bookMapping[i].isError,
            errorReport: bookMapping[i].errorReport,
            book: bookMapping[i].book,
            chapter: chapter,
          });
        }
      }
      res.status(httpStatus.OK).send(BookChapter);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getAllChapterByBookId(req, res, next) {
    try {
      let values = req.query.bookId;

      const bookMapping = await TaskBookChapterMapping.findAll({
        where: { bookId: values },
        include: [{ model: Chapter, attributes: ["id", "chapterNumber" ,"name"] }],
      });

      res.status(httpStatus.OK).send(bookMapping);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async togglePublishBookTask(req, res, next) {
    try {
      let taskId = req.query.bookTaskId;

      let responseMessage = {};

      let whereQueryForTaskFind = { where: { id: taskId }, raw: true };

      let task = await services.bookTaskService.findBookTasks(whereQueryForTaskFind);

      if (!task) {
        return res.status(httpStatus.BAD_REQUEST).send({ message: "Task not found" });
      }

      let taskData = task[0];

      let dataToBeUpdated = {
        isPublished: !taskData.isPublished,
        isSpam: false,
      };

      let whereQuery = {
        where: { id: taskId },
      };

      let updateTask = await services.bookTaskService.updateBookTask(dataToBeUpdated, whereQuery);

      if (updateTask.length > 0) {
        responseMessage.message = `Task IsPublished set to ${dataToBeUpdated.isPublished}`;
      }

      res.status(httpStatus.OK).send({ responseMessage });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async getBookTaskLogs(req, res, next) {
    let bookTaskId = req.query.bookTaskId;
    try {
      let logs = await BookTaskLog.findAll({
        where: { bookTaskId },
        order: [["createdAt", "ASC"]],
      });

      res.status(httpStatus.OK).send(logs);
    } catch (err) {
      next(err);
    }
  },

  async getAllBookfromBookTable(req, res, next) {
    const boardId = req.query.boardId;
    const subBoardId = req.query.subBoardId;
    const grade = req.query.grade;

    try {
      const bookMappings = await TaskBookMapping.findAll({
        include: [
          {
            model: Book,
            attributes: ["id", "name", "subTitle", "author", "publisher", "createdAt"],
          },
          {
            model: BookTask,
            include: [
              {
                model: SubBoard,
                attributes: ["subBoardName"],
              },

              {
                model: Board,
                attributes: ["boardName"],
              },
              {
                model: Subject,
                where: req.query.subjectNameId ? { subjectNameId: req.query.subjectNameId } : {},
                attributes: ["id", "boardId", "subBoardId", "grade", "subjectNameId"],
              },
            ],
          },
        ],
        raw: true,
        nest: true,
      });

      let BookChapter = [];
      if (bookMappings.length > 0) {
        for (let i = 0; i < bookMappings.length; i++) {
          const bookDetails = bookMappings[i];

          // Fetch Chapters for each book
          const chapterMapping = await TaskBookChapterMapping.findAll({
            where: { bookId: bookDetails.bookId },
            include: [{ model: Chapter, attributes: ["id", "name", "chapterNumber"] }],
          });
          const chaptersWithNames = chapterMapping.map((item) => item.chapter);
          BookChapter.push({
            book: bookDetails,
            chapters: chaptersWithNames,
          });
        }
      }
      res.status(httpStatus.OK).send(BookChapter);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  
  async getCountsCardData(req, res, next) {
    try {
      const { assignedToUserId } = req.query;

      const activeSheets = await BookTask.findAll({
        where: {
          assignedToUserId: assignedToUserId,
        },
      });

      let countsBySubject = {}; 
      activeSheets.forEach((sheet) => {
        const subjectId = sheet.subjectId;

        if (!countsBySubject[subjectId]) {
          countsBySubject[subjectId] = {
            subjectId: subjectId,
            InProgress: 0,
            NotStarted: 0,
            Complete: 0,
          };
        }

        if (sheet.lifeCycle === "DataGenerator") {
          switch (sheet.statusForDataGenerator) {
            case "InProgress":
              countsBySubject[subjectId].InProgress++;
              break;
            case "NotStarted":
              countsBySubject[subjectId].NotStarted++;
              break;
            case "Complete":
              countsBySubject[subjectId].Complete++;
              break;
          }
        } else if (sheet.lifeCycle === "Reviewer") {
          switch (sheet.statusForReviewer) {
            case "InProgress":
              countsBySubject[subjectId].InProgress++;
              break;
            case "NotStarted":
              countsBySubject[subjectId].NotStarted++;
              break;
            case "Complete":
              countsBySubject[subjectId].Complete++;
              break;
          }
        }
      });

      // Convert the countsBySubject object into an array of objects
      const countsArray = Object.values(countsBySubject);

      res.send(countsArray);
    } catch (err) {
      return res.json({ status: 501, error: err.message });
    }
  },

  async ArchiveAllBookDataByTask(req, res) {
    const id = req.query.bookTaskId;
    const t = await db.transaction(); 
  
    try {
      const task = await BookTask.findByPk(id);
  
      if (!task) {
        await t.rollback(); 
        return res.status(404).json({ message: "Task not found" });
      }
  
      let topicMappings = await TaskBookMapping.findAll({
        where: { bookTaskId: id },
      });
      let subTopicMappings = await TaskBookChapterMapping.findAll({
        where: { bookTaskId: id },
      });
  
      for (const mapping of [...topicMappings, ...subTopicMappings]) {
        mapping.isArchived = true;
        await mapping.save({ transaction: t });
      }

      task.isArchived = true;
      task.isSpam = false;
      await task.save({ transaction: t });
  
      await t.commit();
  
      res.status(httpStatus.OK).send({ message: "Task and related mappings archived successfully" });
    } catch (err) {
      await t.rollback(); 
      return res.json({ status: 501, error: err.message });
    }
  },

  async ArchiveBookAndData(req, res, next) {
    const { bookTaskId, bookId } = req.query;
    const t = await db.transaction();
    try {
      const task = await BookTask.findByPk(bookTaskId);
  
      if (!task) {
        await t.rollback();
        return res.status(404).json({ message: "Task not found" });
      }

      let whereQuery = {
        where: { bookTaskId: bookTaskId, bookId: bookId },
        raw: true,
      };
      let book = await TaskBookMapping.findAll(whereQuery);

      let subTopicMappings = await TaskBookChapterMapping.findAll({
        where: { bookTaskId, bookId}
      });
  
      for (const mapping of [...subTopicMappings]) {
        mapping.isArchived = true;
        mapping.isSpam = false;
        await mapping.save({ transaction: t });
      }
      
      let dataToBeUpdated = {
        isArchived: true,
        isSpam: false
      };

      await services.bookTaskService.updateTaskBookMapping(
        dataToBeUpdated,
        whereQuery,
        {
          transaction: t,
        }
      );

      await t.commit(); 
      res.status(httpStatus.OK).send({ message: "Book and related mappings archived successfully" });
    } catch (err) {
      console.log(err)
      await t.rollback();
      next(err)
    }
  },

  async ArchiveChapter(req, res) {
    const chapterId = req.query.chapterId;
    try {
      const subTopicMapping = await TaskBookChapterMapping.findAll({
        where: { chapterId },
      });
  
      if (!subTopicMapping) {
        return res.status(404).json({ message: "Chapter mapping not found" });
      }
  
      let whereQuery = {
        where: { chapterId },
        raw: true,
      };

      let dataToBeUpdated = {
        isArchived: true,
        isSpam: false
      };

      await services.bookTaskService.updateTaskChapterMapping(
        dataToBeUpdated,
        whereQuery
      );
  
      res.status(httpStatus.OK).send({ message: "Chapter mapping archived successfully" });
    } catch (err) {
      console.log(err)
      return res.json({ status: 501, error: err.message });
    }
  },
};

module.exports = BookManagementController;
