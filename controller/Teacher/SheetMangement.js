const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { QuestionTopicMapping } = require("../../models/QuestionTopicMapping");
const { QuestionVocabMapping } = require("../../models/QuestionVocabMapping");
const { QuestionSubTopicMapping } = require("../../models/QuestionSubTopicMapping");
const { Topic, SubTopic } = require("../../models/Topic");
const { Vocabulary } = require("../../models/Vocabulary");

const TeacherSheetManagementController = {
  async createTopicSubTopicMappingForQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const data = req.body;
      const questionId = data.questionId;
      const topicIds = data.topicIds;
      const subTopicIds = data.subTopicIds;

      const createdTopicMappings = await Promise.all(
        topicIds.map(async (topicId) => {
          return await QuestionTopicMapping.create(
            {
              questionId,
              topicId,
            },
            { transaction: t }
          );
        })
      );

      const createdSubTopicMappings = await Promise.all(
        subTopicIds.map(async (subTopicId) => {
          return await QuestionSubTopicMapping.create(
            {
              questionId,
              subTopicId,
            },
            { transaction: t }
          );
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        questionId,
        topicMappings: createdTopicMappings,
        subTopicMapping: createdSubTopicMappings,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editTopicSubTopicMappingForQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const data = req.body;
      const questionId = data.questionId;
      const createNewTopics = data.createNewTopics || [];
      const deleteTopics = data.deleteTopics || [];
      const createNewSubTopics = data.createNewSubTopics || [];
      const deleteSubTopics = data.deleteSubTopics || [];

      const createdTopicMappings = await Promise.all(
        createNewTopics.map(async (topicId) => {
          return await QuestionTopicMapping.create(
            {
              questionId,
              topicId,
            },
            { transaction: t }
          );
        })
      );

      const deletedTopicMappings = await Promise.all(
        deleteTopics.map(async (topicId) => {
          return await QuestionTopicMapping.destroy(
            {
              where: {
                questionId,
                topicId,
              },
            },
            { transaction: t }
          );
        })
      );

      const createdSubTopicMappings = await Promise.all(
        createNewSubTopics.map(async (subTopicId) => {
          return await QuestionSubTopicMapping.create(
            {
              questionId,
              subTopicId,
            },
            { transaction: t }
          );
        })
      );

      const deletedSubTopicMappings = await Promise.all(
        deleteSubTopics.map(async (subTopicId) => {
          return await QuestionSubTopicMapping.destroy(
            {
              where: {
                questionId,
                subTopicId,
              },
            },
            { transaction: t }
          );
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        questionId,
        topicMappings: {
          created: createdTopicMappings,
          deleted: deletedTopicMappings,
        },
        subTopicMappings: {
          created: createdSubTopicMappings,
          deleted: deletedSubTopicMappings,
        },
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async createVocabMappingForQuestion(req, res, next) {
    const t = await db.transaction();
    try {
      const data = req.body;
      const questionId = data.questionId;
      const vocabIds = data.vocabIds;

      const createdVocabMappings = await Promise.all(
        vocabIds.map(async (vocabId) => {
          return await QuestionVocabMapping.create(
            {
              questionId,
              vocabId,
            },
            { transaction: t }
          );
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        questionId,
        vocabMappings: createdVocabMappings,
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async editVocabMapping(req, res, next) {
    const t = await db.transaction();
    try {
      const data = req.body;
      const questionId = data.questionId;
      const createNewVocab = data.createNewVocab || [];
      const deleteVocab = data.deleteVocab || [];

      const createVocabMapping = await Promise.all(
        createNewVocab.map(async (vocabId) => {
          return await QuestionVocabMapping.create(
            {
              questionId,
              vocabId,
            },
            { transaction: t }
          );
        })
      );

      const deletedVocabMapping = await Promise.all(
        deleteVocab.map(async (vocabId) => {
          return await QuestionVocabMapping.destroy(
            {
              where: {
                questionId,
                vocabId,
              },
            },
            { transaction: t }
          );
        })
      );

      await t.commit();
      res.status(httpStatus.OK).send({
        questionId,
        vocabMappings: {
          created: createVocabMapping,
          deleted: deletedVocabMapping,
        },
      });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },
  async getTopicSubTopicVocabMappingsForQuestion(req, res, next) {
    try {
      const questionId = req.query.questionId;

      const topicMappings = await QuestionTopicMapping.findAll({
        where: {
          questionId,
        },
        attributes: ["topicId"],
        include: [{ model: Topic, attributes: ["name"] }],
        raw: true,
      });

      const subTopicMappings = await QuestionSubTopicMapping.findAll({
        where: {
          questionId,
        },
        attributes: ["subTopicId"],
        include: [{ model: SubTopic, attributes: ["name"] }],
        raw: true,
      });

      const vocabMappings = await QuestionVocabMapping.findAll({
        where: {
          questionId,
        },
        attributes: ["vocabId"],
        include: [{ model: Vocabulary, attributes: ["name"] }],
        raw: true,
      });

      res.status(httpStatus.OK).send({
        questionId,
        topicMappings,
        subTopicMappings,
        vocabMappings,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  async markQuestionAsChecked(req, res, next){
    const t = await db.transaction();
    try {
      const { questionId, questionData } = req.body;

      const updatedData = {
        isCheckedByTeacher: true,
        isErrorByTeacher: false
      };

      let question = await services.questionService.updateQuestion(questionId, updatedData, {
        transaction: t,
      });

      res.status(httpStatus.OK).send(question);
      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async markQuestionAsError(req, res, next){
    const t = await db.transaction();
    try {
      const { questionId, errorReport } = req.body;

      const updatedData = {
        isCheckedByTeacher: false,
        isErrorByTeacher: true,
        errorReportByTeacher: errorReport
      };

      let question = await services.questionService.updateQuestion(questionId, updatedData, {
        transaction: t,
      });

      res.status(httpStatus.OK).send(question);
      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async removeQuestionAsError(req, res, next){
    const t = await db.transaction();
    try {
      const questionId = req.query.questionId;

      const updatedData = {
        isErrorByTeacher: false,
      };

      let question = await services.questionService.updateQuestion(questionId, updatedData, {
        transaction: t,
      });

      res.status(httpStatus.OK).send(question);
      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  async removeQuestionAsChecked(req, res, next){
    const t = await db.transaction();
    try {
      const questionId = req.query.questionId;

      const updatedData = {
        isCheckedByTeacher: false
      };

      let question = await services.questionService.updateQuestion(questionId, updatedData, {
        transaction: t,
      });

      res.status(httpStatus.OK).send(question);
      await t.commit();
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
};

module.exports = TeacherSheetManagementController;
