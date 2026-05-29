const { ObjectId } = require("mongodb");

const uploadReport = async (req, res) => {

  const db = req.app.locals.db;

  const reportsCollection =
    db.collection("reports");

  const reportData = req.body;

  const newReport = {

    ...reportData,

    uploadedAt: new Date(),

  };

  const result =
    await reportsCollection.insertOne(newReport);

  res.send(result);
};

const submitPrescription = async (req, res) => {

  const db = req.app.locals.db;

  const prescriptionsCollection =
    db.collection("prescriptions");

  const id = req.params.id;

  const result =
    await prescriptionsCollection.updateOne(

      {
        _id: new ObjectId(id),
      },

      {
        $set: {

          visibleToPatient: true,

          handledByNurse: true,

        },
      }
    );

  res.send(result);
};

module.exports = {

  uploadReport,
  submitPrescription,

};