const { Op } = require("sequelize");
const constants = require("../constants/constants.js");
const { Board, SubBoard } = require("../models/Board.js");
const { PastPaper } = require("../models/PastPaper.js");
const { Sheet } = require("../models/PastPaperSheet.js");
const { SubjectLevel, subjectName, Subject } = require("../models/Subject.js");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("../config/s3.js");
const { Variant } = require("../models/Variants.js");

const paginatedPastPaperResults = (model, req) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    let subjectNameFilter = req.query.subjectNameId;

    const filtersForSheet = {};

    if (req.query.isPublished) {
      filtersForSheet.isPublished = req.query.isPublished;
    }
    if (req.query.isArchived) {
      filtersForSheet.isArchived = req.query.isArchived;
    }
    if (req.query.isSpam) {
      filtersForSheet.isSpam = req.query.isSpam;
    }
    if (req.query.boardId) {
      filtersForSheet.boardId = req.query.boardId;
    }
    if (req.query.subBoardId) {
      let query = "";

      if (typeof req.query.subBoardId === "string") {
        query = req.query.subBoardId;
      }

      if (typeof req.query.subBoardId === "object") {
        query = { [Op.in]: req.query.subBoardId };
      }
      filtersForSheet.subBoardId = query;
    }
    if (req.query.grade) {
      filtersForSheet.grade = req.query.grade;
    }

    if (req.query.subjectLevelId) {
      let query = "";

      if (typeof req.query.subjectLevelId === "string") {
        query = req.query.subjectLevelId;
      }

      if (typeof req.query.subjectLevelId === "object") {
        query = { [Op.in]: req.query.subjectLevelId };
      }

      filtersForSheet.subjectLevelId = query;
    }

    if (req.query.year) {
      let query = "";
      if (typeof req.query.year === "string") {
        query = req.query.year;
      }

      if (typeof req.query.year === "object") {
        query = { [Op.in]: req.query.year };
      }
      filtersForSheet.year = query;
    }

    if (req.query.season) {
      let query = "";
      if (typeof req.query.season === "string") {
        query = req.query.season;
      }

      if (typeof req.query.season === "object") {
        query = { [Op.in]: req.query.season };
      }

      filtersForSheet.season = query;
    }

    if (req.query.varientId) {
      let query = "";
      if (typeof req.query.varientId === "string") {
        query = req.query.varientId;
      }

      if (typeof req.query.varientId === "object") {
        query = { [Op.in]: req.query.varientId };
      }
      filtersForSheet.variantId = query;
    }

    if (req.query.paperNumberId) {
      let query = "";
      if (typeof req.query.paperNumberId === "string") {
        query = req.query.paperNumberId;
      }

      if (typeof req.query.paperNumberId === "object") {
        query = { [Op.in]: req.query.paperNumberId };
      }

      filtersForSheet.paperNumberId = query;
    }

    if (req.query.time === "last6Months") {
      filtersForSheet.createdAt = {
        [Op.gte]: today,
      };
    }

    if (req.query.time === "lastYear") {
      filtersForSheet.createdAt = {
        [Op.gte]: today,
      };
    }

    console.log(filtersForSheet);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    const count = await PastPaper.count();
    if (endIndex < count) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0 && count > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    try {
      const pastPapers = await PastPaper.findAll({
        include: [
          {
            model: Sheet,
            attributes: [
              "id",
              "boardId",
              "subBoardId",
              "grade",
              "subjectId",
              "subjectLevelId",
              "variantId",
              "year",
              "season",
              "varient",
              "paperNumber",
              "resources",
              "isPublished",
              "isArchived",
            ],
            where: filtersForSheet,
          },
        ],
        limit,
        offset: startIndex,
        raw: true,
        nest: true,
      });

      let pastPapersWithSubjects = [];

      // Filter for SubjectName
      if (subjectNameFilter?.length > 0) {
        for (let i = 0; i < pastPapers.length; i++) {
          let fetchSheet = await Sheet.findOne({
            where: {
              subjectId: pastPapers[i].PastPaperSheet.subjectId,
              subjectLevelId: pastPapers[i].PastPaperSheet.subjectLevelId,
              variantId: pastPapers[i].PastPaperSheet.variantId,
            },
            include: [
              {
                model: Subject,
                where: { subjectNameId: subjectNameFilter },
                attributes: ["id", "subjectNameId"],
              },
              {
                model: SubjectLevel,
                attributes: ["id", "subjectLevelName", "isArchived"],
              },
              {
                model: Variant,
                attributes: ["id", "name"],
              },
            ],
            raw: true,
            nest: true,
          });

          let fetchSubject;
          if (fetchSheet !== null) {
            fetchSubject = await Subject.findOne({
              where: {
                subjectNameId: fetchSheet.subject.subjectNameId,
              },
              include: [{ model: subjectName, attrubutes: [] }],
              raw: true,
              nest: true,
            });

            // fetch Signed urls for pastPapers

            const getImageBannerObjectParams = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: pastPapers[i].imagebanner,
            };

            const getImageBannerCommand = new GetObjectCommand(getImageBannerObjectParams);

            const imageBannerUrl = await getSignedUrl(s3Client, getImageBannerCommand, {
              expiresIn: 3600,
            });

            const getQuesPaperObjectParams = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: pastPapers[i].questionPdf,
            };

            const getQuesPaperCommand = new GetObjectCommand(getQuesPaperObjectParams);

            const quesPaperUrl = await getSignedUrl(s3Client, getQuesPaperCommand, {
              expiresIn: 3600,
            });

            const getAnsPaperObjectParams = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: pastPapers[i].answerPdf,
            };

            const getAnsPaperCommand = new GetObjectCommand(getAnsPaperObjectParams);

            const ansPaperUrl = await getSignedUrl(s3Client, getAnsPaperCommand, {
              expiresIn: 3600,
            });
            pastPapersWithSubjects.push({
              ...pastPapers[i],
              subject: fetchSubject,
              subjectLevel: fetchSheet.subjectLevel,
              variant: fetchSheet.variant,
              files: {
                imageBannerUrl: imageBannerUrl,
                quesPaperUrl: quesPaperUrl,
                ansPaperUrl: ansPaperUrl,
              },
            });
          }
        }
      } else {
        for (let i = 0; i < pastPapers.length; i++) {
          let fetchSheetWithoutSubjectName = await Sheet.findOne({
            where: {
              subjectId: pastPapers[i].PastPaperSheet.subjectId,
              subjectLevelId: pastPapers[i].PastPaperSheet.subjectLevelId,
              variantId: pastPapers[i].PastPaperSheet.variantId,
            },
            include: [
              {
                model: Subject,
                attributes: ["id", "subjectNameId"],
              },
              {
                model: SubjectLevel,
                attributes: ["id", "subjectLevelName", "isArchived"],
              },
              {
                model: Variant,
                attributes: ["id", "name"],
              },
            ],

            raw: true,
            nest: true,
          });

          let fetchSubject = await Subject.findOne({
            where: { id: fetchSheetWithoutSubjectName.subject.id },
            attributes: ["id", "boardId", "subBoardId", "grade"],
            include: [
              {
                model: subjectName,
                attrubutes: ["id", "SubjectName", "subjectImage"],
              },
            ],
            raw: true,
            nest: true,
          });

          // fetch Signed urls for pastPapers

          const getImageBannerObjectParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: pastPapers[i].imagebanner,
          };

          const getImageBannerCommand = new GetObjectCommand(getImageBannerObjectParams);

          const imageBannerUrl = await getSignedUrl(s3Client, getImageBannerCommand, {
            expiresIn: 3600,
          });

          const getQuesPaperObjectParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: pastPapers[i].questionPdf,
          };

          const getQuesPaperCommand = new GetObjectCommand(getQuesPaperObjectParams);

          const quesPaperUrl = await getSignedUrl(s3Client, getQuesPaperCommand, {
            expiresIn: 3600,
          });

          const getAnsPaperObjectParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: pastPapers[i].answerPdf,
          };

          const getAnsPaperCommand = new GetObjectCommand(getAnsPaperObjectParams);

          const ansPaperUrl = await getSignedUrl(s3Client, getAnsPaperCommand, {
            expiresIn: 3600,
          });

          pastPapersWithSubjects.push({
            ...pastPapers[i],
            subject: fetchSubject,
            subjectLevel: fetchSheetWithoutSubjectName.subjectLevel,
            variant: fetchSheetWithoutSubjectName.variant,
            files: {
              imageBannerUrl: imageBannerUrl,
              quesPaperUrl: quesPaperUrl,
              ansPaperUrl: ansPaperUrl,
            },
          });
        }
      }

      results.results = pastPapersWithSubjects;
      res.paginatedResults = results;
      next();
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 501, error: err.message });
    }
  };
};

module.exports = paginatedPastPaperResults;
