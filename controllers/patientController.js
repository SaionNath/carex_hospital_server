const generatePatientId = require("../utils/generatePatientId");

/*
|--------------------------------------------------------------------------
| ADMIT PATIENT
|--------------------------------------------------------------------------
*/

const admitPatient = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const patientsCollection = db.collection("patients");

    const patientData = req.body;

    const patientId = generatePatientId();

    const newPatient = {
      ...patientData,

      patientId,

      status: "Admitted",

      admittedAt: new Date(),

      admittedBy: req.decoded.userId,
    };

    const result = await patientsCollection.insertOne(newPatient);

    res.send({
      success: true,
      patientId,
      result,
    });
  } catch {
    res.status(500).send({
      success: false,
      message: "Failed To Admit Patient",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PATIENTS
|--------------------------------------------------------------------------
*/

const getPatients = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const patientsCollection = db.collection("patients");

    /*
    |--------------------------------------------------------------------------
    | RECEPTIONIST ONLY SEES OWN PATIENTS
    |--------------------------------------------------------------------------
    */

    let query = {};

    if (req.decoded.role === "receptionist") {
      query = {
        admittedBy: req.decoded.userId,
      };
    }

    const patients = await patientsCollection
      .find(query)
      .sort({ admittedAt: -1 })
      .toArray();

    res.send(Array.isArray(patients) ? patients : []);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Failed To Fetch Patients",
    });
  }
};

module.exports = {
  admitPatient,
  getPatients,
};
