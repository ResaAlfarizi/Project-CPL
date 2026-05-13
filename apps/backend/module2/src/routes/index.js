const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

// grouping routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

module.exports = router;