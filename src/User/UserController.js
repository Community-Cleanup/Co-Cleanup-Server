// The Firebase Auth Admin SDK is a set of server libraries that let us interact with Firebase Auth with root/admin level security privileges
// based off the private credentials in our private env file
const firebaseAdmin = require("firebase-admin");

// Our Mongoose User model schema
const UserModel = require("../Database/Models/userSchema");

// Used for "protected" routes, this will be used to validate the current user's session, if it exists
const { isValidUserSession } = require("../User/UserValidators");

// Custom error handler that will generate an error response object depending on HTTP status codes
const ResponseErrorFactory = require("../ErrorHandling/ResponseError");

// Because a user's username string is stored in MongoDB, and has no affiliation with Firebase Auth,
// we need this seperate middleware that the client app can call in a POST request with a username string
// to see if it had already been taken or not
async function checkUsernameUniqueness(req, res, next) {
  const usernameToCheck = req.body.username;

  UserModel.exists({ username: usernameToCheck }, function (error, result) {
    if (error) {
      res.json(error);
    } else {
      result
        ? res.status(200).json({ usernameExists: true })
        : res.status(200).json({ usernameExists: false });
      next();
    }
  });
}

// PROTECTED ROUTE:
// only signed in users should be able to update their own username.
async function updateUsername(req, res) {
  // To protect this route, validate the token (if it exists) from the header with our 'isValidUserSession' function,
  // and if that succeeds, only then update the username
  if (await isValidUserSession(req.headers.authorization)) {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = req.headers.authorization.split(" ")[1];

    // verifyIdToken will decode the token's claims if the promise is successful
    // we just need the decoded user's email address from the token to compare against MongoDB
    firebaseUser = await firebaseAdmin.auth().verifyIdToken(token);

    const usernameToUpdate = req.body.username;

    const user = await UserModel.findOne({ email: firebaseUser.email });
    if (!user) {
      // Shouldn't happen, but if the verified Firebase user doesn't exist in MongoDB...
      const errorObject = new ResponseErrorFactory().create(404);
      res.status(404).json({
        errorMessage: `Error: (${errorObject.message}) User not found in database`,
      });
    }
    // With the found user document from MongoDB, change the username
    user.username = usernameToUpdate;

    try {
      // Then attempt to save the new username to the username,
      // As username is a unique field in our User model schema, we'll catch the error if unable to save
      await user.save();
      res.status(200).json(user);
    } catch (error) {
      const errorObject = new ResponseErrorFactory().create(401);
      res.status(401).json({
        errorMessage: `Error: (${errorObject.message}) The username '${usernameToUpdate}' is already taken, please try another`,
      });
    }
  } else {
    const errorObject = new ResponseErrorFactory().create(401);
    res.status(401).json({
      errorMessage: `Error: (${errorObject.message}) Permission denied`,
    });
  }
}

// On the client app, when the user Signs Up for the first time, the Firebase client SDK (not the admin)
// on the client app will create the user on Firebase and generate the ID token. At this point, this 'createUser'
// middleware is then called in a POST request from the client containing both the new ID token, and the chosen username
// which will then be used to create the new user document in MongoDB
async function createUser(req, res, next) {
  let firebaseUser = null;
  try {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = req.headers.authorization.split(" ")[1];

    // verifyIdToken will decode the token's claims if the promise is successful
    // we just need the decoded user's email address so we can add it to our new user document in MongoDB
    firebaseUser = await firebaseAdmin.auth().verifyIdToken(token);

    // Not really necessary, but since the client app currently doesn't require the user to verify their email address for firebase,
    // we'll just force this flag to true on their Firebase profile
    firebaseUser.email_verified = true;
  } catch (error) {
    const errorObject = new ResponseErrorFactory().create(401);
    res.status(401).json({
      errorMessage: `Error: (${errorObject.message}) Token is invalid`,
    });
  }
  try {
    // If the Firebase token decoding was successful, create the new user document in MongoDB
    if (firebaseUser) {
      let newUser = await new UserModel({
        email: firebaseUser.email,
        username: req.body.username,
        isAdmin: false, // For use by the client app: all new users by default won't have the Co Cleanup administrator user role
        isDisabled: false, // For use by the client app: all new users by default will be enabled on Co Cleanup
      }).save();
      res.status(200).json(newUser);
      next();
    }
  } catch (error) {
    // Unable to create the new user document in MongoDB
    // this is bad if this error raises because now there'll be a de-sync, of a user account existing in Firebase, but not in MongoDB
    const errorObject = new ResponseErrorFactory().create(500);
    res.status(500).json({
      errorMessage: `Error: (${errorObject.message}) Unable to create new user in database`,
    });
  }
}

// 'findCurrentUser' middleware is called upon on one of the following three scenarios from the client app:
// 1. A user Signs Up a new account for the first time, at which point an auth 'observer'/'listener' function on the client app
// detects a new ID token and the Firebase client attempts to automatically sign in the user
// 2. A user Signs In using the sign in form after having manually logged out or their session expired
// 3. The user opens their web browser to the Co Cleanup website, and the client's observer/listener detects that their token is
// valid, so automatically sign the user in
//
// After that, this 'findCurrentUser' middleware will take in the current signed in user's token and
// retrieve their user document from MongoDB to send back to the client
async function findCurrentUser(req, res, next) {
  let firebaseUser = null;
  try {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = req.headers.authorization.split(" ")[1];

    // verifyIdToken will decode the token's claims if the promise is successful
    // we just need the decoded user's email address from the token to compare against MongoDB
    firebaseUser = await firebaseAdmin.auth().verifyIdToken(token);
  } catch (error) {
    // Error will likely throw here if sometime during a signed in user's app use, the ID token becomes
    // invalid/expired
    // At which point the user would need to manually sign in again to get a new token from the Firebase client
    const errorObject = new ResponseErrorFactory().create(401);
    res.status(401).json({
      errorMessage: `Error: (${errorObject.message}) Your session appears to be invalid. Please sign in again.`,
    });
  }

  // If the Firebase token decoding was successful, find the user's document from MongoDB
  const user = await UserModel.findOne({ email: firebaseUser.email });
  if (!user) {
    // Shouldn't happen, but this will raise if there is a de-sync issue where the verified Firebase user doesn't exist in MongoDB...
    const errorObject = new ResponseErrorFactory().create(500);
    res.status(500).json({
      errorMessage: `Error: (${errorObject.message}) Unable to find user in database`,
    });
  } else if (user.isDisabled) {
    // Prevent the user from signing in if Co Cleanup had disabled this user's account
    const errorObject = new ResponseErrorFactory().create(403);
    res.status(403).json({
      errorMessage: `Error: (${errorObject.message}) This user had been disabled by an administrator of Co Cleanup`,
    });
  } else if (user) {
    // All is ok, respond with the user from MongoDB
    res.status(200).json(user);
  }
  next();
}

module.exports = {
  createUser,
  findCurrentUser,
  checkUsernameUniqueness,
  updateUsername,
};
