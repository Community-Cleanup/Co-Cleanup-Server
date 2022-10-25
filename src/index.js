// This code has been modified from Alex Holder's MERN Masterclass presented to Coder Academy on the 17th October, 2022
// Link Alex's Masterclass tutorial is: https://github.com/AlexHolderDeveloper/expressjs-class-oct-22
var { app, PORT, HOST } = require("./server");

// index.js is used as the entry point to start the express server
// and provide the PORT & HOST to listen on

// "app.listen" is seperated in index.js from the rest of the server config & setup which is in ./server.js.
const server = app.listen(PORT, HOST, () => {
  const NODE_ENV = process.env.NODE_ENV || "development";

  // Handles when the PORT was set to 0, as the server will randomly generate
  // a new number to use if PORT is left as 0.
  if (server.address().port != PORT) {
    PORT = server.address().port;
  }

  console.log(`
	Express JS server is now running on the following environment:
    NODE_ENV: ${NODE_ENV}
	Server address mapping is:
	HOST: ${HOST}	PORT: ${PORT}
	`);
});
