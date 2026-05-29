const express = require("express");

const router = express.Router();

const client = require("../config/db");

const usersCollection = client.db("carexHospitalDB").collection("users");

/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();

    res.send(users);
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Users",
    });
  }
});

/*
|--------------------------------------------------------------------------
| ADD USER
|--------------------------------------------------------------------------
*/

router.post("/", async (req, res) => {
  try {
    const { name, phone, role } = req.body;

    const userId = `CRX-${Date.now()}`;

    const newUser = {
      name,
      phone,
      role,

      userId,

      status: "active",

      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    res.send({
      success: true,
      insertedId: result.insertedId,
      userId,
    });
  } catch {
    res.status(500).send({
      message: "Failed To Add User",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET DOCTORS
|--------------------------------------------------------------------------
*/

router.get("/doctors", async (req, res) => {
  try {
    const doctors = await usersCollection
      .find({
        role: "doctor",
      })
      .toArray();

    res.send(doctors);
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Doctors",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET NURSES
|--------------------------------------------------------------------------
*/

router.get("/nurses", async (req, res) => {
  try {
    const nurses = await usersCollection
      .find({
        role: "nurse",
      })
      .toArray();

    res.send(nurses);
  } catch {
    res.status(500).send({
      message: "Failed To Fetch Nurses",
    });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE ROLE
|--------------------------------------------------------------------------
*/

router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const { role } = req.body;

    const { ObjectId } = require("mongodb");

    const existingUser = await usersCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingUser) {
      return res.status(404).send({
        message: "User Not Found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ONLY ADMIN <-> RECEPTIONIST SWITCH ALLOWED
    |--------------------------------------------------------------------------
    */

    const currentRole = existingUser.role;

    const allowedPromotion =
      (currentRole === "receptionist" && role === "admin") ||
      (currentRole === "admin" && role === "receptionist");

    if (!allowedPromotion) {
      return res.status(403).send({
        message:
          "Only receptionist can be promoted to admin and admin can be demoted to receptionist",
      });
    }

    const result = await usersCollection.updateOne(
      {
        _id: new ObjectId(id),
      },

      {
        $set: {
          role,
        },
      },
    );

    res.send(result);
  } catch {
    res.status(500).send({
      message: "Failed To Update User",
    });
  }
});

module.exports = router;
