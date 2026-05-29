const verifyReceptionist = (req, res, next) => {

  try {

    if (!req.decoded) {

      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }

    if (req.decoded.role !== "receptionist") {

      return res.status(403).send({
        success: false,
        message: "Receptionist Access Only",
      });
    }

    next();

  }
  catch {

    res.status(500).send({
      success: false,
      message: "Authorization Failed",
    });
  }
};

module.exports = verifyReceptionist;