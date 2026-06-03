const express = require("express");
const streamifier = require("streamifier");

const router = express.Router();

const client = require("../config/db");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");

const { ObjectId } = require("mongodb");

const patientsCollection = client.db("carexHospitalDB").collection("patients");

const {
  admitPatient,
  getPatients,
} = require("../controllers/patientController");

const verifyToken = require("../middleware/verifyToken");
const verifyReceptionist = require("../middleware/verifyReceptionist");

/*
|--------------------------------------------------------------------------
| ASSIGN DOCTOR
|--------------------------------------------------------------------------
*/

router.patch(
  "/assign-doctor/:id",
  verifyToken,
  verifyReceptionist,
  async (req, res) => {
    try {
      const id = req.params.id;
      const { doctorId, doctorName } = req.body;

      if (!doctorId || !doctorName) {
        return res.status(400).send({
          message: "Doctor info required",
        });
      }

      const result = await patientsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            assignedDoctorId: doctorId, // MUST be userId (CRX-xxxx)
            assignedDoctorName: doctorName,
            status: "Under Examination",
          },
        },
      );

      res.send(result);
    } catch {
      res.status(500).send({
        message: "Failed To Assign Doctor",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET PATIENTS BY DOCTOR
|--------------------------------------------------------------------------
*/

router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    if (!doctorId) {
      return res.status(400).send([]);
    }

    const patients = await patientsCollection
      .find({
        assignedDoctorId: doctorId,
        status: { $ne: "Discharged" },
      })
      .toArray();

    return res.send(Array.isArray(patients) ? patients : []);
  } catch (err) {
    return res.status(500).send([]);
  }
});

/*
|--------------------------------------------------------------------------
| REQUEST TEST FOR PATIENT (DOCTOR)
|--------------------------------------------------------------------------
*/

router.patch("/request-test/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tests } = req.body;

    const result = await patientsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          testsRequested: tests,
          status: "Test Pending",
        },
      },
    );

    res.send(result);
  } catch {
    res.status(500).send({
      message: "Failed To Request Test",
    });
  }
});

/*
|--------------------------------------------------------------------------
| ASSIGN NURSE
|--------------------------------------------------------------------------
*/

router.patch("/assign-nurse/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { nurseId, nurseName } = req.body;

    if (!nurseId || !nurseName) {
      return res.status(400).send({
        message: "Nurse information required",
      });
    }

    const result = await patientsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },

      {
        $set: {
          assignedNurseId: nurseId,
          assignedNurseName: nurseName,
          status: "Test Assigned",
        },
      },
    );

    res.send(result);
  } catch {
    res.status(500).send({
      message: "Failed To Assign Nurse",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET PATIENTS BY NURSE
|--------------------------------------------------------------------------
*/

router.get("/nurse/:nurseId", async (req, res) => {
  try {
    const nurseId = req.params.nurseId;

    const patients = await patientsCollection
      .find({
        assignedNurseId: nurseId,
      })
      .toArray();

    res.send(Array.isArray(patients) ? patients : []);
  } catch {
    res.status(500).send([]);
  }
});

/*
|--------------------------------------------------------------------------
| UPLOAD TEST REPORT (NURSE)
|--------------------------------------------------------------------------
*/

router.patch(
  "/upload-report/:id",
  upload.single("report"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).send({
          message: "File required",
        });
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "carex-reports",
            resource_type: "raw",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      const result = await patientsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            reportFile: uploadResult.secure_url,
            status: "Report Ready",
          },
        },
      );

      res.send(result);
    } catch (error) {
      console.log(error);

      res.status(500).send({
        message: "Failed To Upload Report",
      });
    }
  },
);

/*
|--------------------------------------------------------------------------
| GET ALL REPORTS (DOCTOR)
|--------------------------------------------------------------------------
*/

router.get("/reports/all", async (req, res) => {
  try {
    const reports = await patientsCollection
      .find({ reportFile: { $exists: true } })
      .toArray();

    res.send(reports);
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Reports",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET DISCHARGE RECOMMENDED PATIENTS
|--------------------------------------------------------------------------
*/

router.get("/recommended-discharge", async (req, res) => {
  try {
    const patients = await patientsCollection
      .find({
        status: "Recommended For Discharge",
      })
      .sort({ admittedAt: -1 })
      .toArray();

    res.send(Array.isArray(patients) ? patients : []);
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Patients",
    });
  }
});

/*
|--------------------------------------------------------------------------
| RECOMMEND DISCHARGE (DOCTOR)
|--------------------------------------------------------------------------
*/

router.patch("/recommend-discharge/:id", async (req, res) => {
  try {
    const { id } = req.params;

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
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    await patientsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },

      {
        $set: {
          status: "Recommended For Discharge",
        },
      },
    );

    res.send({
      success: true,

      message: "Patient Recommended For Discharge",
    });
  } catch {
    res.status(500).send({
      message: "Failed To Recommend Discharge",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET REPORT FOR PATIENT
|--------------------------------------------------------------------------
*/

router.get("/my-report/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const patient = await patientsCollection.findOne({
      patientId,
    });

    /*
    |--------------------------------------------------------------------------
    | PATIENT NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!patient) {
      return res.status(404).send({
        message: "Patient not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | REPORT ONLY VISIBLE AFTER DISCHARGE RECOMMENDATION
    |--------------------------------------------------------------------------
    */

    const allowedStatuses = ["Recommended For Discharge", "Discharged"];

    if (!allowedStatuses.includes(patient.status)) {
      return res.status(403).send({
        message: "Report not available yet",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | REPORT NOT UPLOADED
    |--------------------------------------------------------------------------
    */

    if (!patient.reportFile) {
      return res.status(404).send({
        message: "No report uploaded",
      });
    }

    res.send({
      patientId: patient.patientId,

      patientName: patient.name,

      reportFile: patient.reportFile,

      status: patient.status,
    });
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Report",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET PATIENT TIMELINE
|--------------------------------------------------------------------------
*/

router.get("/timeline/:patientId", async (req, res) => {
  try {
    const patientId = req.params.patientId;

    const patient = await patientsCollection.findOne({
      patientId,
    });

    if (!patient) {
      return res.status(404).send({
        message: "Patient not found",
      });
    }

    res.send(patient);
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Timeline",
    });
  }
});

router.post("/", verifyToken, verifyReceptionist, admitPatient);

router.get("/", verifyToken, getPatients);

module.exports = router;
