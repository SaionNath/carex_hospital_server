const { MongoClient, ServerApiVersion } = require("mongodb");

console.log("MONGODB_URI =", process.env.MONGODB_URI);

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

module.exports = client;