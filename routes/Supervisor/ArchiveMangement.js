const express = require("express");
const router = express.Router();
const ArchiveManagmentController = require("../../controller/Supervisor/Archive");

router.get("/archivedsubjects", ArchiveManagmentController.getAllArchivedSubjects);
router.get("/archivedlevels", ArchiveManagmentController.getAllArchivedLevels);
module.exports = router;