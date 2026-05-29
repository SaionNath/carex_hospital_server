const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const usersCollection = db.collection("users");

    const patientsCollection = db.collection("patients");

    const { phone, userId } = req.body;

    /*
    |--------------------------------------------------------------------------
    | CHECK NORMAL USERS
    |--------------------------------------------------------------------------
    */

    let user = await usersCollection.findOne({
      phone,
      userId,
    });

    /*
    |--------------------------------------------------------------------------
    | CHECK PATIENT LOGIN
    |--------------------------------------------------------------------------
    */

    if (!user) {
      const patient = await patientsCollection.findOne({
        phone,
        patientId: userId,
      });

      if (patient) {
        user = {
          ...patient,
          role: "patient",
          userId: patient.patientId,
        };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | INVALID LOGIN
    |--------------------------------------------------------------------------
    */

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE TOKEN
    |--------------------------------------------------------------------------
    */

    const token = jwt.sign(
      {
        id: user._id,

        phone: user.phone,

        role: user.role,

        userId: user.userId,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      },
    );

    res.send({
      success: true,

      message: "Login successful",

      token,

      user,
    });
  } catch {
    res.status(500).send({
      success: false,
      message: "Login failed",
    });
  }
};

module.exports = {
  loginUser,
};