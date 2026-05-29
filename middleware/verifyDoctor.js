const verifyDoctor = (req, res, next) => {

  if (req.user.role !== "doctor") {
    return res.status(403).send({
      success: false,
      message: "Doctor access required",
    });
  }

  next();
};

module.exports = verifyDoctor;