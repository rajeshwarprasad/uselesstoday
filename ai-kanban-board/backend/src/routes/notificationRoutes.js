const express = require("express");
const { getNotifications, markRead, markAllRead, checkDueDates } = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/notifications", getNotifications);
router.post("/notifications/check", checkDueDates);
router.patch("/notifications/:id/read", markRead);
router.patch("/notifications/read-all", markAllRead);

module.exports = router;
