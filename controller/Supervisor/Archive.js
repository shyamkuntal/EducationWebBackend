const { Subject, SubjectLevel, subjectName } = require("../../models/Subject.js");
const { Board, SubBoard } = require("../../models/Board.js")
const httpStatus = require("http-status");
const services = require("../../services/index.js");
require("dotenv").config();

const ArchiveManagmentController = {
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
                        where: { isArchived: false },
                        required: false,
                    },
                    {
                        model: subjectName,
                        where: req.query.subjectName ? { id: req.query.subjectName } : {},
                        attributes: ["id", "subjectName"],
                    },
                ],
                where: { isArchived: true },
            })

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
                        attributes: ["id","grade"],
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
            })

            res.status(httpStatus.OK).send(subjects);
        } catch (err) {
            next(err);
        }
    },
};

module.exports = ArchiveManagmentController;
