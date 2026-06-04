const { ObjectId } = require("mongodb");

const bookAmbulance = async (req, res) => {
  const db = req.app.locals.db;

  const ambulanceCollection = db.collection("ambulanceBookings");

  const bookingData = req.body;

  const distanceInKm = Number(bookingData.distanceInKm || 0);

  const baseFare = 200;
  const perKm = distanceInKm * 30;
  const extraBlocks = Math.floor(distanceInKm / 5) * 200;

  const estimatedBill = baseFare + perKm + extraBlocks;

  const newBooking = {
    ...bookingData,

    estimatedBill,

    bookingStatus: "Pending",

    driverName: "",
    driverPhone: "",
    driverId: "",

    totalBill: 0,

    acceptedAt: null,
    completedAt: null,
  };

  const result = await ambulanceCollection.insertOne(newBooking);

  res.send(result);
};

const getBookings = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const ambulanceCollection = db.collection("ambulanceBookings");

    const { driverId } = req.query;

    let bookings = [];

    if (driverId) {
      bookings = await ambulanceCollection
        .find({
          $or: [
            {
              bookingStatus: "Pending",
            },

            {
              driverId,
              bookingStatus: "Accepted",
            },
          ],
        })
        .toArray();
    } else {
      bookings = await ambulanceCollection.find().toArray();
    }

    res.send(bookings);
  } catch {
    res.status(500).send({
      message: "Failed To Load Bookings",
    });
  }
};

const updateBookingStatus = async (req, res) => {
  const db = req.app.locals.db;

  const ambulanceCollection = db.collection("ambulanceBookings");

  const id = req.params.id;

  const { bookingStatus } = req.body;

  const result = await ambulanceCollection.updateOne(
    {
      _id: new ObjectId(id),
    },

    {
      $set: {
        bookingStatus,
      },
    },
  );

  res.send(result);
};

/*
|--------------------------------------------------------------------------
| TRACK AMBULANCE
|--------------------------------------------------------------------------
*/

const trackAmbulance = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const ambulanceCollection = db.collection("ambulanceBookings");

    const { phone } = req.params;

    const booking = await ambulanceCollection
      .find({
        phone,
        bookingStatus: { $ne: "Completed" },
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (!booking.length) {
      return res.status(404).send({
        message: "No booking found",
      });
    }

    res.send(booking[0]);
  } catch (err) {
    res.status(500).send({
      message: "Failed To Track Ambulance",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ACCEPT AMBULANCE REQUEST
|--------------------------------------------------------------------------
*/

const acceptBooking = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const ambulanceCollection = db.collection("ambulanceBookings");

    const id = req.params.id;

    const { driverId, driverName, driverPhone, distanceInKm } = req.body;

    const booking = await ambulanceCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return res.status(404).send({ message: "Booking not found" });
    }

    if (booking.bookingStatus !== "Pending") {
      return res.status(400).send({ message: "Already accepted" });
    }

    const km = Number(distanceInKm);

    // BILL LOGIC
    const baseFare = 200;
    const perKm = km * 30;
    const extraBlocks = Math.floor(km / 5) * 200;

    const totalBill = baseFare + perKm + extraBlocks;

    const result = await ambulanceCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          bookingStatus: "Accepted",
          driverId,
          driverName,
          driverPhone,
          distanceInKm: km,
          totalBill,
          acceptedAt: new Date(),
        },
      },
    );

    res.send({
      success: true,
      totalBill,
      result,
    });
  } catch (err) {
    res.status(500).send({ message: "Failed To Accept Booking" });
  }
};

/*
|--------------------------------------------------------------------------
| COMPLETE AMBULANCE TRIP
|--------------------------------------------------------------------------
*/

const completeTrip = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const ambulanceCollection = db.collection("ambulanceBookings");

    const id = req.params.id;

    const result = await ambulanceCollection.updateOne(
      {
        _id: new ObjectId(id),
      },

      {
        $set: {
          bookingStatus: "Completed",

          driverAvailable: true,

          completedAt: new Date(),
        },
      },
    );

    res.send(result);
  } catch {
    res.status(500).send({
      message: "Failed To Complete Trip",
    });
  }
};

module.exports = {
  bookAmbulance,
  getBookings,
  updateBookingStatus,
  trackAmbulance,
  acceptBooking,
  completeTrip,
};
