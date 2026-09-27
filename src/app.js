const authRoutes = require("./routes/auth.routes");
const express = require("express");
const cors = require("cors");

const usersRoutes = require("./routes/users.routes");
const activitiesRoutes = require("./routes/activities.routes");
const bookingProofRoutes = require("./routes/bookingProof.routes");
const bookingVerificationRoutes = require("./routes/bookingVerification.routes");
const activityParticipantsRoutes = require("./routes/activityParticipants.routes");
const locationsRoutes = require("./routes/locations.routes");
const invitationsRoutes = require("./routes/invitations.routes");
const authenticateToken = require("./middleware/auth.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api", bookingProofRoutes);
app.use("/api", bookingVerificationRoutes);
app.use("/api/activity-participants", activityParticipantsRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/invitations", invitationsRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "MOVE API",
  });
});
app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({
    message: "Authentication successful",
    userId: req.user.id,
  });
});

module.exports = app;