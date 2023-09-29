const express = require("express");
const router = express.Router();
const ArchiveManagmentController = require("../../controller/Supervisor/Archive");

router.get("/count", ArchiveManagmentController.getAllArchivedCount);

router.get("/archivedsubjects", ArchiveManagmentController.getAllArchivedSubjects);
router.patch("/unarchivesubject", ArchiveManagmentController.unArchiveSubject);

router.get("/archivedlevels", ArchiveManagmentController.getAllArchivedLevels);
router.patch("/unarchivelevel", ArchiveManagmentController.unArchiveSubjectLevel);

router.get("/archivedtopics", ArchiveManagmentController.getAllArchivedTopics);
router.patch("/unarchivetopic", ArchiveManagmentController.unArchiveTopic);

router.get("/archivedsubtopics", ArchiveManagmentController.getAllArchivedSubTopics);
router.patch("/unarchivesubtopic", ArchiveManagmentController.unArchiveSubTopic);

router.get("/archivedvocabs", ArchiveManagmentController.getAllArchivedVocabs);
router.patch("/unarchivevocab", ArchiveManagmentController.unArchiveVocab);

router.get("/archivedpnos", ArchiveManagmentController.getAllPaperNos);
router.patch("/unarchivepno", ArchiveManagmentController.unArchivePaperNo);

router.get("/archivedbooks", ArchiveManagmentController.getAllBooks);
router.patch("/unarchivebook", ArchiveManagmentController.unArchiveBook);

router.get("/archivedpastpapersubjects", ArchiveManagmentController.getSubjects);
router.post("/archivedpastpapers", ArchiveManagmentController.getArchivedPastPaperBySubjectId);
router.patch("/unarchivepastpaper", ArchiveManagmentController.unArchivePastPaper);

router.get("/archivedsheetsubjects", ArchiveManagmentController.getSubjects);
router.post("/archivedsheets", ArchiveManagmentController.getArchivedSheetsBySubjectId);
router.patch("/unarchivesheet", ArchiveManagmentController.unArchiveSheet);

router.get("/archivedtasks", ArchiveManagmentController.getAllTasks);
router.patch("/unarchivetask", ArchiveManagmentController.unArchiveTask);

module.exports = router;