const express = require("express");

const {
  joinActivity,
  updateParticipation,
  getActivityParticipants,
} = require("../controllers/activityParticipants.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Logged-in users can request to join
router.post("/:activityId/join", authenticateToken, joinActivity);

// Only authenticated users can manage participation
router.patch("/:participationId", authenticateToken, updateParticipation);

// Only authenticated users can view participants
router.get("/activity/:activityId", authenticateToken, getActivityParticipants);

module.exports = router;