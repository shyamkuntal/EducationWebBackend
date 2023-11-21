const { Board, SubBoard } = require("../../models/Board");
const { Subject, SubjectLevel, subjectName } = require("../../models/Subject");
const { SheetManagement } = require("../../models/SheetManagement");
const { Variant } = require("../../models/Variants");
const { PaperNumberSheet, PaperNumber } = require("../../models/PaperNumberSheet");
const { TopicTask } = require("../../models/TopicTask");
const { TaskTopicMapping } = require("../../models/TopicTaskMapping");
const { QuestionTopicMapping } = require("../../models/QuestionTopicMapping");
const { Topic } = require("../../models/Topic");
const { Question } = require("../../models/Question");
const { QuestionVocabMapping } = require("../../models/QuestionVocabMapping");
const { Vocabulary } = require("../../models/Vocabulary");
const { where, Model } = require("sequelize");

const AllFilteredApi = {
  async getAllBoards(req, res) {
    try {
      const Result = await Board.findAll();
      res.send(Result);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error"); // Handle the error appropriately
    }
  },

  async getAllSubBoards(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      console.log(boardId, "id");
      const Result = await SubBoard.findAll();

      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllSubjects(req, res) {
    try {
      const Result = await subjectName.findAll();
      console.log(Result,"result")
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

  },

  async getAllgrades(req, res) {
    try {
      const boardId = req.query.id; // Assuming boardId is passed in the request params
      const Result = await SheetManagement.findAll();

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
      const Result = await SheetManagement.findAll();

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
      const Result = await SheetManagement.findAll();

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
      const Result = await SheetManagement.findAll();

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
      const Result = await SubjectLevel.findAll();

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
      const Result = await PaperNumber.findAll();
      res.send(Result);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  async getAllTopicsUsingSubjectID(req, res) {
    try {
      const subjectId = req.query.id;
      let whereClauseForTopic = {};
      const topicId = req.query.topicId;
      if (topicId) {
        whereClauseForTopic.id = topicId;
      }
      const topics = await Topic.findAll();
      // let TopicNameArray = [];
      // topics.forEach((topic) => {
      //   TopicNameArray.push({ topic: topic?.topic, topicTaskId: topic.topicTaskId });
      // });
      res.send(topics);
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
      let grades = req.query.grade ? req.query.grade.split(",") : null; // Handle multiple grades
      let subjects = req.query.subject ? req.query.subject.split(",") : null; // Handle multiple subjects
      let topics = req.query.topic ? req.query.topic.split(",") : null; // Handle multiple topics
      let years = req.query.year ? req.query.year.split(",") : null; // Handle multiple years
      let season = req.query.season;
      let variant = req.query.variant;
      let paperNumbers = req.query.paperNo ? req.query.paperNo.split(",") : null; // Handle multiple paper numbers
      let levels = req.query.level ? req.query.level.split(",") : null; // Handle multiple levels
  
      whereClauseForSheet.isPublished = true;
  
      if (board) {
        whereClauseForSheet.boardId = board;
      }
      if (subboard) {
        whereClauseForSheet.subBoardId == subboard;
      }
      if (grades) {
        whereClauseForSheet.grade = { [Op.in]: grades };
      }
      if (years) {
        whereClauseForSheet.year = { [Op.in]: years };
      }
      if (season) {
        whereClauseForSheet.season = season;
      }
      if (variant) {
        whereClauseForSheet.variantId = variant;
      }
      if (subjects) {
        whereClauseForSheet.subjectId = { [Op.in]: subjects };
      }
      if (levels) {
        whereClauseForLevel.id = { [Op.in]: levels };
      }
      if (paperNumbers) {
        whereClauseForPaperNo.id = { [Op.in]: paperNumbers };
      }
      if (topics) {
        whereClauseForTopic.topicId = { [Op.in]: topics };
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
                ],
              },
            ],
          },
          {
            model: QuestionTopicMapping,
            include: [
              {
                model: Topic,
                where: whereClauseForTopic,
              },
            ],
          },
          {
            model: QuestionVocabMapping,
            include: [
              {
                model: Vocabulary,
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

      whereClauseForSheet.isPublished =true

      if (board) {
        whereClauseForSheet.boardId = board;
      }
      if (subboard) {
        whereClauseForSheet.subBoardId == subboard;
      }
      if (grade) {
        whereClauseForSheet.grade = grade;
      }
      if (year) {
        whereClauseForSheet.year = year;
      }
      if (season) {
        whereClauseForSheet.season = season;
      }
      if (variant) {
        whereClauseForSheet.variantId = variant;
      }
      if (subject) {
        whereClauseForSheet.subjectName = subject;
      }
      if (level) {
        whereClauseForLevel.id = level;
      }
      if (paperNo) {
        whereClauseForPaperNo.id = paperNo;
      }
      if (topic) {
        whereClauseForTopic.name = topic;
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
          {
            model: QuestionTopicMapping,
            include: [
              {
                model: Topic,
                whereClauseForTopic,
              },
            ],
          },
          {
            model: QuestionVocabMapping,
            include: [
              {
                model: Vocabulary,
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
