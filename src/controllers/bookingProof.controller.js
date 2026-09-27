const prisma = require("../config/prisma");

const submitBookingProof = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        message: "fileUrl is required",
      });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        bookingProof: true,
      },
    });

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    if (activity.status !== "DRAFT") {
      return res.status(400).json({
        message: "Only draft activities can submit booking proof",
      });
    }

    if (activity.bookingProof) {
      return res.status(409).json({
        message: "Booking proof has already been submitted",
      });
    }

    const bookingProof = await prisma.bookingProof.create({
      data: {
        activityId,
        fileUrl,
        status: "PENDING",
      },
    });

    await prisma.activity.update({
      where: { id: activityId },
      data: {
        status: "PENDING_VERIFICATION",
      },
    });

    res.status(201).json({
      message: "Booking proof submitted successfully",
      bookingProof,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to submit booking proof",
    });
  }
};

module.exports = {
  submitBookingProof,
};