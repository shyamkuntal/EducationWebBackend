const CONSTANTS = require("../../constants/constants.js");
const httpStatus = require("http-status");
const { createSheetSchema } = require("../../validations/SheetManagementValidations.js");
const { SheetManagement } = require("../../models/SheetManagement.js");
const db = require("../../config/database");
const { SheetManagementPaperNoMapping } = require("../../models/SheetManagementPaperNoMapping.js");
const { findBookByBookId } = require("../../services/bookTaskService.js");
const { SheetManagementBookMapping } = require("../../models/SheetManagementBookMapping.js");

const SheetManagementController = {

  async createSheet(req, res, next) {
    const t = await db.transaction();
    try {
      let values = await createSheetSchema.validateAsync(req.body);

      let sheet = await SheetManagement.create(values, {
        transaction: t,
      });

      const mappingEntries = [];
      if(values.sheetType === "Books"){
        let bookMapping = await SheetManagementBookMapping.create(
          {
            sheetManagementId: sheet.id,
            bookId: values.bookId,
            chapterNo: values.chapterNo,
            chapterName: values.chapterName,
            startPageNo: values.startPageNo,
            endPageNo: values.endPageNo,
          },{
          transaction: t,
        });
        console.log("bookMapping", bookMapping)
      }

      if(values.sheetType === "Top School" || values.sheetType === "Past Paper"){
        let paperNumbers = values.paperNumber
        for (let item of paperNumbers) {
          const mapping = await SheetManagementPaperNoMapping.create({
            sheetManagementId: sheet.id,
            paperNoId: item,
          }, {
            transaction: t,
          });
          mappingEntries.push(mapping);
        }
      }

      await t.commit();
      res.status(httpStatus.OK).send({sheet, mappingEntries});
    } catch (err) {
      console.log(err)
      await t.rollback();
      next(err);
    }
  },

  async FindBookByBookId(req, res, next){
    const id = req.query.bookId
    try {
      const book = await findBookByBookId(id)
      res.status(httpStatus.OK).send(book);
    } catch (err) {
      next(err)
    }
  },
};

module.exports = SheetManagementController;
