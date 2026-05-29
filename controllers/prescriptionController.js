const { ObjectId } = require("mongodb");

/*
|--------------------------------------------------------------------------
| Create prescription
|--------------------------------------------------------------------------
*/

const createPrescription = async (req, res) => {
  const db = req.app.locals.db;

  const prescriptionsCollection = db.collection("prescriptions");

  const patientsCollection = db.collection("patients");

  const { patientId, medicine, dosagePerDay, totalDays, notes } = req.body;

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
| CREATE PRESCRIPTION
|--------------------------------------------------------------------------
*/

  const newPrescription = {
    patientId,

    patientName: patient.name,

    assignedNurseId: patient.assignedNurseId,

    assignedNurseName: patient.assignedNurseName,

    medicine,

    dosagePerDay,

    totalDays: Number(totalDays),

    completedDays: 0,

    treatmentDays: Array.from({ length: Number(totalDays) }, (_, index) => ({
      day: index + 1,
      completed: false,
    })),

    notes,

    status: "Pending Treatment",

    visibleToPatient: false,

    createdAt: new Date(),
  };

  const result = await prescriptionsCollection.insertOne(newPrescription);

  res.send(result);
};

/*
|--------------------------------------------------------------------------
| Get All Prescriptions
|--------------------------------------------------------------------------
*/

const getPrescriptions = async (req, res) => {
  const db = req.app.locals.db;

  const prescriptionsCollection = db.collection("prescriptions");

  const prescriptions = await prescriptionsCollection.find().toArray();

  res.send(prescriptions);
};

const updatePatientStatus = async (req, res) => {
  const db = req.app.locals.db;

  const patientsCollection = db.collection("patients");

  const id = req.params.id;

  const { status } = req.body;

  const result = await patientsCollection.updateOne(
    {
      _id: new ObjectId(id),
    },

    {
      $set: {
        status,
      },
    },
  );

  res.send(result);
};

/*
|--------------------------------------------------------------------------
| COMPLETE TREATMENT DAY
|--------------------------------------------------------------------------
*/

const completeTreatmentDay = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const prescriptionsCollection = db.collection("prescriptions");

    const patientsCollection = db.collection("patients");

    const { id, day } = req.params;

    const prescription = await prescriptionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!prescription) {
      return res.status(404).send({
        message: "Prescription not found",
      });
    }

    const updatedDays = prescription.treatmentDays.map((d) => {
      if (d.day === Number(day)) {
        return {
          ...d,
          completed: true,
        };
      }

      return d;
    });

    const completedCount = updatedDays.filter((d) => d.completed).length;

    const allCompleted = completedCount === prescription.totalDays;

    await prescriptionsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },

      {
        $set: {
          treatmentDays: updatedDays,

          completedDays: completedCount,

          status: allCompleted ? "Completed Treatment" : "Pending Treatment",
        },
      },
    );

    /*
    |--------------------------------------------------------------------------
    | UPDATE PATIENT STATUS
    |--------------------------------------------------------------------------
    */

    if (allCompleted) {
      await patientsCollection.updateOne(
        {
          patientId: prescription.patientId,
        },

        {
          $set: {
            status: "Treatment Completed",
          },
        },
      );
    }

    res.send({
      success: true,
    });
  } catch {
    res.status(500).send({
      message: "Failed To Complete Treatment",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PRESCRIPTIONS BY PATIENT
|--------------------------------------------------------------------------
*/

const getPatientPrescriptions = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const prescriptionsCollection = db.collection("prescriptions");

    const patientId = req.params.patientId;

    const prescriptions = await prescriptionsCollection
      .find({
        patientId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.send(Array.isArray(prescriptions) ? prescriptions : []);
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Prescriptions",
    });
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  updatePatientStatus,
  completeTreatmentDay,
  getPatientPrescriptions,
};