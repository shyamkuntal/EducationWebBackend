const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { QuestionTopicMapping } = require("../../models/QuestionTopicMapping");
const { QuestionVocabMapping } = require("../../models/QuestionVocabMapping");
const { QuestionSubTopicMapping } = require("../../models/QuestionSubTopicMapping");
const { Topic, SubTopic } = require("../../models/Topic");
const { Vocabulary } = require("../../models/Vocabulary");

const PricerSheetManagementController = {
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
}

module.exports = PricerSheetManagementController

