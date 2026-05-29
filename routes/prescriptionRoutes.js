const express = require("express");

const router = express.Router();

const {
  createPrescription,
  getPrescriptions,
  updatePatientStatus,
  completeTreatmentDay,
  getPatientPrescriptions,
} = require("../controllers/prescriptionController");

router.get("/nurse/:nurseId", async (req, res) => {
  try {
    const db = req.app.locals.db;

    const prescriptionsCollection = db.collection("prescriptions");

    const nurseId = req.params.nurseId;

    const prescriptions = await prescriptionsCollection
      .find({
        assignedNurseId: nurseId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(prescriptions);
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Prescriptions",
    });
  }
});

router.patch("/complete-day/:id/:day", completeTreatmentDay);

router.post("/", createPrescription);

router.get("/", getPrescriptions);

router.patch("/status/:id", updatePatientStatus);

/*
|--------------------------------------------------------------------------
| GET PRESCRIPTIONS FOR PATIENT
|--------------------------------------------------------------------------
*/

router.get("/patient/:patientId", getPatientPrescriptions);

module.exports = router;