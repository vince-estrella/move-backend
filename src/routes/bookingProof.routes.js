const express = require("express");

const {
  submitBookingProof,
} = require("../controllers/bookingProof.controller");

const router = express.Router();

router.post(
  "/activities/:activityId/booking-proof",
  submitBookingProof
);

module.exports = router;