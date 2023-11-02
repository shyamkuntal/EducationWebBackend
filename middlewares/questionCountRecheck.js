const { Question } = require("../models/Question")
const {
    getQuestionsSchema,
} = require("../validations/SheetManagementUploaderValidations");


const questionCountRecheck = (req) => {
    return async (req, res, next) => {
        try {
            let values = await getQuestionsSchema.validateAsync({ sheetId: req.query.sheetId });
            let all = await Question.count({ where: { sheetId: values.sheetId, isErrorByReviewer: true, isReCheckedByReviewer: false } });
            let checked = await Question.count({ where: { sheetId: values.sheetId, isCheckedByReviewer: true, isReCheckedByReviewer: true } })
            let error = await Question.count({ where: { sheetId: values.sheetId, isErrorByReviewer: true, isReCheckedByReviewer: true } })

            res.allQuestions = all
            res.checkedQuestions = checked
            res.errorQuestions = error
            next();
        } catch (err) {
            res.status(500).json({ status: 501, error: err.message });
        }
    };
};


module.exports = questionCountRecheck;
