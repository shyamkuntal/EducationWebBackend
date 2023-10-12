const { Subject, SubjectLevel, subjectName } = require("../../models/Subject.js");
const { Board, SubBoard } = require("../../models/Board.js");
const httpStatus = require("http-status");
const services = require("../../services/index.js");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../../config/s3.js");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PaperNumberSheet, PaperNumber } = require("../../models/PaperNumberSheet.js");
const {
  TaskTopicMapping,
  TaskSubTopicMapping,
  TaskVocabularyMapping,
} = require("../../models/TopicTaskMapping.js");
const { SheetManagement } = require("../../models/SheetManagement.js");
const { Book } = require("../../models/Book.js");
const { Sheet } = require("../../models/PastPaperSheet.js");
const { TopicTask } = require("../../models/TopicTask.js");
const { Topic, SubTopic } = require("../../models/Topic.js");
const { Vocabulary } = require("../../models/Vocabulary.js");
const { BookTask } = require("../../models/BookTask.js");
const { TaskBookMapping, TaskBookChapterMapping } = require("../../models/BookTaskMapping.js");
const sequelize = require("sequelize");
const { User } = require("../../models/User.js");
const { Variant } = require("../../models/Variants.js");
const { ApiError } = require("../../middlewares/apiError.js");
require("dotenv").config();

