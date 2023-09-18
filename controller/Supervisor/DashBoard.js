const services = require("../../services/index.js");
const httpStatus = require("http-status");
const { User, Roles } = require("../../models/User.js");
const { Board, SubBoard } = require("../../models/Board.js");
const { PastPaper } = require("../../models/PastPaper.js");
const { SheetManagement } = require("../../models/SheetManagement.js");

const DashBoardController = {

    async getAllBoardSubBoard(req, res, next) {
        try {
            let allBoards = await Board.findAll({ attributes: ['id', 'boardName'] });
            let allSubBoards = await SubBoard.findAll({ attributes: ['subBoardName', 'boardId'] })

            let response = allBoards.map(board => (
                {
                    board: board.boardName,
                    subboards: allSubBoards.map((sb) => {
                        if (sb.boardId === board.id) return sb.subBoardName
                        else return ""
                    }).filter((subBoard) => { return subBoard !== "" })
                }))

            res.status(httpStatus.OK).send(response);
        } catch (err) {
            next(err);
        }
    },

    async getTotal(req, res, next) {
        try {
            let allBoards = await Board.count();
            let allPastPapers = await PastPaper.count()
            let allUsers = await User.count()
            let allSheets = await SheetManagement.count()

            res.status(httpStatus.OK).send({ board: allBoards, pastpaper: allPastPapers, users: allUsers, sheets: allSheets });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = DashBoardController;
