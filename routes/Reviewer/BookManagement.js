const express = require("express");
const paginatedBookTasks = require("../../middlewares/paginatedBookTask");

const router = express.Router();

router.get("/getallpaginatedbooktask", paginatedBookTasks(), (req, res) => {
  res.json(res.paginatedResults);
});

module.exports = router;