const ArchiveManagmentController = {
  async getAllArchivedCount(req, res, next) {
    try {
      var subjects = await Subject.count({ where: { isArchived: true } });
      var levels = await SubjectLevel.count({ where: { isArchived: true } });
      var topics = await TaskTopicMapping.count({ where: { isArchived: true } });
      var subtopics = await TaskSubTopicMapping.count({ where: { isArchived: true } });
      var vocabs = await TaskVocabularyMapping.count({ where: { isArchived: true } });
      var pastpapers = await Sheet.count({ where: { isArchived: true } });
      var papernos = await PaperNumber.count({ where: { isArchive: true } });
      var sheets = await SheetManagement.count({ where: { isArchived: true } });
      var books = await Book.count({ where: { isArchived: true } });
      var tasks = await TopicTask.count({ where: { isArchived: true } });
      tasks += await BookTask.count({ where: { isArchived: true } });

      res
        .status(httpStatus.OK)
        .send({
          topups: "Upcoming",
          promocodes: "Upcoming",
          others: "Upcoming",
          subjects,
          levels,
          topics,
          subtopics,
          vocabs,
          pastpapers,
          papernos,
          sheets,
          books,
          tasks,
        });
    } catch (err) {
      next(err);
    }
  },
  async getAllArchivedSubjects(req, res, next) {
    try {
      const subjects = await Subject.findAll({
        attributes: ["id", "grade", "isArchived", "isPublished"],
        include: [
          {
            model: SubBoard,
            attributes: ["id", "subBoardName"],
          },
          {
            model: Board,
            attributes: ["id", "boardName"],
          },
          {
            model: SubjectLevel,
            attributes: ["id", "subjectLevelName", "subjectId", "isArchived"],
            required: false,
          },
          {
            model: subjectName,
            where: req.query.subjectName ? { id: req.query.subjectName } : {},
            attributes: ["id", "subjectName"],
          },
        ],
        where: { isArchived: true },
      });

      res.status(httpStatus.OK).send(subjects);
    } catch (err) {
      next(err);
    }
  },
  async getAllArchivedLevels(req, res, next) {
    try {
      const subjects = await SubjectLevel.findAll({
        include: [
          {
            model: Subject,
            attributes: ["id", "grade"],
            include: [
              {
                model: SubBoard,
                attributes: ["id", "subBoardName"],
              },
              {
                model: Board,
                attributes: ["id", "boardName"],
              },
              {
                model: subjectName,
                where: req.query.subjectName ? { id: req.query.subjectName } : {},
                attributes: ["id", "subjectName"],
              },
            ],
          },
        ],
        where: { isArchived: true },
      });

      res.status(httpStatus.OK).send(subjects);
    } catch (err) {
      next(err);
    }
  },
  async unArchiveSubject(req, res, next) {
    try {
      let subject = await Subject.update({ isArchived: false }, { where: { id: req.body.id } });
      let levels = await SubjectLevel.update(
        { isArchived: false },
        {
          where: {
            id: req.body.levels,
          },
        }
      );
      res.status(httpStatus.OK).send({ message: "UnArchived Succesfully", subject, levels });
    } catch (err) {
      next(err);
    }
  },
  async unArchiveSubjectLevel(req, res, next) {
    try {
      let subjectlevel = await SubjectLevel.update(
        { isArchived: false },
        { where: { id: req.body.id } }
      );
      res.status(httpStatus.OK).send({ message: "UnArchived Succesfully", subjectlevel });
    } catch (err) {
      next(err);
    }
  },
  async getAllArchivedTopics(req, res, next) {
    try {
      var topics = await TaskTopicMapping.findAll({
        include: [
          {
            model: TopicTask,
            attributes: ["id", "grade"],
            include: [
              { model: Board, attributes: ["id", "boardName"] },
              {
                model: Subject,
                attributes: ["id"],
                include: [{ model: subjectName, attributes: ["subjectName"] }],
              },
              { model: SubBoard, attributes: ["id", "subBoardName"] },
            ],
          },
          {
            model: Topic,
            attributes: ["id", "name"],
          },
        ],
        where: { isArchived: true },
      });

      let response = [];

      for (let i = 0; i < topics.length; i++) {
        var subtopics = await TaskSubTopicMapping.findAll({
          where: { topicTaskId: topics[i].topicTaskId, topicId: topics[i].topicId },
          include: [{ model: SubTopic }],
          attributes: ["isArchived"],
        });

        var vocabs = await TaskVocabularyMapping.findAll({
          where: { topicTaskId: topics[i].topicTaskId, topicId: topics[i].topicId },
          include: [{ model: Vocabulary }],
          attributes: ["isArchived"],
        });

        response.push({ topic: topics[i], subtopics, vocabs });
      }

      res.status(httpStatus.OK).send(response);
    } catch (err) {
      next(err);
    }
  },
  async unArchiveTopic(req, res, next) {
    try {
      var topics = await TaskTopicMapping.update(
        { isArchived: false },
        { where: { id: req.body.id } }
      );
      var subtopics = await TaskSubTopicMapping.update(
        { isArchived: false },
        { where: { subTopicId: req.body.subTopics, topicId: req.body.id } }
      );
      var vocabs = await TaskVocabularyMapping.update(
        { isArchived: false },
        { where: { vocabularyId: req.body.vocabs, topicId: req.body.id } }
      );

      res
        .status(httpStatus.OK)
        .send({ message: "UnArchived Succesfully", topics, subtopics, vocabs });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getAllArchivedSubTopics(req, res, next) {
    try {
      var subtopics = await TaskSubTopicMapping.findAll({
        include: [
          {
            model: TopicTask,
            attributes: ["id", "grade"],
            include: [
              { model: Board, attributes: ["id", "boardName"] },
              {
                model: Subject,
                attributes: ["id"],
                include: [{ model: subjectName, attributes: ["subjectName"] }],
              },
              { model: SubBoard, attributes: ["id", "subBoardName"] },
            ],
          },
          {
            model: SubTopic,
            attributes: ["id", "name"],
          },
        ],
        where: { isArchived: true },
      });

      let response = [];

      for (let i = 0; i < subtopics.length; i++) {
        var topicData = await Topic.findAll({ where: { id: subtopics[i].topicId } });
        var isTopicArchived = await TaskTopicMapping.findAll({
          where: { topicId: subtopics[i].topicId, topicTaskId: subtopics[i].topicTaskId },
          attributes: ["isArchived"],
        });
        response.push({
          topic: topicData[0],
          subtopic: subtopics[i],
          isTopicArchived: isTopicArchived[0].isArchived,
        });
      }

      res.status(httpStatus.OK).send(response);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async unArchiveSubTopic(req, res, next) {
    try {
      var subtopics = await TaskSubTopicMapping.update({ isArchived: false }, { where: req.body });
      res.status(httpStatus.OK).send({ message: "UnArchived Succesfully", subtopics });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getAllArchivedVocabs(req, res, next) {
    try {
      var vocabs = await TaskVocabularyMapping.findAll({
        include: [
          {
            model: TopicTask,
            attributes: ["id", "grade"],
            include: [
              { model: Board, attributes: ["id", "boardName"] },
              {
                model: Subject,
                attributes: ["id"],
                include: [{ model: subjectName, attributes: ["subjectName"] }],
              },
              { model: SubBoard, attributes: ["id", "subBoardName"] },
            ],
          },
          {
            model: Vocabulary,
            attributes: ["id", "name"],
          },
        ],
        where: { isArchived: true },
      });

      let response = [];

      for (let i = 0; i < vocabs.length; i++) {
        var topicData = await Topic.findAll({ where: { id: vocabs[i].topicId } });
        var isTopicArchived = await TaskTopicMapping.findAll({
          where: { topicId: vocabs[i].topicId, topicTaskId: vocabs[i].topicTaskId },
          attributes: ["isArchived"],
        });
        response.push({
          topic: topicData[0],
          vocab: vocabs[i],
          isTopicArchived: isTopicArchived[0].isArchived,
        });
      }

      res.status(httpStatus.OK).send(response);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async unArchiveVocab(req, res, next) {
    try {
      var vocabs = await TaskVocabularyMapping.update({ isArchived: false }, { where: req.body });
      res.status(httpStatus.OK).send({ message: "UnArchived Succesfully", vocabs });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getAllPaperNos(req, res, next) {
    try {
      var pnos = await PaperNumber.findAll({
        include: [
          {
            model: PaperNumberSheet,
            include: [
              { model: Board, attributes: ["id", "boardName"] },
              {
                model: Subject,
                attributes: ["id"],
                include: [{ model: subjectName, attributes: ["subjectName"] }],
              },
              { model: SubBoard, attributes: ["id", "subBoardName"] },
            ],
          },
        ],
        where: { isArchive: true },
      });

      var response = [];

      for (var i = 0; i < pnos.length; i++) {
        response.push({
          id: pnos[i].id,
          paperNumberSheetId: pnos[i].paperNumberSheetId,
          paperName: pnos[i].paperNumber,
          subjectId: pnos[i].paperNumberSheet.subjectId,
          createdAt: pnos[i].createdAt,
          updatedAt: pnos[i].updateAt,
          subject: {
            id: pnos[i].paperNumberSheet.subject.id,
            grade: pnos[i].paperNumberSheet.grade,
            subBoard: pnos[i].paperNumberSheet.subBoard,
            board: pnos[i].paperNumberSheet.board,
            subjectName: {
              id: pnos[i].paperNumberSheet.subject.id,
              subjectName: pnos[i].paperNumberSheet.subject.subjectName.subjectName,
            },
          },
        });
      }

      res.status(httpStatus.OK).send(response);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async unArchivePaperNo(req, res, next) {
    try {
      var subtopics = await PaperNumber.update({ isArchive: false }, { where: req.body });
      res.status(httpStatus.OK).send({ message: "UnArchived Succesfully", subtopics });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getAllBooks(req, res, next) {
    try {
      var books = await Book.findAll({
        where: { isArchived: true },
        attributes: ["id", "name", "subTitle", "author", "publisher"],
      });

      var response = [];

      for (var i = 0; i < books.length; i++) {
        var bookTask = await TaskBookMapping.findAll({
          where: { bookId: books[i].id },
          include: [
            {
              model: BookTask,
              include: [
                { model: Board, attributes: ["id", "boardName"] },
                {
                  model: Subject,
                  attributes: ["id"],
                  include: [{ model: subjectName, attributes: ["subjectName"] }],
                },
                { model: SubBoard, attributes: ["id", "subBoardName"] },
              ],
              attributes: ["id", "grade"],
            },
          ],
        });
        var chapCount = await TaskBookChapterMapping.count({
          where: {
            bookTaskId: JSON.parse(JSON.stringify(bookTask[0])).bookTaskId,
            bookId: books[i].id,
          },
        });
        response.push({
          chapters: chapCount,
          book: books[i],
          ...JSON.parse(JSON.stringify(bookTask[0])),
        });
      }

      res.status(httpStatus.OK).send(response);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async unArchiveBook(req, res, next) {
    try {
      console.log(req.body);
      var books = await Book.update({ isArchived: false }, { where: req.body });
      res.status(httpStatus.OK).send({ message: "UnArchived Succesfully", books });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getSubjects(req, res, next) {
    try {
      var allSubjectIds = await Subject.findAll({ attributes: ["id", "subjectNameId"] });
      var map = new Map();

      for (var i = 0; i < allSubjectIds.length; i++) {
        if (map.has(allSubjectIds[i].subjectNameId)) {
          var arr = map.get(allSubjectIds[i].subjectNameId);
          arr.push(allSubjectIds[i].id);
          map.set(allSubjectIds[i].subjectNameId, arr);
        } else map.set(allSubjectIds[i].subjectNameId, [allSubjectIds[i].id]);
      }

      var subjectIds = [];
      map.forEach((value, key) => {
        subjectIds.push({ subjectNameId: key, id: value });
      });

      for (var i = 0; i < subjectIds.length; i++) {
        var subjects = await subjectName.findAll({ where: { id: subjectIds[i].subjectNameId } });
        var subject = JSON.parse(JSON.stringify(subjects[0]));
        subjectIds[i] = { subjectIds: subjectIds[i].id, ...subject };
        const getImageBannerObjectParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: subject.subjectImage,
        };

        const getImageBannerCommand = new GetObjectCommand(getImageBannerObjectParams);

        const imageBannerUrl = await getSignedUrl(s3Client, getImageBannerCommand, {
          expiresIn: 3600,
        });

        subjectIds[i].subjectImage = imageBannerUrl;
      }
      res.status(httpStatus.OK).send(subjectIds);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getArchivedPastPaperBySubjectId(req, res, next) {
    try {
      var pastpapers = await Sheet.findAll({
        where: { subjectId: req.body.ids, isArchived: true },
        include: [
          { model: Board, attributes: ["id", "boardName"] },
          { model: User, as: "assignedToUserName" },
          {
            model: Subject,
            attributes: ["id"],
            include: [{ model: subjectName, attributes: ["subjectName"] }],
          },
          { model: Variant, attributes: ["id", "name"] },
          { model: SubBoard, attributes: ["id", "subBoardName"] },
          { model: SubjectLevel, attributes: ["id", "subjectLevelName"] },
        ],
      });

      res.status(httpStatus.OK).send(pastpapers);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async unArchivePastPaper(req, res, next) {
    try {
      console.log(req.body);
      var pp = await Sheet.update({ isArchived: false }, { where: req.body });
      res.status(httpStatus.OK).send({ message: "UnArchived Succesfully", pp });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getArchivedSheetsBySubjectId(req, res, next) {
    try {
      var sheets = await SheetManagement.findAll({
        where: { subjectId: req.body.ids, isArchived: true },
        include: [
          { model: Board, attributes: ["id", "boardName"] },
          {
            model: Subject,
            attributes: ["id"],
            include: [{ model: subjectName, attributes: ["subjectName"] }],
          },
          { model: Variant, attributes: ["id", "name"] },
          { model: SubBoard, attributes: ["id", "subBoardName"] },
        ],
      });

      for (var i = 0; i < sheets.length; i++) {
        var user = await User.findOne({
          where: { id: sheets[i].assignedToUserId },
          attributes: ["id", "Name"],
        });
        var subjectLevel = await SubjectLevel.findAll({
          where: { id: sheets[i].subjectLevelId },
          attributes: ["id", "subjectLevelName"],
        });
        sheets[i] = {
          ...JSON.parse(JSON.stringify(sheets[i])),
          assignedUser: user,
          subjectLevel: subjectLevel[0],
        };
      }

      res.status(httpStatus.OK).send(sheets);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async unArchiveSheet(req, res, next) {
    try {
      var sheetManagement = await SheetManagement.update(
        { isArchived: false },
        { where: { id: req.body.id } }
      );
      res.status(httpStatus.OK).send({ message: "UnArchived Succesfully", sheetManagement });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async getAllTasks(req, res, next) {
    try {
      var booksRes = await BookTask.findAll({
        where: { isArchived: true },
        include: [
          { model: Board, attributes: ["id", "boardName"] },
          { model: User, as: "assignedToUserName" },
          {
            model: Subject,
            attributes: ["id"],
            include: [{ model: subjectName, attributes: ["subjectName"] }],
          },
          { model: SubBoard, attributes: ["id", "subBoardName"] },
        ],
      });
      var topicsRes = await TopicTask.findAll({
        where: { isArchived: true },
        include: [
          { model: Board, attributes: ["id", "boardName"] },
          { model: User, as: "assignedToUserName" },
          {
            model: Subject,
            attributes: ["id"],
            include: [{ model: subjectName, attributes: ["subjectName"] }],
          },
          { model: SubBoard, attributes: ["id", "subBoardName"] },
        ],
      });

      var books = JSON.parse(JSON.stringify(booksRes));
      var topics = JSON.parse(JSON.stringify(topicsRes));
      books.forEach((item) => {
        item.TaskType = "book";
      });

      topics.forEach((item) => {
        item.TaskType = "topic";
      });

      var response = [...books, ...topics];

      res.status(httpStatus.OK).send(response);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async unArchiveTask(req, res, next) {
    try {
      var details = req.body;

      if (details.TaskType === "book") {
        var task = await BookTask.update({ isArchived: false }, { where: { id: details.id } });
      } else if (details.TaskType === "topic") {
        var task = await TopicTask.update({ isArchived: false }, { where: { id: details.id } });
      } else throw new ApiError(httpStatus.BAD_REQUEST, "Task Not Found For This Type!");

      res.status(httpStatus.OK).send({ message: "UnArchived Succesfully", task });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};

module.exports = ArchiveManagmentController;
