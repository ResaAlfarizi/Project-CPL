const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const kelasRoutes = require("./kelasRoutes");
const enrollmentRoutes = require("./enrollmentRoutes");
const nilaiRoutes = require("./nilaiRoutes");
const capaianRoutes = require("./capaianRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const prodiRoutes = require("./prodiRoutes");
const cplRoutes = require("./cplRoutes");
const mkCplRoutes = require("./mkCplRoutes");
const subCpmkRoutes = require("./subCpmkRoutes");
const authAuditLogRoutes = require("./authAuditLogRoutes");
const dosenProfileRoutes = require("./dosenProfileRoutes");
const mahasiswaProfileRoutes = require("./mahasiswaProfileRoutes");

// grouping routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/kelas", kelasRoutes);
router.use("/enrollment", enrollmentRoutes);
router.use("/nilai", nilaiRoutes);
router.use("/capaian", capaianRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/prodi", prodiRoutes);
router.use("/cpl", cplRoutes);
router.use("/mk-cpl", mkCplRoutes);
router.use("/sub-cpmk", subCpmkRoutes);
router.use("/auth-audit-log", authAuditLogRoutes);
router.use("/profile", dosenProfileRoutes);
router.use("/profile", mahasiswaProfileRoutes);

module.exports = router;