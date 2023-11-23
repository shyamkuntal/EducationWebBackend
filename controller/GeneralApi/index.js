const { Question } = require("../../models/Question");
const { UserSubjectMapping, User } = require("../../models/User");
const { SheetManagement } = require("../../models/SheetManagement");
const { subjectName, Subject } = require("../../models/Subject");
const { where } = require("sequelize");
const { SubBoard, Board } = require("../../models/Board");
const { Notice } = require("../../models/Notice");
const { Sheet } = require("../../models/PastPaperSheet");
const { PaperNumberSheet } = require("../../models/PaperNumberSheet");
const { BookTask } = require("../../models/BookTask");
const { TopicTask } = require("../../models/TopicTask");

const GeneralApi = {
  async getAllSubjectByUserId(req, res) {
    try {
      const id = req.query.id;
      const Result = await UserSubjectMapping.findAll({
        where: { userId: id },
        include: [{ model: subjectName, include: [{ model: Subject }] }],
      });
      res.send(Result);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSheetByUserId(req, res) {
    try {
      const id = req.query.id;
      const Result = await SheetManagement.findAll({
        where: {
          uploader2Id: id,
          isSpam: false,
        },
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSheetOfReportedError(req, res) {
    try {
      const id = req.query.id;
      const Result = await SheetManagement.findAll({
        where: {
          uploader2Id: id,
          isSpam: true,
        },
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSpamQuestionByUSer(req, res) {
    try {
      const id = req.query.id;
      let filters = {};
      if (req.query.boardId) {
        filters.boardId = req.query.boardId;
      }
      if (req.query.subjectId) {
        filters.subjectId = req.query.subjectId;
      }
      if (req.query.subBoardId) {
        filters.subBoardId = req.query.subBoardId;
      }
      if (req.query.grade) {
        filters.grade = req.query.grade;
      }
      if (req.query.isSpam) {
        filters.isSpam = true;
      }
      if (req.query.uploader2Id) {
        filters.uploader2Id = req.query.uploader2Id;
      }
      const Result = await Question.findAll({
        where: {
          isErrorByTeacher: true,
          isErrorByReviewer: true,
        },
        include: [
          {
            model: SheetManagement,
            where: filters,
          },
        ],
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSheetBySubjectIdandUserId(req, res) {
    try {
      const id = req.query.id;
      const subjectNameId = req.query.subjectId;
      if (subjectNameId) {
        Result = await SheetManagement.findAll({
          where: {
            assignedToUserId: id,
            isArchived: false,
            isPublished: false,
          },
          include: {
            model: Subject,
            include: [
              {
                model: subjectName,
                where: {
                  id: subjectNameId,
                },
              },
            ],
            where: {
              subjectNameId: subjectNameId,
            },
          },
        });
      } else {
        Result = await SheetManagement.findAll({
          where: {
            uploader2Id: id,
            isSpam: false,
          },
        });
      }

      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllPastPaperSheetBySubjectIdandUserId(req, res) {
    try {
      const id = req.query.id;
      const subjectNameId = req.query.subjectId;
      Result = await Sheet.findAll({
        where: {
          assignedToUserId: id,
          isArchived: false,
          isPublished: false,
        },
        include: {
          model: Subject,
          include: [
            {
              model: subjectName,
              where: {
                id: subjectNameId,
              },
            },
          ],
          where: {
            subjectNameId: subjectNameId,
          },
        },
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllPaperNoSheetBySubjectIdandUserId(req, res) {
    try {
      const id = req.query.id;
      const subjectNameId = req.query.subjectId;
      // const supervisorId = req.query.supervisorId
      if (subjectNameId) {
        Result = await PaperNumberSheet.findAll({
          where: {
            assignedToUserId: id,
            isArchived: false,
            isPublished: false,
          },
          include: {
            model: Subject,
            include: [
              {
                model: subjectName,
                where: {
                  id: subjectNameId,
                },
              },
            ],
            where: {
              subjectNameId: subjectNameId,
            },
          },
        });
      } else {
        Result = await SheetManagement.findAll({
          where: {
            uploader2Id: id,
            isSpam: false,
            isArchived: false,
          },
        });
      }

      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllBookSheetBySubjectIdandUserId(req, res) {
    try {
      const id = req.query.id;
      const subjectNameId = req.query.subjectId;
      // const supervisorId = req.query.supervisorId
      if (subjectNameId) {
        Result = await BookTask.findAll({
          where: {
            assignedToUserId: id,
            isArchived: false,
            isPublished: false,
          },
          include: {
            model: Subject,
            include: [
              {
                model: subjectName,
                where: {
                  id: subjectNameId,
                },
              },
            ],
            where: {
              subjectNameId: subjectNameId,
            },
          },
        });
      } else {
        Result = await SheetManagement.findAll({
          where: {
            uploader2Id: id,
            isSpam: false,
            isArchived: false,
          },
        });
      }

      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllTopicSheetBySubjectIdandUserId(req, res) {
    try {
      const id = req.query.id;
      const subjectNameId = req.query.subjectId;
      // const supervisorId = req.query.supervisorId
      if (subjectNameId) {
        Result = await TopicTask.findAll({
          where: {
            assignedToUserId: id,
            isArchived: false,
            isPublished: false,
          },
          include: {
            model: Subject,
            include: [
              {
                model: subjectName,
                where: {
                  id: subjectNameId,
                },
              },
            ],
            where: {
              subjectNameId: subjectNameId,
            },
          },
        });
      } else {
        Result = await SheetManagement.findAll({
          where: {
            uploader2Id: id,
            isSpam: false,
          },
        });
      }

      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = { GeneralApi };
