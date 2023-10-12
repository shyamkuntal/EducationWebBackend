const { Board, SubBoard } = require("../../models/Board");
const { Subject, SubjectLevel } = require("../../models/Subject");
const { SheetManagement } = require("../../models/SheetManagement");
const { Variant } = require("../../models/Variants");
const { PaperNumberSheet } = require("../../models/PaperNumberSheet");
const { TopicTask } = require("../../models/TopicTask");
const { TaskTopicMapping } = require("../../models/TopicTaskMapping");
const { Topic } = require("../../models/Topic");
const { Question } = require("../../models/Question");
const { where, Model } = require("sequelize");

const AllFilteredApi = {
  async getAllBoards(req, res) {
    try {
      console.log(req, "req");
      console.log("success");
      const Result = await Board.findAll();
      res.send(Result);
      s;
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error"); // Handle the error appropriately
    }
  },

  async getAllSubBoards(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      console.log(boardId, "id");
      const Result = await SubBoard.findAll({
        where: {
          boardId: boardId,
        },
      });

      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSubjects(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await Subject.findAll({
        where: {
          subBoardId: boardId,
        },
        include: ["subjectName"], // Include the associated Child model
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllgrades(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await SheetManagement.findAll({
        where: {
          subBoardId: boardId,
        },
      });

      let gradeSet = new Set(); // Create a Set to store unique grades

      Result.forEach((sheet) => {
        if (sheet.grade) {
          gradeSet.add(sheet.grade);
        }
      });

      const gradeArray = Array.from(gradeSet); //

      res.send(gradeArray);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllYear(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await SheetManagement.findAll({
        where: {
          subBoardId: boardId,
        },
      });

      console.log(Result, "result");

      let yearSet = new Set(); // Create a Set to store unique grades

      Result.forEach((sheet) => {
        if (sheet.year) {
          yearSet.add(sheet.year);
        }
      });

      const yearArray = Array.from(yearSet); //

      res.send(yearArray);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSeason(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await SheetManagement.findAll({
        where: {
          subBoardId: boardId,
        },
      });

      let seasonSet = new Set(); // Create a Set to store unique grades

      Result.forEach((sheet) => {
        if (sheet.season) {
          seasonSet.add(sheet.season);
        }
      });

      const seasonArray = Array.from(seasonSet); //

      res.send(seasonArray);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllVariant(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await SheetManagement.findAll({
        where: {
          subBoardId: boardId,
        },
      });

      let yearSet = new Set(); // Create a Set to store unique grades

      Result.forEach((sheet) => {
        if (sheet.year) {
          yearSet.add(sheet.year);
        }
      });

      const yearArray = Array.from(yearSet); //

      res.send(yearArray);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getSubjectLevel(req, res) {
    try {
      const subjectId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await SubjectLevel.findAll({
        where: {
          subjectId: subjectId,
        },
      });

      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllVariant(req, res) {
    try {
      const Result = await Variant.findAll();
      res.send(Result);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllPaperNumber(req, res) {
    try {
      const subjectId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await PaperNumberSheet.findAll({
        where: {
          subjectId: subjectId,
        },
      });
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllTopicsUsingSubjectID(req, res) {
    try {
      const subjectId = req.query.id;
      const topics = await TaskTopicMapping.findAll({
        include: [
          {
            model: TopicTask,
            where: {
              subjectId: subjectId,
            },
          },
          {
            model: Topic,
          },
        ],
      });
      let TopicNameArray = [];
      topics.forEach((topic) => {
        TopicNameArray.push(topic.topic);
      });
      res.send(TopicNameArray);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getQuestionsByFilterResult(req, res) {
    try {
      let whereClauseForSheet = {};
      let whereClauseForLevel = {};
      let whereClauseForPaperNo = {};
      let whereClauseForTopic = {};
      let board = req.query.board;
      let subboard = req.query.subboard;
      let grade = req.query.grade;
      let subject = req.query.subject;
      let topic = req.query.topic;
      let year = req.query.year;
      let season = req.query.season;
      let variant = req.query.variant;
      let paperNo = req.query.paperNo;
      let level = req.query.level;

      if (board !== undefined) {
        whereClauseForSheet.boardId = board;
      }
      if (subboard !== undefined) {
        whereClauseForSheet.subBoardId == subboard;
      }
      if (grade !== undefined) {
        whereClauseForSheet.grade = grade;
      }
      if (year !== undefined) {
        whereClauseForSheet.year = year;
      }
      if (season !== undefined) {
        whereClauseForSheet.season = season;
      }
      if (variant !== undefined) {
        whereClauseForSheet.variantID = variant;
      }
      if (subject !== undefined) {
        whereClauseForSheet.subjectId = subject;
      }
      if (level !== undefined) {
        whereClauseForLevel.levelID = level;
      }
      if (paperNo !== undefined) {
        whereClauseForPaperNo.id = paperNo;
      }
      if (topic !== undefined) {
        whereClauseForTopic.topicId = topic;
      }

      let Questions = await Question.findAll({
        include: [
          {
            model: SheetManagement,
            where: whereClauseForSheet,
            include: [
              {
                model: Subject,
                include: [
                  {
                    model: SubjectLevel,
                    where: whereClauseForLevel,
                  },
                  {
                    model: PaperNumberSheet,
                    where: whereClauseForPaperNo,
                  },
                  {
                    model: TopicTask,
                    include: [
                      {
                        model: TaskTopicMapping,
                        where: whereClauseForTopic,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      res.send(Questions);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = { AllFilteredApi };
