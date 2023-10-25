const services = require("../../services/index");
const httpStatus = require("http-status");
const CONSTANTS = require("../../constants/constants");
const db = require("../../config/database");
const { QuestionTopicMapping } = require("../../models/QuestionTopicMapping");
const { QuestionVocabMapping } = require("../../models/QuestionVocabMapping");
const { QuestionSubTopicMapping } = require("../../models/QuestionSubTopicMapping");
const { User } = require('../../models/User')
const { Topic, SubTopic } = require("../../models/Topic");
const { Vocabulary } = require("../../models/Vocabulary");
const {
    updateInprogressTaskStatusSchema, updatePriceInQuestionSchema, assignSupervisorUserToSheetSchema, addErrorReportToSheetSchema
} = require("../../validations/PricerValidation");
const { SheetManagement } = require("../../models/SheetManagement");
const { Question } = require("../../models/Question");
const { ApiError } = require("../../middlewares/apiError.js");
const { s3Client } = require("../../config/s3");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
    async updateInProgressTaskStatus(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await updateInprogressTaskStatusSchema.validateAsync(req.body);

            let whereQuery = { where: { id: values.topicTaskId }, raw: true };

            let sheetData = await SheetManagement.findOne(whereQuery);

            if (!sheetData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
            }

            let assignedTo = sheetData.assignedToUserId;
            let lifeCycle = sheetData.lifeCycle;
            let previousStatus = sheetData.statusForPricer;

            if (assignedTo !== values.pricerId || lifeCycle !== CONSTANTS.roleNames.Pricer) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    "Task not assigned to Pricer or lifecycle mismatch"
                );
            }

            if (previousStatus === CONSTANTS.sheetStatuses.InProgress) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Current sheet status is already Inprogress");
            }

            await SheetManagement.update({
                statusForPricer: CONSTANTS.sheetStatuses.InProgress
            }, whereQuery)

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Task Status Updated successfully!" });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
    async updateCompletedTaskStatus(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await updateInprogressTaskStatusSchema.validateAsync(req.body);

            let whereQuery = { where: { id: values.topicTaskId }, raw: true };

            let sheetData = await SheetManagement.findOne(whereQuery);

            if (!sheetData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
            }

            let assignedTo = sheetData.assignedToUserId;
            let lifeCycle = sheetData.lifeCycle;

            if (assignedTo !== values.pricerId || lifeCycle !== CONSTANTS.roleNames.Pricer) {
                throw new ApiError(
                    httpStatus.BAD_REQUEST,
                    "Task not assigned to Pricer or lifecycle mismatch"
                );
            }

            await SheetManagement.update({
                statusForPricer: CONSTANTS.sheetStatuses.Complete
            }, whereQuery)

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Task Status Updated successfully!" });
        } catch (err) {
            await t.rollback();
            next(err);
        }
    },
    async addPriceForQuestion(req, res, next) {
        const t = await db.transaction();
        try {
            console.log(req.body)
            let whereQuery = { where: { id: req.body.id }, raw: true };

            let question = await Question.findOne(whereQuery);

            if (!question) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            if (question.hasSubPart) {
                let whereQuery = { parentQuestionId: question.id };

                let subPart = await Question.findAll({
                    where: whereQuery,
                    order: [["createdAt", "ASC"]],
                    raw: true,
                }, { transaction: t });

                for (var i = 0; i < subPart.length; i++) {
                    let whereQuery = { where: { id: subPart[i].id }, raw: true };
                    let request = {
                        priceForTeacher: Number(req.body.priceForTeacher[i]),
                        priceForStudent: Number(req.body.priceForStudent[i]),
                        isCheckedByPricer: true,
                        isErrorByReviewer: false
                    }
                    await Question.update(request, whereQuery, { transaction: t })
                }
            }

            let request = {
                priceForTeacher: question.hasSubPart ? Number(req.body.priceForTeacher.reduce((partialSum, a) => partialSum + Number(a), 0)) : Number(req.body.priceForTeacher),
                priceForStudent: question.hasSubPart ? Number(req.body.priceForStudent.reduce((partialSum, a) => partialSum + Number(a), 0)) : Number(req.body.priceForStudent),
                isCheckedByPricer: true,
                isErrorByReviewer: false
            }

            let values = await updatePriceInQuestionSchema.validateAsync(request);
            await Question.update(values, whereQuery, { transaction: t })

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Question Updated successfully!" });
        } catch (err) {
            await t.rollback();
            console.log(err)
            next(err);
        }
    },
    async removePriceForQuestion(req, res, next) {
        const t = await db.transaction();
        try {
            console.log(req.body)
            let whereQuery = { where: { id: req.body.id }, raw: true };

            let question = await Question.findOne(whereQuery);

            if (!question) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            if (question.hasSubPart) {
                let whereQuery = { parentQuestionId: question.id };

                let subPart = await Question.findAll({
                    where: whereQuery,
                    order: [["createdAt", "ASC"]],
                    raw: true,
                }, { transaction: t });

                for (var i = 0; i < subPart.length; i++) {
                    let whereQuery = { where: { id: subPart[i].id }, raw: true };
                    let request = {
                        priceForTeacher: null,
                        priceForStudent: null,
                        isCheckedByPricer: false
                    }
                    await Question.update(request, whereQuery, { transaction: t })
                }
            }

            let request = {
                priceForTeacher: null,
                priceForStudent: null,
                isCheckedByPricer: false
            }

            await Question.update(request, whereQuery, { transaction: t })

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Question Updated successfully!" });
        } catch (err) {
            await t.rollback();
            console.log(err)
            next(err);
        }
    },
    async AssignSheetToSupervisor(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await assignSupervisorUserToSheetSchema.validateAsync(req.body);
            let responseMessage = {
                assinedUserToSheet: "",
                UpdateSheetStatus: "",
                sheetLog: "",
            };
            let whereQueryForFindSheet = {
                where: {
                    id: values.sheetId,
                },
                include: [
                    { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
                    { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
                ],
                raw: true,
                nest: true,
            };
            let sheetData = await SheetManagement.findOne(whereQueryForFindSheet);
            if (!sheetData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Topic Task not found!");
            }
            if (sheetData.assignedToUserId === sheetData.supervisorId) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Task already assigned to supervisor!");
            }
            // Checking if sheet status is complete for reviewer
            if (sheetData.statusForPricer !== CONSTANTS.sheetStatuses.Complete) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Please mark it as complete first");
            }
            //UPDATE sheet assignment & sheet status
            let dataToBeUpdated = {
                assignedToUserId: sheetData.supervisorId,
                statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
            };
            let whereQuery = {
                where: { id: sheetData.id },
            };
            await SheetManagement.update(dataToBeUpdated, whereQuery, {
                transaction: t,
            });
            responseMessage.assinedUserToSheet = "Sheet assigned to supervisor successfully";
            responseMessage.UpdateSheetStatus = "Sheet Statuses updated successfully";
            // Create sheetLog
            await services.sheetManagementService.createSheetLog(
                values.sheetId,
                sheetData.assignedToUserName.userName,
                sheetData.supervisor.userName,
                CONSTANTS.sheetLogsMessages.pricerAssignToSupervisor,
                { transaction: t }
            );
            responseMessage.sheetLog = "Log record for assignment to supervisor added successfully";
            await t.commit();
            res.status(httpStatus.OK).send(responseMessage);
        } catch (err) {
            console.log(err);
            await t.rollback();
            next(err);
        }
    },
    async reportSheetError(req, res, next) {
        const t = await db.transaction();
        try {
            let values = await addErrorReportToSheetSchema.validateAsync(req.body);

            // checking sheet
            let whereQueryForFindSheet = {
                where: {
                    id: values.sheetId,
                },
                include: [
                    { model: User, as: "assignedToUserName", attributes: ["id", "Name", "userName"] },
                    { model: User, as: "supervisor", attributes: ["id", "Name", "userName"] },
                ],
                raw: true,
                nest: true,
            };
            let whereQuery = { where: { id: values.sheetId }, raw: true };

            let sheetData = await SheetManagement.findOne(whereQueryForFindSheet);

            if (!sheetData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Sheet not found!");
            }

            if (
                values.pricerId !== sheetData.pricerId ||
                sheetData.assignedToUserId !== sheetData.pricerId
            ) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Pricer not assigned to sheet!");
            }

            let dataToBeUpdated = {
                assignedToUserId: sheetData.supervisorId,
                statusForPricer: CONSTANTS.sheetStatuses.Complete,
                statusForSupervisor: CONSTANTS.sheetStatuses.Complete,
                pricerCommentToSupervisor: values.errorReport,
                isSpam: true,
            };

            await SheetManagement.update(dataToBeUpdated, whereQuery, {
                transaction: t,
            });

            // Create sheetLog
            await services.sheetManagementService.createSheetLog(
                values.sheetId,
                sheetData.assignedToUserName.userName,
                sheetData.supervisor.userName,
                CONSTANTS.sheetLogsMessages.pricerAssignToSupervisor,
                { transaction: t }
            );

            await t.commit();
            res.status(httpStatus.OK).send({ message: "Added To Spam Succesfully" });
        } catch (err) {
            await t.rollback();
            console.log(err)
            next(err);
        }
    },
    async getErrorsForQuestion(req, res, next) {
        try {
            // checking sheet
            let whereQuery = { where: { id: req.query.questionId }, raw: true };

            let questionData = await Question.findOne(whereQuery);

            if (!questionData) {
                throw new ApiError(httpStatus.BAD_REQUEST, "Question not found!");
            }

            const getFilesUrlFromS3 = async (fileName) => {
                try {
                    let getFilesParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: fileName,
                    };

                    const getFileCommand = new GetObjectCommand(getFilesParams);

                    const fileUrl = await getSignedUrl(s3Client, getFileCommand, {
                        expiresIn: 3600,
                    });

                    return fileUrl;
                } catch (err) {
                    throw err;
                }
            };


            let fileUrl = "";

            if (questionData.errorReportImgByReviewer)
                fileUrl = await getFilesUrlFromS3(
                    questionData.errorReportImgByReviewer
                );

            res.status(httpStatus.OK).send({
                errorReport: questionData.errorReportByReviewer ? questionData.errorReportByReviewer : "",
                errorReportFileUrl: { fileUrl, 'name': questionData.errorReportImgByReviewer },
            });
        } catch (err) {
            console.log(err)
            next(err);
        }
    },
}

module.exports = PricerSheetManagementController

