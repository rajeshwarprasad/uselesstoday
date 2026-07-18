const express = require("express");
const {
    listBoards,
    createBoard,
    getBoard,
    updateBoard,
    deleteBoard,
    getActivity,
    addMember,
    removeMember,
} = require("../controllers/boardController");
const { requireAuth } = require("../middleware/auth");
const requireBoardAccess = require("../middleware/boardAccess");
const columnRoutes = require("./columnRoutes");
const taskRoutes = require("./taskRoutes");
const aiRoutes = require("./aiRoutes");
const { generateInvite, listInvites, deleteInvite } = require("../controllers/inviteController");

const router = express.Router();

router.use(requireAuth);

router.get("/", listBoards);
router.post("/", createBoard);

router.get("/:boardId", requireBoardAccess, getBoard);
router.put("/:boardId", requireBoardAccess, updateBoard);
router.patch("/:boardId", requireBoardAccess, updateBoard);
router.delete("/:boardId", requireBoardAccess, deleteBoard);

router.get("/:boardId/activity", requireBoardAccess, getActivity);
router.post("/:boardId/members", requireBoardAccess, addMember);
router.delete("/:boardId/members/:userId", requireBoardAccess, removeMember);

router.use("/:boardId/columns", requireBoardAccess, columnRoutes);

router.use("/:boardId/tasks", requireBoardAccess, taskRoutes);

router.use("/:boardId", aiRoutes);

router.post("/:boardId/invites", requireBoardAccess, generateInvite);
router.get("/:boardId/invites", requireBoardAccess, listInvites);
router.delete("/:boardId/invites/:inviteId", requireBoardAccess, deleteInvite);

module.exports = router;
