const prisma = require("../config/prisma");

const createInvitation = async (req, res) => {
  try {
    const { activityId, senderId, receiverId } = req.body;

    if (!activityId || !senderId || !receiverId) {
      return res.status(400).json({
        message: "activityId, senderId, and receiverId are required",
      });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    if (activity.organizerId !== senderId) {
      return res.status(403).json({
        message: "Only the activity organizer can send invitations",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        message: "Organizer cannot invite themselves",
      });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    const existingInvitation = await prisma.invitation.findUnique({
      where: {
        activityId_receiverId: {
          activityId,
          receiverId,
        },
      },
    });

    if (existingInvitation) {
      return res.status(400).json({
        message: "This user has already been invited to this activity",
      });
    }

    const invitation = await prisma.invitation.create({
      data: {
        activityId,
        senderId,
        receiverId,
        status: "PENDING",
      },
      include: {
        activity: true,
        sender: true,
        receiver: true,
      },
    });

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to send invitation",
    });
  }
};

const getReceivedInvitations = async (req, res) => {
  try {
    const { userId } = req.params;

    const invitations = await prisma.invitation.findMany({
      where: {
        receiverId: userId,
      },
      include: {
        activity: {
          include: {
            activityType: true,
            location: true,
          },
        },
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(invitations);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch invitations",
    });
  }
};

const updateInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { status, userId } = req.body;

    if (!status || !userId) {
      return res.status(400).json({
        message: "status and userId are required",
      });
    }

    if (!["ACCEPTED", "DECLINED"].includes(status)) {
      return res.status(400).json({
        message: "status must be ACCEPTED or DECLINED",
      });
    }

    const invitation = await prisma.invitation.findUnique({
      where: {
        id: invitationId,
      },
      include: {
        activity: true,
      },
    });

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    if (invitation.receiverId !== userId) {
      return res.status(403).json({
        message: "Only the invited user can respond to this invitation",
      });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({
        message: "This invitation has already been processed",
      });
    }

    // DECLINE
    if (status === "DECLINED") {
      const updatedInvitation = await prisma.invitation.update({
        where: {
          id: invitationId,
        },
        data: {
          status: "DECLINED",
        },
      });

      return res.json({
        message: "Invitation declined successfully",
        invitation: updatedInvitation,
        participation: null,
      });
    }

    // ACCEPT
    const acceptedCount = await prisma.activityParticipant.count({
      where: {
        activityId: invitation.activityId,
        status: "ACCEPTED",
      },
    });

    if (
      invitation.activity.maxParticipants &&
      acceptedCount >= invitation.activity.maxParticipants
    ) {
      return res.status(400).json({
        message: "This activity is already full",
      });
    }

    const updatedInvitation = await prisma.invitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    let participation =
      await prisma.activityParticipant.findUnique({
        where: {
          activityId_userId: {
            activityId: invitation.activityId,
            userId,
          },
        },
      });

    if (!participation) {
      participation =
        await prisma.activityParticipant.create({
          data: {
            activityId: invitation.activityId,
            userId,
            status: "ACCEPTED",
            joinedAt: new Date(),
          },
        });
    } else {
      participation =
        await prisma.activityParticipant.update({
          where: {
            id: participation.id,
          },
          data: {
            status: "ACCEPTED",
            joinedAt: new Date(),
          },
        });
    }

    res.json({
      message: "Invitation accepted successfully",
      invitation: updatedInvitation,
      participation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update invitation",
    });
  }
};

module.exports = {
  createInvitation,
  getReceivedInvitations,
  updateInvitation,
};