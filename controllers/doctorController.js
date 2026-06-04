const getDoctorDashboardStats = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const patientsCollection = db.collection("patients");

    const prescriptionsCollection = db.collection("prescriptions");

    const doctorId = req.params.doctorId;

    /*
    |--------------------------------------------------------------------------
    | TOTAL ASSIGNED PATIENTS
    |--------------------------------------------------------------------------
    */

    const totalAssignedPatients = await patientsCollection.countDocuments({
      assignedDoctorId: doctorId,
      status: {
        $ne: "Discharged",
      },
    });

    /*
    |--------------------------------------------------------------------------
    | REPORTS READY
    |--------------------------------------------------------------------------
    */

    const reportsReady = await patientsCollection.countDocuments({
      assignedDoctorId: doctorId,
      status: "Report Ready",
    });

    /*
    |--------------------------------------------------------------------------
    | PRESCRIPTIONS SUBMITTED
    |--------------------------------------------------------------------------
    */

    /*
|--------------------------------------------------------------------------
| PRESCRIPTIONS SUBMITTED (ONLY THIS DOCTOR)
|--------------------------------------------------------------------------
*/

    const patientIds = await patientsCollection
      .find({
        assignedDoctorId: doctorId,
      })
      .project({
        patientId: 1,
      })
      .toArray();

    const ids = patientIds.map((p) => p.patientId);

    const prescriptionsSubmitted = await prescriptionsCollection.countDocuments(
      {
        patientId: {
          $in: ids,
        },
      },
    );

    /*
    |--------------------------------------------------------------------------
    | RECOMMENDED FOR DISCHARGE
    |--------------------------------------------------------------------------
    */

    const recommendedForDischarge = await patientsCollection.countDocuments({
      assignedDoctorId: doctorId,
      status: {
        $in: ["Recommended For Discharge", "Discharged"],
      },
    });

    const dischargedPatients = await patientsCollection.countDocuments({
      assignedDoctorId: doctorId,
      status: "Discharged",
    });

    /*
    |--------------------------------------------------------------------------
    | ACTIVE TREATMENTS
    |--------------------------------------------------------------------------
    */

    const activeTreatments = await prescriptionsCollection.countDocuments({
      status: "Pending Treatment",
    });

    res.send({
      totalAssignedPatients,

      reportsReady,

      prescriptionsSubmitted,

      recommendedForDischarge,

      dischargedPatients,

      activeTreatments,
    });
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Doctor Dashboard Stats",
    });
  }
};

module.exports = {
  getDoctorDashboardStats,
};
