const express = require("express");

const router = express.Router();

router.get("/dashboard-stats/:nurseId", async (req, res) => {
  try {
    const db = req.app.locals.db;

    const patientsCollection = db.collection("patients");

    const prescriptionsCollection = db.collection("prescriptions");

    const nurseId = req.params.nurseId;

    /*
    |--------------------------------------------------------------------------
    | TOTAL ASSIGNED PATIENTS
    |--------------------------------------------------------------------------
    */

    const assignedPatients = await patientsCollection.countDocuments({
      assignedNurseId: nurseId,
    });

    /*
    |--------------------------------------------------------------------------
    | TOTAL REPORTS UPLOADED
    |--------------------------------------------------------------------------
    */

    const reportsUploaded = await patientsCollection.countDocuments({
      assignedNurseId: nurseId,

      reportFile: {
        $exists: true,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | TREATMENT ONGOING
    |--------------------------------------------------------------------------
    */

    const ongoingTreatments = await prescriptionsCollection.countDocuments({
      assignedNurseId: nurseId,

      status: "Pending Treatment",
    });

    /*
    |--------------------------------------------------------------------------
    | TREATMENT COMPLETED
    |--------------------------------------------------------------------------
    */

    const completedTreatments = await prescriptionsCollection.countDocuments({
      assignedNurseId: nurseId,

      status: "Completed Treatment",
    });

    res.send({
      assignedPatients,

      reportsUploaded,

      ongoingTreatments,

      completedTreatments,
    });
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Nurse Dashboard Stats",
    });
  }
});

module.exports = router;