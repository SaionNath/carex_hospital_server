const getAdminStats = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const usersCollection = db.collection("users");

    const patientsCollection = db.collection("patients");

    const billingCollection = db.collection("billings");

    /*
    |--------------------------------------------------------------------------
    | USER COUNTS
    |--------------------------------------------------------------------------
    */

    const totalDoctors = await usersCollection.countDocuments({
      role: "doctor",
    });

    const totalNurses = await usersCollection.countDocuments({
      role: "nurse",
    });

    const totalReceptionists = await usersCollection.countDocuments({
      role: "receptionist",
    });

    /*
    |--------------------------------------------------------------------------
    | PATIENT COUNTS
    |--------------------------------------------------------------------------
    */

    const totalPatients = await patientsCollection.countDocuments();

    const admittedPatients = await patientsCollection.countDocuments({
      status: "Admitted",
    });

    const dischargedPatients = await patientsCollection.countDocuments({
      status: "Discharged",
    });

    const pendingTests = await patientsCollection.countDocuments({
      status: "Test Pending",
    });

    /*
    |--------------------------------------------------------------------------
    | TOTAL EARNINGS
    |--------------------------------------------------------------------------
    */

    const paidBills = await billingCollection
      .find({
        paymentStatus: "Paid",
      })
      .toArray();

    const totalEarnings = paidBills.reduce(
      (sum, bill) => sum + Number(bill.totalAmount || 0),
      0,
    );

    /*
    |--------------------------------------------------------------------------
    | DOCTOR WORKLOAD
    |--------------------------------------------------------------------------
    */

    const doctorActivity = await patientsCollection
      .aggregate([
        {
          $match: {
            assignedDoctorName: { $exists: true },
          },
        },

        {
          $group: {
            _id: "$assignedDoctorName",
            totalPatients: { $sum: 1 },
          },
        },
      ])
      .toArray();

    /*
    |--------------------------------------------------------------------------
    | NURSE WORKLOAD
    |--------------------------------------------------------------------------
    */

    const nurseActivity = await patientsCollection
      .aggregate([
        {
          $match: {
            assignedNurseName: { $exists: true },
          },
        },

        {
          $group: {
            _id: "$assignedNurseName",
            totalPatients: { $sum: 1 },
          },
        },
      ])
      .toArray();

    res.send({
      totalDoctors,

      totalNurses,

      totalReceptionists,

      totalPatients,

      admittedPatients,

      dischargedPatients,

      pendingTests,

      totalEarnings,

      doctorActivity,

      nurseActivity,
    });
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Admin Stats",
    });
  }
};

module.exports = {
  getAdminStats,
};