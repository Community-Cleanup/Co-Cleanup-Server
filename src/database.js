const mongoose = require("mongoose");

// Use Mongoose to establish a database connection to MongoDB
async function databaseConnector(databaseURL) {
  await mongoose.connect(databaseURL);
}

// Closes the database connection
async function databaseDisconnector() {
  await mongoose.connection.close();
}

module.exports = {
  databaseConnector,
  databaseDisconnector,
};
