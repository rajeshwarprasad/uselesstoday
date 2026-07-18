const express = require("express");
const { createColumn, updateColumn, deleteColumn } = require("../controllers/columnController");
const { requireAuth } = require("../middleware/auth");
const requireBoardAccess = require("../middleware/boardAccess");

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireBoardAccess);

router.post("/", createColumn);
router.put("/:columnId", updateColumn);
router.patch("/:columnId", updateColumn);
router.delete("/:columnId", deleteColumn);

module.exports = router;
