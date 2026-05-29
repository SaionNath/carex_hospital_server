const express = require("express");

const router = express.Router();

const {
  bookAmbulance,
  getBookings,
  updateBookingStatus,
  trackAmbulance,
  acceptBooking,
  completeTrip,
} = require("../controllers/ambulanceController");

router.post("/", bookAmbulance);

router.get("/", getBookings);

router.patch("/:id", updateBookingStatus);

router.patch("/accept/:id", acceptBooking);

router.patch("/complete/:id", completeTrip);

router.get("/track/:phone", trackAmbulance);

module.exports = router;