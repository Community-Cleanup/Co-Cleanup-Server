// This code has been modified from Alex Holder's MERN Masterclass presented to Coder Academy on the 17th October, 2022
// Link Alex's Masterclass tutorial is: https://github.com/AlexHolderDeveloper/expressjs-class-oct-22
const express = require("express");
// 'app' will hold the Express application as an entity
const app = express();
const cors = require("cors");
// Dependency 'helmet', is Express middleware that will assist with further security by the setting of various HTTP headers
const helmet = require("helmet");



// Set values for the server's address
const PORT = process.env.PORT || 0;
const HOST = "0.0.0.0";

// Error messages for when promises or other complex callstack items are crashing & breaking:
void process.on("unhandledRejection", (reason, p) => {
  console.log(`Things got pretty major here! Big error:\n` + p);
  console.log(`That error happened because of:\n` + reason);
});

// Configure server security, based on documentation outlined here:
// https://www.npmjs.com/package/helmet
// The is was recommended during Alex Holder's MERN masterclass
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
    },
  })
);

// Configure API data receiving & sending
// express.json() This is a built-in middleware function in Express.
// It parses all incoming requests with JSON payloads and is based on body-parser (Node.js body parsing middleware).
// express.urlencoded() parses incoming requests with urlencoded payloads and is based on body-parser.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS, to specify the hosts/ports and/or domains,
// that will be the only client origins allowed to access this server
// In our case, both our localhost (dev) ReactJS client, and our production deployed ReactJS app.
var corsOptions = {
  origin: ["http://localhost:3000", "https://deployedApp.com"],
  optionsSuccessStatus: 200,
};
// Apply the CORS middleware to all incoming requests
app.use(cors(corsOptions));

// Load up the .env file and store its values into process.env
require("dotenv").config();

// Establish Firebase and give it valid admin credentials
const firebaseAdmin = require("firebase-admin");
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"), // Remove breaking line-breaks
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  }),
});

// Import the database connection function
const { databaseConnector } = require('./database');
// If we're not in test mode, start connecting to the database.
if (process.env.NODE_ENV != "test") {
	// Establish what the database URL is going to be
	const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/CoCleanup';
	// Connect to the database using the URL
	databaseConnector(DATABASE_URI).then(() => {
		console.log("Database connected successfully!");
	}).catch(error => {
		console.log(`
		Some error occured connecting to the database! It was: 
		${error}
		`)
	});
}

// The server's home route
// Useful for checking that the server is running as expected in local and deployed environments
// This "/" route is just for our testing purposes only
app.get("/", (req, res) => {
  console.log("ExpressJS API homepage received a request.");

  const target = process.env.NODE_ENV || "not yet set";

  res.json({
    message: `Hello ${target} world!`,
  });
});

const userRouter = require('./User/UserRoutes');
// Using express.Router, All "users" API end-points,
// will start from /api/users/
// e.g.
// POST http://localhost:55000/api/users/sign-up
// POST http://localhost:55000/api/users/sign-in
// POST http://localhost:55000/api/users/validate-session
app.use('/api/users', userRouter);

const eventRouter = require('./Event/EventRoutes');
app.use('/api/events', eventRouter);


// Export our 'app' Express entity/server, the associated PORT and HOST,
// all primarily for our ./index.js to start/boot the Express server.
// Segregation of Express server config into this file will allow for simpler Jest testing.
module.exports = {
  app,
  PORT,
  HOST,
};
