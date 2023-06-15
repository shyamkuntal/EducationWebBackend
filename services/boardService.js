const { UserBoardMapping, SubBoard, Board } = require("../models/Board");

const createBoard = async (
  boardName,
  boardType,
  contact,
  email,
  website,
  address
) => {
  try {
    const board = await Board.create({
      boardName,
      boardType,
      contact,
      email,
      website,
      address,
    });

    return board;
  } catch (err) {
    throw err;
  }
};

const findAllBoards = async (attributes) => {
  try {
    let boards = await Board.findAll({
      where: { isArchived: false },
      attributes: attributes,
    });
    return boards;
  } catch (err) {
    throw err;
  }
};

async function findBoardById(boardId) {
  try {
    let board = await Board.findOne({ where: { id: boardId }, raw: true });

    return board;
  } catch (err) {
    throw err;
  }
}

const getSubBoardsByBoardId = async (boardId) => {
  try {
    console.log(boardId);
    let subBoards = await SubBoard.findAll({
      where: { boardId: boardId, isArchived: "false" },
      attributes: ["id", "subBoardName", "boardId", "isArchived"],
      raw: true,
    });

    return subBoards;
  } catch (err) {
    throw err;
  }
};

const createSubBoard = async (boardId, subBoardName) => {
  try {
    let subBoards = await SubBoard.create({
      boardId: boardId,
      subBoardName: subBoardName,
    });

    return subBoards;
  } catch (err) {
    throw err;
  }
};

const bulkCreateSubBoards = async (subBoards) => {
  try {
    let bulkSubBoards = await SubBoard.bulkCreate(subBoards);

    return bulkSubBoards;
  } catch (err) {
    throw err;
  }
};

const updateBoardIsPublished = async (boardId, isPublished) => {
  try {
    let updateIsPublished = await Board.update(
      { isPublished: isPublished },
      { where: { id: boardId } }
    );
    return updateIsPublished;
  } catch (err) {
    throw err;
  }
};

const updateBoardIsArchived = async (boardId, isArchived) => {
  try {
    let updateIsArchived = await Board.update(
      { isArchived: isArchived },
      { where: { id: boardId } }
    );

    return updateIsArchived;
  } catch (err) {
    throw err;
  }
};

const updateSuBoardsIsArchived = async (boardId, subBoardIds, isArchived) => {
  try {
    console.log(subBoardIds);
    let updateIsArchived = await SubBoard.update(
      { isArchived },
      { where: { id: subBoardIds, boardId } }
    );
    console.log(updateIsArchived);

    return updateIsArchived;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  getSubBoardsByBoardId,
  createSubBoard,
  createBoard,
  bulkCreateSubBoards,
  findBoardById,
  updateBoardIsPublished,
  updateBoardIsArchived,
  updateSuBoardsIsArchived,
  findAllBoards,
};
