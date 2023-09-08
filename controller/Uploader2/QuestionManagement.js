const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");

const QuestionManagementController = {

    async createLongAnswer(req, res, next) {
        const t = await db.transaction();
        try {
            let question = await services.questionService.createQuestion(req.body, {
                transaction: t,
            });
            res.status(httpStatus.OK).send(question);
            await t.commit();
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },

    async createQuestion(req, res, next) {
        try {
            let question = await services.questionService.createQuestion(req.body);
            res.status(httpStatus.OK).send(question);
        } catch (err) {
            next(err);
        }
    },

};

module.exports = QuestionManagementController;
