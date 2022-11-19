// This code has been modified from Alex Holder's MERN Masterclass presented to Coder Academy on the 17th October, 2022
// Link Alex's Masterclass tutorial is: https://github.com/AlexHolderDeveloper/expressjs-class-oct-22
const express = require("express");

const UserModel = require("../Database/Models/userSchema");

// functions imported from ./UserFunctions.js
const {
  createUser,
  findCurrentUser,
  checkUsernameUniqueness,
  updateUsername,
} = require("./UserController");

// The Express router provides router-level middleware so that we can
// define middleware specifically for all routes from the /user URL in this case
// Keeps things tidy by keeping router level functionality outside of ../index.js
const router = express.Router();

// For code tidiness, the route controller/middleware functions are contained in './UserController.js'
router.post("/check-username-uniqueness", checkUsernameUniqueness);
router.post("/create-current-user", createUser);
router.post("/find-current-user", findCurrentUser);
router.put("/update-username", updateUsername);

module.exports = router;
