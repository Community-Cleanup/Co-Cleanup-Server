const express = require("express");

// controller functions imported from ./UserController.js
const {
  createUser,
  findCurrentUser,
  checkUsernameUniqueness,
  updateUsername,
} = require("./UserController");

// The Express router provides router-level middleware so that we can
// define middleware (i.e. controllers) specifically for all routes from the /user URL in this case
// Keeps things tidy by keeping router level functionality outside of ../index.js
const router = express.Router();

// For code tidiness, the route controller/middleware functions are contained in './UserController.js'
router.post("/check-username-uniqueness", checkUsernameUniqueness);
router.post("/create-current-user", createUser);
router.post("/find-current-user", findCurrentUser);
router.put("/update-username", updateUsername);

module.exports = router;
