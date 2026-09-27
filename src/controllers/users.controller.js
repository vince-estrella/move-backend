const prisma = require("../config/prisma");

const createUser = async (req, res) => {
  try {
    const { name, email, passwordHash, profilePicture, bio } = req.body;

    if (!name || !email || !passwordHash) {
      return res.status(400).json({
        message: "name, email, and passwordHash are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        profilePicture,
        bio,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

module.exports = {
  createUser,
  getUsers,
};