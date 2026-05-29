const verifyAdmin = (req, res, next) => {

  if (req.user.role !== "admin") {
    return res.status(403).send({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

module.exports = verifyAdmin;