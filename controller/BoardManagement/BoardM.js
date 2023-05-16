import { Board, SubBoard } from "../../models/Board.js";

// creating board initially
export const CreateBoard = async (req, res) => {
  const { boardName, boardType, contact, email, website, address, subBoard } =
    req.body;

  try {
    // Create a new board entry
    const board = await Board.create({
      boardName,
      boardType,
      contact,
      email,
      website,
      address,
    });

    //Create sub-board entries
    if (subBoard && subBoard.length > 0) {
      const subBoards = subBoard.map((subBoardData) => ({
        SubBoardName: subBoardData.name,
        isArchived: subBoardData.isArchived || false,
        boardId: board.id, // Associate the sub-board with the created board
      }));

      await SubBoard.bulkCreate(subBoards);
    }

    res.status(201).json({
      message: "Board and sub-board created successfully",
      board,
    });

    return res.json({ status: 200, board });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

// Update board and sub-board details
// export const UpdateBoard = async (req, res) => {
//   const { id } = req.params;
//   const { boardName, boardType, contact, email, website, address, subBoard } =
//     req.body;

//   try {
//     // Find the board by ID
//     const board = await Board.findByPk(id);

//     if (!board) {
//       return res.status(404).json({ message: "Board not found" });
//     }

//     // Update board details
//     board.boardName = boardName;
//     board.boardType = boardType;
//     board.contact = contact;
//     board.email = email;
//     board.website = website;
//     board.address = address;

//     await board.save();

//     // Update sub-board details
//     // if (subBoard && subBoard.length > 0) {
//     //   // Get the sub-boards associated with the board
//     //   const existingSubBoards = await SubBoard.findAll({
//     //     where: { boardId: board.id },
//     //   });

//     //   // Map the existing sub-boards to their IDs
//     //   // const existingSubBoardIds = existingSubBoards.map((subBoard) => subBoard.id);

//     //   // Create/update sub-board entries
//     //   const updatedSubBoards = subBoard.map((subBoardData) => ({
//     //     id: subBoardData.id, // ID of the sub-board (0 for new sub-boards)
//     //     SubBoardName: subBoardData.name,
//     //     isArchived: subBoardData.isArchived || false,
//     //     boardId: board.id, // Associate the sub-board with the board
//     //   }));

//     //   // Bulk create/update the sub-boards
//     //   await SubBoard.bulkCreate(updatedSubBoards, { updateOnDuplicate: ["id"] });
//     // }

//     if (subBoard && subBoard.length > 0) {
//       // Get the sub-boards associated with the board
//       const existingSubBoards = await SubBoard.findAll({
//         where: { boardId: board.id },
//       });

//       // Map the existing sub-boards to their IDs
//       const existingSubBoardIds = existingSubBoards.map(
//         (subBoard) => subBoard.id
//       );

//       // Filter out the sub-boards to be updated
//       const subBoardsToUpdate = subBoard.filter(
//         (subBoardData) =>
//           subBoardData.id && existingSubBoardIds.includes(subBoardData.id)
//       );

//       // Create/update sub-board entries
//       const updatedSubBoards = subBoard.map((subBoardData) => ({
//         SubBoardName: subBoardData.SubBoardName,
//         isArchived: subBoardData.isArchived || false,
//         boardId: board.id, // Associate the sub-board with the board
//       }));

//       // Bulk create/update the sub-boards
//       await SubBoard.bulkCreate(updatedSubBoards, {
//         updateOnDuplicate: ["id"],
//       });

//       // Update the existing sub-boards
//       await Promise.all(
//         subBoardsToUpdate.map((subBoardData) =>
//           SubBoard.update(
//             {
//               SubBoardName: subBoardData.SubBoardName,
//               isArchived: subBoardData.isArchived || false,
//             },
//             {
//               where: { id: subBoardData.id },
//             }
//           )
//         )
//       );
//     }
//     const allboard = await SubBoard.findAll({
//       where: { boardId: board.id },
//     });
//     return res.status(200).json({
//       message: "Board and sub-board details updated successfully",
//       board,
//       allboard,
//     });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Failed to update board and sub-board details" });
//   }
// };

// export const UpdateBoard = async (req, res) => {
//   const { id } = req.params;
//   const { boardName, boardType, contact, email, website, address, subBoard } =
//     req.body;

//   try {
//     // Find the board by ID
//     const board = await Board.findByPk(id);

//     if (!board) {
//       return res.status(404).json({ message: "Board not found" });
//     }

//     // Update board details
//     board.boardName = boardName;
//     board.boardType = boardType;
//     board.contact = contact;
//     board.email = email;
//     board.website = website;
//     board.address = address;

//     await board.save();

//     // Update sub-board details
//     if (subBoard && subBoard.length > 0) {
//       // Get the sub-boards associated with the board
//       const existingSubBoards = await SubBoard.findAll({
//         where: { boardId: board.id },
//       });

//       // Map the existing sub-boards to their IDs
//       const existingSubBoardIds = existingSubBoards.map(
//         (subBoard) => subBoard.id
//       );

//       // Create/update sub-board entries
//       for (const subBoardData of subBoard) {
//         if (subBoardData.id && existingSubBoardIds.includes(subBoardData.id)) {
//           // Update existing sub-board
//           const existingSubBoard = existingSubBoards.find(
//             (sub) => sub.id === subBoardData.id
//           );
//           existingSubBoard.SubBoardName = subBoardData.SubBoardName;
//           existingSubBoard.isArchived = subBoardData.isArchived || false;
//           await existingSubBoard.save();
//         } else {
//           // Create new sub-board
//           await SubBoard.create({
//             SubBoardName: subBoardData.SubBoardName,
//             isArchived: subBoardData.isArchived || false,
//             boardId: board.id,
//           });
//         }
//       }
//     }

//     const allboard = await SubBoard.findAll({
//       where: { boardId: board.id },
//     });

//     return res.status(200).json({
//       message: "Board and sub-board details updated successfully",
//       board,
//       allboard,
//     });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Failed to update board and sub-board details" });
//   }
// };

// Update board and sub-board details
export const UpdateBoard = async (req, res) => {
  const { id } = req.params;
  const { boardName, boardType, contact, email, website, address, subBoard } =
    req.body;

  try {
    // Find the board by ID
    const board = await Board.findByPk(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Update board details
    board.boardName = boardName;
    board.boardType = boardType;
    board.contact = contact;
    board.email = email;
    board.website = website;
    board.address = address;

    await board.save();

    // Update sub-board details
    if (subBoard && subBoard.length > 0) {
      // Get the sub-boards associated with the board
      const existingSubBoards = await SubBoard.findAll({
        where: { boardId: board.id },
      });

      // Map the existing sub-boards to their IDs
      const existingSubBoardIds = existingSubBoards.map(
        (subBoard) => subBoard.id
      );

      // Filter out the sub-boards to be updated
      const subBoardsToUpdate = subBoard.filter(
        (subBoardData) =>
          subBoardData.id && existingSubBoardIds.includes(subBoardData.id)
      );

      // Create new sub-boards and update existing sub-boards
      const subBoardsToCreateOrUpdate = subBoard.map((subBoardData) => ({
        id: subBoardData.id || null,
        SubBoardName: subBoardData.SubBoardName,
        isArchived: subBoardData.isArchived || false,
        boardId: board.id,
      }));

      // Bulk create/update the sub-boards
      await SubBoard.bulkCreate(subBoardsToCreateOrUpdate, {
        updateOnDuplicate: ["SubBoardName", "isArchived"],
      });

      // Update the existing sub-boards
      await Promise.all(
        subBoardsToUpdate.map((subBoardData) =>
          SubBoard.update(
            {
              SubBoardName: subBoardData.SubBoardName,
              isArchived: subBoardData.isArchived || false,
            },
            {
              where: { id: subBoardData.id },
            }
          )
        )
      );
    }

    const allboard = await SubBoard.findAll({
      where: { boardId: board.id },
    });

    return res.status(200).json({
      message: "Board and sub-board details updated successfully",
      board,
      allboard,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to update board and sub-board details" });
  }
};

export const TogglePublishBoard = async (req, res) => {
  const id = req.params.id;
  const isPublished = req.body.isPublished;

  try {
    const board = await Board.findByPk(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    board.isPublished = isPublished;
    await board.save();

    return res.json({ status: 200, board });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};

export const ToggleArchiveBoard = async (req, res) => {
  const id = req.params.id;
  const isArchived = req.body.isArchived;
  try {
    const board = await Board.findByPk(id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    board.isArchived = isArchived;
    await board.save();
    res.json({ status: 200, board });
  } catch (err) {
    return res.json({ status: 501, error: err.message });
  }
};

export const ToggleArchiveSubBoards = async (req, res) => {
  const boardId = req.params.id;
  const isArchived = req.body.isArchived;
  const subBoardIds = req.body.subBoardIds; // Array of sub-board IDs

  try {
    // Update sub-boards

    if (subBoardIds && subBoardIds.length > 0) {
      await SubBoard.update(
        { isArchived },
        { where: { id: subBoardIds, boardId } }
      );
    }

    return res.json({
      status: 200,
      message: "Sub-boards archived successfully",
    });
  } catch (err) {
    return res.status(501).json({ error: err.message });
  }
};
