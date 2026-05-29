const express = require("express");

const router = express.Router();

const {
  getReceptionistDashboardStats,
} = require("../controllers/receptionistController");

router.get("/dashboard-stats/:receptionistId", getReceptionistDashboardStats);

module.exports = router;