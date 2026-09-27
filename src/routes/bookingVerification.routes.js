const express = require("express");

const {
  approveBookingProof,
  rejectBookingProof,
} = require("../controllers/bookingVerification.controller");

const router = express.Router();

router.post(
  "/booking-proofs/:proofId/approve",
  approveBookingProof
);

router.post(
  "/booking-proofs/:proofId/reject",
  rejectBookingProof
);

module.exports = router;