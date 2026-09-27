const prisma = require("../config/prisma");

const createActivity = async (req, res) => {
  try {
    const {
      activityTypeId,
      locationId,
      title,
      description,
      date,
      startTime,
      endTime,
      maxParticipants,
    } = req.body;

    const organizerId = req.user.id;

    if (
      !activityTypeId ||
      !locationId ||
      !title ||
      !date ||
      !startTime
    ) {
      return res.status(400).json({
        message:
          "activityTypeId, locationId, title, date, and startTime are required",
      });
    }

    const organizer = await prisma.user.findUnique({
      where: { id: organizerId },
    });

    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found",
      });
    }

    const activityType = await prisma.activityType.findUnique({
      where: { id: activityTypeId },
    });

    if (!activityType) {
      return res.status(404).json({
        message: "Activity type not found",
      });
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    const activity = await prisma.activity.create({
      data: {
        organizerId,
        activityTypeId,
        locationId,
        title,
        description,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        maxParticipants: maxParticipants
          ? Number(maxParticipants)
          : null,
        status: "DRAFT",
      },
    });

    res.status(201).json({
      message: "Activity created successfully",
      activity,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create activity",
    });
  }
};

const getActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        organizer: true,
        activityType: true,
        location: true,
        bookingProof: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(activities);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch activities",
    });
  }
};

const getActivityById = async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
      include: {
        organizer: true,
        activityType: true,
        location: {
          include: {
            facilityDetails: true,
          },
        },
        bookingProof: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    res.json(activity);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch activity",
    });
  }
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
};