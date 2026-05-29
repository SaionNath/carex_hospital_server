const express = require("express");

const router = express.Router();

const { loginUser } = require("../controllers/authController");

router.get("/", (req, res) => {
  res.send("Auth route is working");
});

router.post("/login", loginUser);

module.exports = router;