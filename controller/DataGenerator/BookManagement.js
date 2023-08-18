const httpStatus = require("http-status");
const services = require("../../services/index.js");
const CONSTANTS = require("../../constants/constants.js");
const {
  getBooksByBookTaskIdSchema,
  updateBookSchema,
  addChapterSchema,
} = require("../../validations/BookManagementDGValidations.js");
const db = require("../../config/database.js");
const { Chapter } = require("../../models/Book/Book.js");
const { TaskBookChapterMapping } = require("../../models/Book/BookTaskMapping.js");

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
      let values = await addChapterSchema.validateAsync(req.body.chapters);

      console.log(values);

      for (let i = 0; i < values.length; i++) {
        let dataToBeCreatedForChapter = {
          chapterNumber: values[i].chapterNumber,
          name: values[i].name,
        };

        let createChapter = await Chapter.create(dataToBeCreatedForChapter, { transaction: t });

        let chapterDetails = createChapter.dataValues;

        // create taskBookChapterMapping
        let dataToBeCreatedForChapterMapping = {
          bookTaskId: values[0].bookTaskId,
          bookId: values[0].bookId,
          chapterId: chapterDetails.id,
        };

        await TaskBookChapterMapping.create(dataToBeCreatedForChapterMapping, { transaction: t });
      }

      await t.commit();

      res.status(httpStatus.OK).send({ message: "Created Chapters and chapter mappings" });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
};

module.exports = BookManagementDGController;
