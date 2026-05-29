const { ObjectId } = require("mongodb");

const createBill = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const billingCollection = db.collection("billings");

    const patientsCollection = db.collection("patients");

    const billData = req.body;

    const newBill = {
      ...billData,

      paymentStatus: "Pending",

      createdAt: new Date(),
    };

    const result = await billingCollection.insertOne(newBill);

    /*
    |--------------------------------------------------------------------------
    | UPDATE PATIENT STATUS
    |--------------------------------------------------------------------------
    */

    await patientsCollection.updateOne(
      {
        patientId: billData.patientId,
      },

      {
        $set: {
          status: "Billing Pending",
        },
      },
    );

    res.send(result);
  } catch {
    res.status(500).send({
      message: "Failed To Create Bill",
    });
  }
};

const getBills = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const patientsCollection = db.collection("patients");

    const prescriptionsCollection = db.collection("prescriptions");

    const billingCollection = db.collection("billings");

    /*
    |--------------------------------------------------------------------------
    | GET DISCHARGE RECOMMENDED PATIENTS
    |--------------------------------------------------------------------------
    */

    const patients = await patientsCollection
      .find({
        status: "Recommended For Discharge",
      })
      .toArray();

    const generatedBills = [];

    for (const patient of patients) {
      /*
      |--------------------------------------------------------------------------
      | CHECK EXISTING BILL
      |--------------------------------------------------------------------------
      */

      const existingBill = await billingCollection.findOne({
        patientId: patient.patientId,
      });

      /*
      |--------------------------------------------------------------------------
      | IF BILL EXISTS, RETURN SAVED BILL
      |--------------------------------------------------------------------------
      */

      if (existingBill) {
        generatedBills.push(existingBill);

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | GET PRESCRIPTION
      |--------------------------------------------------------------------------
      */

      const prescription = await prescriptionsCollection.findOne({
        patientId: patient.patientId,
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
      | TEMPORARY GENERATED BILL
      |--------------------------------------------------------------------------
      */

      generatedBills.push({
        _id: patient._id,

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
    }

    res.send(generatedBills);
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Bills",
    });
  }
};

const markPaymentReceived = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const billingCollection = db.collection("billings");

    const patientsCollection = db.collection("patients");

    const prescriptionsCollection = db.collection("prescriptions");

    const id = req.params.id;

    /*
    |--------------------------------------------------------------------------
    | FIND PATIENT
    |--------------------------------------------------------------------------
    */

    const patient = await patientsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!patient) {
      return res.status(404).send({
        message: "Patient not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET PRESCRIPTION
    |--------------------------------------------------------------------------
    */

    const prescription = await prescriptionsCollection.findOne({
      patientId: patient.patientId,
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
    | SAVE FINAL BILL
    |--------------------------------------------------------------------------
    */

    await billingCollection.insertOne({
      patientId: patient.patientId,

      patientName: patient.name,

      totalTreatmentDays,

      admissionCharge,

      firstDoctorExam,

      nurseTestCharge,

      secondDoctorExam,

      treatmentCharge,

      totalAmount,

      paymentStatus: "Paid",

      paidAt: new Date(),
    });

    /*
    |--------------------------------------------------------------------------
    | DISCHARGE PATIENT
    |--------------------------------------------------------------------------
    */

    await patientsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },

      {
        $set: {
          status: "Discharged",
        },
      },
    );

    res.send({
      success: true,
    });
  } catch {
    res.status(500).send({
      message: "Failed To Receive Payment",
    });
  }
};

module.exports = {
  createBill,
  getBills,
  markPaymentReceived,
};