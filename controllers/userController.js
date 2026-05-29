const generateUserId = require("../utils/generateUserId");

const addUser = async (req, res) => {

  const db = req.app.locals.db;

  const usersCollection = db.collection("users");

  const userData = req.body;

  const generatedId = generateUserId();

  const newUser = {
    ...userData,
    userId: generatedId,
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);

  res.send({
    success: true,
    generatedId,
    result,
  });
};

const getUsers = async (req, res) => {

  const db = req.app.locals.db;

  const usersCollection = db.collection("users");

  const users = await usersCollection.find().toArray();

  res.send(users);
};

module.exports = {
  addUser,
  getUsers,
};