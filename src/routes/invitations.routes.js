const express = require("express");

const {
  createInvitation,
  getReceivedInvitations,
  updateInvitation,
} = require("../controllers/invitations.controller");

const router = express.Router();

router.post("/", createInvitation);

router.get("/received/:userId", getReceivedInvitations);

router.patch("/:invitationId", updateInvitation);

module.exports = router;