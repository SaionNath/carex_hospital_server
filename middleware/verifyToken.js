const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Token Missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);

    req.decoded = decoded;

    next();
  } catch (error) {
    console.log(error);

    res.status(401).send({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = verifyToken;
