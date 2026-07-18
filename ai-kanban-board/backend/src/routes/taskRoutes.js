const express = require("express");
const { listTasks, createTask, updateTask, moveTask, deleteTask, moveToBoard } = require("../controllers/taskController");
const { requireAuth } = require("../middleware/auth");
const requireBoardAccess = require("../middleware/boardAccess");

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireBoardAccess);

router.get("/", listTasks);
router.post("/", createTask);
router.patch("/:taskId", updateTask);
router.patch("/:taskId/move", moveTask);
router.patch("/:taskId/move-to-board", moveToBoard);
router.delete("/:taskId", deleteTask);

module.exports = router;
