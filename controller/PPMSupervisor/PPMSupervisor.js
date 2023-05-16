import { Sequelize } from "sequelize";
import { Board, SubBoard } from "../../models/Board.js";
import { Sheet } from "../../models/Sheet.js";
import { Subject, SubjectLevel } from "../../models/Subject.js";

//take care of isarchived and ispublished later
export const CreateSheet = async (req, res) => {
  try {
    const {
      boardId,
      SubBoardId,
      grade,
      subjectId,
      subjectLevelId,
      year,
      season,
      varient,
      paperNumber,
      resources,
    } = req.body;

    const sheet = await Sheet.create({
      boardId,
      SubBoardId,
      grade,
      subjectId,
      subjectLevelId,
      year,
      season,
      varient,
      paperNumber,
      resources,
    });
    return res.json({ status: 200, sheet });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

export const getallboards = async (req, res) => {
  try {
    const distinctBoardIds = await Subject.findAll({
      attributes: ["boardId"],
      group: ["boardId"],
    });

    const boardIds = distinctBoardIds.map((board) => board.boardId);

    const boards = await Board.findAll({
      attributes: ["id", "boardName"],
      where: {
        id: boardIds,
      },
    });

    const boardNames = boards.map((board) => board.dataValues);

    return res.json({ status: 200, boardNames });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

export const getallsubboards = async (req, res) => {
  const boardId = req.params.boardId;
  try {
    const distinctSubBoardIds = await Subject.findAll({
      attributes: ["SubBoardId"],
      group: ["SubBoardId"],
    });
    const subboardIds = distinctSubBoardIds.map(
      (subboard) => subboard.SubBoardId
    );
    const subboards = await SubBoard.findAll({
      attributes: ["id", "SubBoardName"],
      where: {
        id: subboardIds,
        boardId,
      },
    });
    console.log(subboards);
    const subboardNames = subboards.map((subboard) => subboard.dataValues);
    return res.json({ status: 200, subboardNames });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

export const getallgrades = async (req, res) => {
  const boardId = req.params.boardId;
  const SubBoardId = req.params.SubBoardId;
  try {
    const distinctgrades = await Subject.findAll({
      attributes: ["grade"],
      where: {
        boardId,
        SubBoardId,
      },
      group: ["grade"],
    });

    return res.json({ status: 200, distinctgrades });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

export const getallsubjects = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const SubBoardId = req.params.SubBoardId;
    const grade = req.params.grade;

    const distinctsubjects = await Subject.findAll({
      attributes: ["subjectName", "id"],
      where: {
        boardId,
        SubBoardId,
        grade,
        isArchived: false,
        isPublished: true,
      },
      group: ["subjectName", "id"],
    });

    return res.json({ status: 200, distinctsubjects });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

export const getalllevels = async (req, res) => {
  try {
    const subjectId = req.params.subjectid;
    const levels = await SubjectLevel.findAll({
      attributes: ["subjectLevelName", "id"],
      where: {
        subjectId,
        isArchived: false,
      },
    });

    return res.json({ status: 200, levels });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

export const getallsheetsubjects = async (req, res) => {
  try {
    const distinctsubjectIds = await Sheet.findAll({
      attributes: ["subjectId"],
      group: ["subjectId"],
    });

    const subjectIds = distinctsubjectIds.map((subject) => subject.subjectId);

    const subjects = await Subject.findAll({
      attributes: ["id", "subjectName"],
      where: {
        id: subjectIds,
      },
    });

    const subjectNames = subjects.map((subject) => subject.dataValues);

    return res.json({ status: 200, subjectNames });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

export const getsinglesheet = async (req, res) => {
  const id = req.params.sheetid;
  try {
    const shetinfo = await Sheet.findAll({
      include: [
        {
          model: SubBoard,
          attributes: ["SubBoardName"],
        },
        {
          model: Board,
          attributes: ["boardName"],
        },
        {
          model: SubjectLevel,
          attributes: ["id", "subjectLevelName", "isArchived"],
          required: false,
        },
      ],
      where: { id },
    });

    return res.json({ status: 200, shetinfo });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

export const TogglePublishSheet = async (req, res) => {
  const id = req.params.sheetid;
  const isPublished = req.body.isPublished;

  try {
    const sheet = await Sheet.findByPk(id);

    if (!sheet) {
      return res.status(404).json({ message: "sheet not found" });
    }

    sheet.isPublished = isPublished;
    await sheet.save();

    return res.json({ status: 200, sheet });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};

export const ToggleArchiveSheet = async (req, res) => {
  const id = req.params.sheetid;
  const isArchived = req.body.isArchived;
  try {
    const sheet = await Sheet.findByPk(id);

    if (!sheet) {
      return res.status(404).json({ message: "sheet not found" });
    }

    sheet.isArchived = isArchived;
    await sheet.save();
    res.json({ status: 200, sheet });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};
