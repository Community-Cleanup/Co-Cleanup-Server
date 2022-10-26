// This code has been modified from Alex Holder's MERN Masterclass presented to Coder Academy on the 17th October, 2022
// Link Alex's Masterclass tutorial is: https://github.com/AlexHolderDeveloper/expressjs-class-oct-22
const express = require("express");

// functions imported from ./UserFunctions.js
const {
  signUpUser,
  signInUser,
  validateUserSession,
} = require("./UserFunctions");

// The Express router provides router-level middleware so that we can
// define middleware specifically for all routes from the /user URL in this case
// Keeps things tidy by keeping router level functionality outside of ../index.js
const router = express.Router();

router.get("/", async (request, response) => {
  response.json({"message": "Hello /users route"});
})

// Create a user, a session token & a refresh token
router.post("/sign-up", async (request, response) => {
    // request data formatted ready for input into signUpUser function
  let newUserDetails = {
    email: request.body.email,
    password: request.body.password,
    displayName: request.body.username,
  };
  // To Do
  // Ideally perform validation on those properties before moving on.
  // Not in the scope of this guide though! ;)

  // Hand newUserDetails data to a signUpUser function
  let signUpResult = await signUpUser({
    email: newUserDetails.email,
    password: newUserDetails.password,
  });
  // Return error or token as response
  if (signUpResult.error != null) {
    console.log(
      "Stopping the signup process due to an error. See logs for details."
    );
    response.json(signUpResult);
    return;
  }

  // Sign in to get latest user claims (authorization).
  let signInResult = await signInUser({
    email: newUserDetails.email,
    password: newUserDetails.password,
  });

  // If an error message exists, return that.
  if (signInResult.error != null) {
    console.log(
      "Stopping the signup process due to an error. See logs for details."
    );
    response.json(signInResult);
    return;
  }

  // On success, return a signed-in session to the brand-new user:
  response.json(signInResult);
});

// Create a session token & refresh token
router.post("/sign-in", async (request, response) => {
  // Process posted form/json data
  let userDetails = {
    email: request.body.email,
    password: request.body.password,
    displayName: request.body.username,
  };

  // To Do
  // Ideally perform validation on those properties before moving on.
  // Not in the scope of this guide though! ;)

  // Hand data to a sign-in function
  let signInResult = await signInUser({
    email: userDetails.email,
    password: userDetails.password,
  });

  // If an error message exists, return that.
  if (signInResult.error != null) {
    console.log(
      "Stopping the signup process due to an error. See logs for details."
    );
    response.json(signInResult);
    return;
  }

  // On success, return a signed-in session to the brand-new user:
  response.json(signInResult);
});

// Create a session token & refresh token
router.post("/validate-session", async (request, response) => {
  // Process posted form/json data
  let sessionDetails = {
    idToken: request.body.idToken,
    refreshToken: request.body.refreshToken,
  };

  // Hand data to a validation function
  let validationResult = await validateUserSession({
    refreshToken: sessionDetails.refreshToken,
    idToken: sessionDetails.idToken,
  });

  // Return error or token as response
  response.json(validationResult);
});

module.exports = router;
