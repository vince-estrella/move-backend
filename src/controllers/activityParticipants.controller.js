const prisma = require("../config/prisma");

const safeUser = {
  select: {
    id: true,
    name: true,
    email: true,
    profilePicture: true,
    bio: true,
  },
};

const joinActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user.id;

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        participants: true,
      },
    });

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    if (activity.status !== "CONFIRMED") {
      return res.status(400).json({
        message: "This activity is not open for joining",
      });
    }

    if (activity.organizerId === userId) {
      return res.status(400).json({
        message: "Organizer cannot join their own activity",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingParticipation =
      await prisma.activityParticipant.findUnique({
        where: {
          activityId_userId: {
            activityId,
            userId,
          },
        },
      });

    if (existingParticipation) {
      return res.status(400).json({
        message: `You already have a ${existingParticipation.status.toLowerCase()} request for this activity`,
      });
    }

    if (activity.maxParticipants) {
      const acceptedCount = activity.participants.filter(
        (participant) => participant.status === "ACCEPTED"
      ).length;

      if (acceptedCount >= activity.maxParticipants) {
        return res.status(400).json({
          message: "This activity is already full",
        });
      }
    }

    const participation =
      await prisma.activityParticipant.create({
        data: {
          activityId,
          userId,
          status: "PENDING",
        },
        include: {
          user: safeUser,
          activity: true,
        },
      });

    res.status(201).json({
      message: "Join request submitted successfully",
      participation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to submit join request",
    });
  }
};

const updateParticipation = async (req, res) => {
  try {
    const { participationId } = req.params;
    const { status } = req.body;
    const organizerId = req.user.id;

    if (!status) {
      return res.status(400).json({
        message: "status is required",
      });
    }

    if (!["ACCEPTED", "DECLINED"].includes(status)) {
      return res.status(400).json({
        message: "status must be ACCEPTED or DECLINED",
      });
    }

    const participation =
      await prisma.activityParticipant.findUnique({
        where: {
          id: participationId,
        },
        include: {
          user: safeUser,
          activity: true,
        },
      });

    if (!participation) {
      return res.status(404).json({
        message: "Participation request not found",
      });
    }

    if (participation.activity.organizerId !== organizerId) {
      return res.status(403).json({
        message: "Only the activity organizer can manage requests",
      });
    }

    if (participation.status !== "PENDING") {
      return res.status(400).json({
        message: "This request has already been processed",
      });
    }

    if (status === "ACCEPTED") {
      const acceptedCount =
        await prisma.activityParticipant.count({
          where: {
            activityId: participation.activityId,
            status: "ACCEPTED",
          },
        });

      if (
        participation.activity.maxParticipants &&
        acceptedCount >= participation.activity.maxParticipants
      ) {
        return res.status(400).json({
          message: "This activity is already full",
        });
      }
    }

    const updatedParticipation =
      await prisma.activityParticipant.update({
        where: {
          id: participationId,
        },
        data: {
          status,
          joinedAt:
            status === "ACCEPTED" ? new Date() : null,
        },
        include: {
          user: safeUser,
          activity: true,
        },
      });

    res.json({
      message:
        status === "ACCEPTED"
          ? "Participant accepted successfully"
          : "Participant declined successfully",
      participation: updatedParticipation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update participation",
    });
  }
};

const getActivityParticipants = async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
    });

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    const participants =
      await prisma.activityParticipant.findMany({
        where: {
          activityId,
        },
        include: {
          user: safeUser,
        },
        orderBy: {
          joinedAt: "asc",
        },
      });

    res.json(participants);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch activity participants",
    });
  }
};

module.exports = {
  joinActivity,
  updateParticipation,
  getActivityParticipants,
};