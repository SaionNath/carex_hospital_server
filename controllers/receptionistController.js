const getReceptionistDashboardStats = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const patientsCollection = db.collection("patients");

    const receptionistId = req.params.receptionistId;

    /*
    |--------------------------------------------------------------------------
    | TOTAL ADMITTED PATIENTS
    |--------------------------------------------------------------------------
    */

    const totalAdmittedPatients = await patientsCollection.countDocuments({
      admittedBy: receptionistId,
    });

    /*
    |--------------------------------------------------------------------------
    | WAITING FOR DOCTOR
    |--------------------------------------------------------------------------
    */

    const waitingForDoctor = await patientsCollection.countDocuments({
      admittedBy: receptionistId,

      status: "Admitted",
    });

    /*
    |--------------------------------------------------------------------------
    | BILLING PENDING
    |--------------------------------------------------------------------------
    */

    const billingPending = await patientsCollection.countDocuments({
      admittedBy: receptionistId,

      status: "Recommended For Discharge",
    });

    /*
    |--------------------------------------------------------------------------
    | DISCHARGED PATIENTS
    |--------------------------------------------------------------------------
    */

    const dischargedPatients = await patientsCollection.countDocuments({
      admittedBy: receptionistId,

      status: "Discharged",
    });

    res.send({
      totalAdmittedPatients,

      waitingForDoctor,

      billingPending,

      dischargedPatients,
    });
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Receptionist Dashboard Stats",
    });
  }
};

module.exports = {
  getReceptionistDashboardStats,
};