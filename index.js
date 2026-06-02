require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const client = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const billingRoutes = require("./routes/billingRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const receptionistRoutes = require("./routes/receptionistRoutes");
const nurseRoutes = require("./routes/nurseRoutes");

const app = express();

const port = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-frontend-name.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/patients", patientRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/reports", reportRoutes);
app.use("/billings", billingRoutes);
app.use("/ambulances", ambulanceRoutes);
app.use("/admin", adminRoutes);
app.use("/doctor", doctorRoutes);
app.use("/receptionist", receptionistRoutes);
app.use("/nurse", nurseRoutes);

/*
|--------------------------------------------------------------------------
| DATABASE CONNECTION
|--------------------------------------------------------------------------
*/

async function run() {
  try {
    await client.connect();

    console.log("MongoDB Connected Successfully");

    const db = client.db("carexHospitalDB");

    app.locals.db = db;
  } catch (error) {
    console.log("MongoDB Error:", error);
  }
}

run();

/*
|--------------------------------------------------------------------------
| ROOT ROUTE
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.send("CareX Hospital Server Running");
});

app.get("/env-test", (req, res) => {
  res.send({
    MONGODB_URI: process.env.MONGODB_URI ? "FOUND" : "MISSING",
    JWT_SECRET: process.env.JWT_SECRET ? "FOUND" : "MISSING",
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});