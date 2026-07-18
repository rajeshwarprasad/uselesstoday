const express = require("express");
const { getInvite, acceptInvite } = require("../controllers/inviteController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/invite/:token", getInvite);
router.post("/invite/:token/accept", requireAuth, acceptInvite);

module.exports = router;
