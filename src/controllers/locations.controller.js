const prisma = require("../config/prisma");

const getLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        facilityDetails: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch locations",
    });
  }
};

const getLocationById = async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        facilityDetails: true,
        activities: true,
      },
    });

    if (!location) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    res.json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch location",
    });
  }
};

module.exports = {
  getLocations,
  getLocationById,
};