require("dotenv/config");

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Seeding MOVE database...");

  // ─────────────────────────────────────────
  // ACTIVITY TYPES
  // ─────────────────────────────────────────

  const activityTypes = [
    "Basketball",
    "Badminton",
    "Volleyball",
    "Tennis",
    "Pickleball",
    "Hiking",
    "Running",
    "Cycling",
  ];

  for (const name of activityTypes) {
    await prisma.activityType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // ─────────────────────────────────────────
  // LOCATIONS
  // ─────────────────────────────────────────

  const basketballCourt = await prisma.location.create({
    data: {
      name: "MOVE Sample Sports Center",
      description: "Sample sports facility for MOVE development.",
      address: "Cebu City, Cebu",
      latitude: 10.3157,
      longitude: 123.8854,
      type: "FACILITY",

      facilityDetails: {
        create: {
          bookingUrl: "https://example.com/book",
          rates: "₱500/hour",
          amenities: "Parking, Restrooms, Drinking Water",
          contactInfo: "Sample facility contact",
        },
      },
    },
  });

  const badmintonCourt = await prisma.location.create({
    data: {
      name: "MOVE Sample Badminton Center",
      description: "Sample badminton facility for MOVE development.",
      address: "Cebu City, Cebu",
      latitude: 10.3165,
      longitude: 123.8848,
      type: "FACILITY",

      facilityDetails: {
        create: {
          bookingUrl: "https://example.com/book",
          rates: "₱300/hour",
          amenities: "Parking, Restrooms",
          contactInfo: "Sample facility contact",
        },
      },
    },
  });

  await prisma.location.create({
    data: {
      name: "MOVE Sample Hiking Trail",
      description: "Sample outdoor location for MOVE development.",
      address: "Cebu City, Cebu",
      latitude: 10.35,
      longitude: 123.88,
      type: "OUTDOOR",
    },
  });

  await prisma.location.create({
    data: {
      name: "MOVE Sample Running Route",
      description: "Sample outdoor running location for MOVE development.",
      address: "Cebu City, Cebu",
      latitude: 10.32,
      longitude: 123.89,
      type: "OUTDOOR",
    },
  });

  console.log("Seed completed!");
  console.log("Created facilities:", basketballCourt.name, badmintonCourt.name);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });