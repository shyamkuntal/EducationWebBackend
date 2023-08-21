const httpStatus = require("http-status");
const services = require("../../services/index.js");
const CONSTANTS = require("../../constants/constants.js");
const {
  getBooksByBookTaskIdSchema,
  updateBookSchema,
  addChapterSchema,
  deleteChapterSchema,
  updateBookStatusSchema,
  updateInprogressTaskStatusSchema,
  updateCompleteTaskStatusSchema,
} = require("../../validations/BookManagementDGValidations.js");
const db = require("../../config/database.js");
const { Chapter } = require("../../models/Book/Book.js");
const { TaskBookChapterMapping } = require("../../models/Book/BookTaskMapping.js");
const { ApiError } = require("../../middlewares/apiError.js");

const BookManagementDGController = {
  async getBooksChapterByBookTaskId(req, res, next) {
    try {
      let values = await getBooksByBookTaskIdSchema.validateAsync({
        bookTaskId: req.query.bookTaskId,
      });

      let whereQuery = { where: { bookTaskId: values.bookTaskId } };

      let books = await services.bookTaskService.findBookByBookTask(whereQuery);

      res.status(httpStatus.OK).send(books);
    } catch (err) {
      next(err);
    }
  },
  async updateBookSubTitleAuthorPublisher(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateBookSchema.validateAsync(req.body);

      let dataToBeUpdated = {
        subTitle: values.subTitle,
        author: values.author,
        publisher: values.publisher,
      };

      let whereQuery = { where: { id: values.bookId } };

      await services.bookService.updateBook(dataToBeUpdated, whereQuery);

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Book Updated Sucessfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async addChapters(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await addChapterSchema.validateAsync(req.body);

      console.log(values);

      let dataToBeCreatedForChapter = {
        chapterNumber: values.chapterNumber,
        name: values.name,
      };

      let createChapter = await Chapter.create(dataToBeCreatedForChapter, { transaction: t });

      let chapterDetails = createChapter.dataValues;

      // create taskBookChapterMapping
      let dataToBeCreatedForChapterMapping = {
        bookTaskId: values.bookTaskId,
        bookId: values.bookId,
        chapterId: chapterDetails.id,
      };

      await TaskBookChapterMapping.create(dataToBeCreatedForChapterMapping, { transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Created Chapters and chapter mappings" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  async deleteChapter(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await deleteChapterSchema.validateAsync(req.body);

      console.log(values);

      // Delete task-book-chapter mapping.
      let whereQueryForChapterMapping = {
        where: {
          bookTaskId: values.bookTaskId,
          bookId: values.bookId,
          chapterId: values.chapterId,
        },
      };

      await TaskBookChapterMapping.destroy(whereQueryForChapterMapping, { transaction: t });

      let whereQueryForChapter = { where: { id: values.chapterId } };

      await Chapter.destroy(whereQueryForChapter, { transaction: t });

      await t.commit();

      res.status(httpStatus.OK).send({ message: "task-book-chapter mapping & chapter deleted!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  async setBookInProgressStatus(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateBookStatusSchema.validateAsync(req.body);

      let whereQuery = {
        where: { bookTaskId: values.bookTaskId, bookId: values.bookId },
        raw: true,
      };

      let book = await services.bookTaskService.findBookByBookTask(whereQuery);

      let bookDetails = book[0];

      if (!bookDetails) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Book Not Found for this Task!");
      }

      if (bookDetails.bookStatusForDataGenerator === CONSTANTS.sheetStatuses.InProgress) {
        throw new ApiError(httpStatus.OK, "Book Status is already InProgress ");
      }

      let dataToBeUpdated = {
        bookStatusForDataGenerator: CONSTANTS.sheetStatuses.InProgress,
      };

      let whereQueryForUpdateBookTask = {
        where: { bookTaskId: values.bookTaskId, bookId: values.bookId },
      };

      await services.bookTaskService.updateTaskBookMapping(
        dataToBeUpdated,
        whereQueryForUpdateBookTask,
        {
          transaction: t,
        }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Book InProgress Status Updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async setBookCompleteStatus(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateBookStatusSchema.validateAsync(req.body);

      let whereQuery = {
        where: { bookTaskId: values.bookTaskId, bookId: values.bookId },
        raw: true,
      };

      let book = await services.bookTaskService.findBookByBookTask(whereQuery);

      let bookDetails = book[0];

      if (!bookDetails) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Book Not Found for this Task!");
      }

      if (bookDetails.bookStatusForDataGenerator === CONSTANTS.sheetStatuses.Complete) {
        throw new ApiError(httpStatus.OK, "Book Status is already Complete ");
      }

      let dataToBeUpdated = {
        bookStatusForDataGenerator: CONSTANTS.sheetStatuses.Complete,
      };

      let whereQueryForUpdateBookTask = {
        where: { bookTaskId: values.bookTaskId, bookId: values.bookId },
      };

      await services.bookTaskService.updateTaskBookMapping(
        dataToBeUpdated,
        whereQueryForUpdateBookTask,
        {
          transaction: t,
        }
      );

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Book Complete Status Updated!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async updateInProgressBookTaskStatus(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await updateInprogressTaskStatusSchema.validateAsync(req.body);
      console.log(values);
      let whereQuery = { where: { id: values.bookTaskId }, raw: true };

      let bookTaskData = await services.bookTaskService.findBookTaskAndUser(whereQuery);

      let assignedTo = bookTaskData.assignedToUserId;
      let lifeCycle = bookTaskData.lifeCycle;
      let previousStatus = bookTaskData.bookStatusForDataGenerator;

      if (!bookTaskData) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
      }

      if (
        assignedTo !== values.dataGeneratorId ||
        lifeCycle !== CONSTANTS.roleNames.DataGenerator
      ) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Task not assigned to reviewr or lifecycle mismatch"
        );
      }

      if (previousStatus === CONSTANTS.sheetStatuses.InProgress) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current task status is already Inprogress");
      }

      let dataToBeUpdated = {
        statusForSupervisor: CONSTANTS.sheetStatuses.InProgress,
        statusForDataGenerator: CONSTANTS.sheetStatuses.InProgress,
      };

      let whereQueryForTaskUpdate = { where: { id: bookTaskData.id } };

      await services.bookTaskService.updateBookTask(dataToBeUpdated, whereQueryForTaskUpdate, {
        transaction: t,
      });

      await t.commit();
      res.status(httpStatus.OK).send({ message: "Task Status Updated successfully!" });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async updateCompleteBookTaskStatus(req, res, next) {
    try {
    } catch (err) {
      next(err);
    }
  },
};

module.exports = BookManagementDGController;
