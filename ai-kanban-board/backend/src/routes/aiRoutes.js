const express = require("express");
const { generateTasks, breakdownTask, summarizeBoard } = require("../controllers/aiController");
const { requireAuth } = require("../middleware/auth");
const requireBoardAccess = require("../middleware/boardAccess");

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireBoardAccess);

router.post("/ai/generate-tasks", generateTasks);
router.post("/ai/breakdown", breakdownTask);
router.post("/ai/summary", summarizeBoard);

module.exports = router;
