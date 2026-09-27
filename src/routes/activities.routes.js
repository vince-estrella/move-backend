const express = require("express");

const {
  createActivity,
  getActivities,
  getActivityById,
} = require("../controllers/activities.controller");

const authenticateToken = require("../middleware/auth.middleware");

const router = express.Router();

// Protected: user must be logged in to create an activity
router.post("/", authenticateToken, createActivity);

// Public: anyone can browse activities
router.get("/", getActivities);

router.get("/:activityId", getActivityById);

module.exports = router;