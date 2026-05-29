const express = require("express");

const router = express.Router();

const {

  uploadReport,
  submitPrescription,

} = require("../controllers/reportController");

router.post("/", uploadReport);

router.patch("/submit/:id", submitPrescription);

module.exports = router;