const express = require("express");

const router = express.Router();

const { getDoctorDashboardStats } = require("../controllers/doctorController");

router.get("/dashboard-stats/:doctorId", getDoctorDashboardStats);

module.exports = router;