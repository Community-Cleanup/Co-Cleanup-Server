const mongoose = require('mongoose');


async function databaseConnector(databaseURL){
    await mongoose.connect(databaseURL);
}

// Closes the database connection
async function databaseDisconnector(){
    await mongoose.connection.close();
}

module.exports = {
    databaseConnector,
    databaseDisconnector
}