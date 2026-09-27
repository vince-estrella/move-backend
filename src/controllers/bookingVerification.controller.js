const prisma = require("../config/prisma");

const approveBookingProof = async (req, res) => {
  try {
    const { proofId } = req.params;

    const bookingProof = await prisma.bookingProof.findUnique({
      where: { id: proofId },
    });

    if (!bookingProof) {
      return res.status(404).json({
        message: "Booking proof not found",
      });
    }

    if (bookingProof.status !== "PENDING") {
      return res.status(400).json({
        message: "Booking proof has already been reviewed",
      });
    }

    const updatedProof = await prisma.bookingProof.update({
      where: { id: proofId },
      data: {
        status: "APPROVED",
        verifiedAt: new Date(),
      },
    });

    const updatedActivity = await prisma.activity.update({
      where: { id: bookingProof.activityId },
      data: {
        status: "CONFIRMED",
      },
    });

    res.json({
      message: "Booking proof approved successfully",
      bookingProof: updatedProof,
      activity: updatedActivity,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to approve booking proof",
    });
  }
};

const rejectBookingProof = async (req, res) => {
  try {
    const { proofId } = req.params;

    const bookingProof = await prisma.bookingProof.findUnique({
      where: { id: proofId },
    });

    if (!bookingProof) {
      return res.status(404).json({
        message: "Booking proof not found",
      });
    }

    if (bookingProof.status !== "PENDING") {
      return res.status(400).json({
        message: "Booking proof has already been reviewed",
      });
    }

    const updatedProof = await prisma.bookingProof.update({
      where: { id: proofId },
      data: {
        status: "REJECTED",
        verifiedAt: new Date(),
      },
    });

    const updatedActivity = await prisma.activity.update({
      where: { id: bookingProof.activityId },
      data: {
        status: "REJECTED",
      },
    });

    res.json({
      message: "Booking proof rejected",
      bookingProof: updatedProof,
      activity: updatedActivity,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to reject booking proof",
    });
  }
};

module.exports = {
  approveBookingProof,
  rejectBookingProof,
};