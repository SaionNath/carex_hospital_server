const express = require("express");

const router = express.Router();

const {
  createBill,
  getBills,
  markPaymentReceived,
} = require("../controllers/billingController");

router.post("/", createBill);

router.get("/", getBills);

/*
|--------------------------------------------------------------------------
| GET MY BILL (PATIENT)
|--------------------------------------------------------------------------
*/

router.get("/my-bill/:patientId", async (req, res) => {
  try {
    const db = req.app.locals.db;

    const patientsCollection = db.collection("patients");

    const prescriptionsCollection = db.collection("prescriptions");

    const billingCollection = db.collection("billings");

    const patientId = req.params.patientId;

    /*
    |--------------------------------------------------------------------------
    | FIND PATIENT
    |--------------------------------------------------------------------------
    */

    const patient = await patientsCollection.findOne({
      patientId,
    });

    if (!patient) {
      return res.status(404).send({
        message: "Patient not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | BILL ONLY AVAILABLE AFTER DISCHARGE RECOMMENDATION
    |--------------------------------------------------------------------------
    */

    const allowedStatuses = ["Recommended For Discharge", "Discharged"];

    if (!allowedStatuses.includes(patient.status)) {
      return res.status(403).send({
        message: "Bill not available yet",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK SAVED BILL
    |--------------------------------------------------------------------------
    */

    const existingBill = await billingCollection.findOne({
      patientId,
    });

    if (existingBill) {
      return res.send(existingBill);
    }

    /*
    |--------------------------------------------------------------------------
    | GET PRESCRIPTION
    |--------------------------------------------------------------------------
    */

    const prescription = await prescriptionsCollection.findOne({
      patientId,
    });

    const totalTreatmentDays = prescription?.totalDays || 0;

    /*
    |--------------------------------------------------------------------------
    | BILL CALCULATION
    |--------------------------------------------------------------------------
    */

    const admissionCharge = 100;

    const firstDoctorExam = 300;

    const nurseTestCharge = 200;

    const secondDoctorExam = 150;

    const treatmentCharge = totalTreatmentDays * 500;

    const totalAmount =
      admissionCharge +
      firstDoctorExam +
      nurseTestCharge +
      secondDoctorExam +
      treatmentCharge;

    /*
    |--------------------------------------------------------------------------
    | RETURN GENERATED BILL
    |--------------------------------------------------------------------------
    */

    res.send({
      patientId: patient.patientId,

      patientName: patient.name,

      totalTreatmentDays,

      admissionCharge,

      firstDoctorExam,

      nurseTestCharge,

      secondDoctorExam,

      treatmentCharge,

      totalAmount,

      paymentStatus: "Pending",
    });
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Bill",
    });
  }
});

router.patch("/payment/:id", markPaymentReceived);

module.exports = router;