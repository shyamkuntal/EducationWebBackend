import { Sequelize } from "sequelize";
import { Board, SubBoard } from "../../models/Board.js";
import { Sheet } from "../../models/Sheet.js";
import { roleNames } from "../../constants/constants.js";
import { Subject, SubjectLevel } from "../../models/Subject.js";
import { services } from "../../services/index.js";
import {
  assignUploderUserToSheetSchema,
  assignReviewerUserToSheetSchema,
} from "../../validations/PPMSupervisorValidations.js";
import { sheetStatuses, sheetLogsMessages } from "../../constants/constants.js";
import httpStatus from "http-status";

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
      supervisorId,
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
      supervisorId,
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

export const AssignSheetToPastPaper = async (req, res) => {
  try {
    let values = await assignUploderUserToSheetSchema.validateAsync(req.body);

    let user = await services.userService.checkUserRole(
      values.uploaderUserId,
      roleNames.PastPaper
    );
    let userData = user[0];

    let sheetData = await services.sheetService.findSheetAndUser(
      values.sheetId
    );

    let responseMessage = {
      assinedUserToSheet: "",
      UpdateSheetStatus: "",
      sheetLog: "",
    };

    if (userData && sheetData) {
      // Checking if sheet is already assigned to past paper uploader

      if (sheetData.assignedToUserId === userData.id) {
        res
          .status(httpStatus.OK)
          .send("sheet already assigned to past paper uploader");
      } else {
        //UPDATE sheet assignment & life cycle & sheet status

        let sheetStatusToBeUpdated = {
          statusForSupervisor: sheetStatuses.NotStarted,
          statusForPastPaper: sheetStatuses.NotStarted,
          statusForReviewer: null,
        };

        let updateAssignAndUpdateLifeCycle =
          await services.sheetService.assignUserToSheetAndUpdateLifeCycleAndStatuses(
            sheetData.id,
            userData.id,
            roleNames.PastPaper,
            sheetStatusToBeUpdated.statusForSupervisor,
            sheetStatusToBeUpdated.statusForPastPaper
          );

        if (updateAssignAndUpdateLifeCycle.length > 0) {
          responseMessage.assinedUserToSheet =
            "Sheet assigned to past paper and lifeCycle updated successfully";
          responseMessage.UpdateSheetStatus =
            "Sheet Statuses updated successfully";
        }

        // CREATE sheet log for sheet assignment to past paper uploader

        let createLog = await services.sheetService.createSheetLog(
          sheetData.id,
          sheetData.supervisor.Name,
          userData.Name,
          sheetLogsMessages.supervisorAssignToPastPaper
        );

        if (createLog) {
          responseMessage.sheetLog =
            "Log record for assignment to uploader added successfully";
        }

        res.status(httpStatus.OK).send(responseMessage);
      }
    } else {
      res.status(httpStatus.BAD_REQUEST).send("Wrong user Id or Sheet Id");
    }
  } catch (err) {
    console.log(err);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
  }
};

export const AssignSheetToReviewer = async (req, res) => {
  try {
    let values = await assignReviewerUserToSheetSchema.validateAsync(req.body);

    let user = await services.userService.checkUserRole(
      values.reviewerUserId,
      roleNames.Reviewer
    );
    let userData = user[0];

    let sheetData = await services.sheetService.findSheetAndUser(
      values.sheetId
    );

    let responseMessage = {
      assinedUserToSheet: "",
      UpdateSheetStatus: "",
      sheetLog: "",
    };

    if (userData && sheetData) {
      // Checking if sheet is already assigned to past paper uploader

      if (sheetData.assignedToUserId === userData.id) {
        res.status(httpStatus.OK).send("sheet already assigned to reviewer");
      } else {
        //UPDATE sheet assignment & life cycle & sheet status
        let sheetStatusToBeUpdated = {
          statusForSupervisor: sheetStatuses.NotStarted,
          statusForReviewer: sheetStatuses.NotStarted,
        };

        let updateAssignAndUpdateLifeCycle =
          await services.sheetService.assignUserToSheetAndUpdateLifeCycleAndStatuses(
            sheetData.id,
            userData.id,
            roleNames.Reviewer,
            sheetStatusToBeUpdated.statusForSupervisor,
            sheetStatusToBeUpdated.statusForReviewer
          );

        if (updateAssignAndUpdateLifeCycle.length > 0) {
          responseMessage.assinedUserToSheet =
            "Sheet assigned to past paper and lifeCycle updated successfully";
          responseMessage.UpdateSheetStatus =
            "Sheet Statuses updated successfully";
        }

        // CREATE sheet log for sheet assignment to past paper uploader
        let createLog = await services.sheetService.createSheetLog(
          sheetData.id,
          sheetData.supervisor.Name,
          userData.Name,
          sheetLogsMessages.supervisorAssignToReviewer
        );

        if (createLog) {
          responseMessage.sheetLog =
            "Log record for assignment to uploader added successfully";
        }

        res.status(httpStatus.OK).send(responseMessage);
      }
    } else {
      res.status(httpStatus.BAD_REQUEST).send("Wrong user Id or Sheet Id");
    }
  } catch (err) {
    console.log(err);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
  }
};
