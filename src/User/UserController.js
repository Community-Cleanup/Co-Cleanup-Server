// The Admin SDK is a set of server libraries that let you interact with Firebase from root level environments
const firebaseAdmin = require("firebase-admin");

const UserModel = require("../Database/Models/userSchema");

const { validateUserSession } = require("../User/UserValidators");

const ResponseErrorFactory = require("../ErrorHandling/ResponseError");

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

async function updateUsername(req, res) {
  // Protected route: only signed in users should be able to update their own username.
  // To do that, validate the token (if it exists) from the header in our 'validateUserSession' function,
  // and if that succeeds, only then create an event
  if (
    req.headers.authorization &&
    (await validateUserSession(req.headers.authorization))
  ) {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = req.headers.authorization.split(" ")[1];

    // verifyIdToken will decode the token's claims is the promise is successful
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
    user.username = usernameToUpdate;

    try {
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

async function createUser(req, res, next) {
  let firebaseUser = null;
  try {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = req.headers.authorization.split(" ")[1];

    // verifyIdToken will decode the token's claims is the promise is successful
    firebaseUser = await firebaseAdmin.auth().verifyIdToken(token);

    firebaseUser.email_verified = true;
  } catch (error) {
    const errorObject = new ResponseErrorFactory().create(401);
    res.status(401).json({
      errorMessage: `Error: (${errorObject.message}) Token is invalid`,
    });
  }
  try {
    if (firebaseUser) {
      let newUser = await new UserModel({
        email: firebaseUser.email,
        username: req.body.username,
        isAdmin: false,
        isDisabled: false,
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

async function findCurrentUser(req, res, next) {
  let firebaseUser = null;
  try {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = req.headers.authorization.split(" ")[1];

    // verifyIdToken will decode the token's claims is the promise is successful
    firebaseUser = await firebaseAdmin.auth().verifyIdToken(token);
  } catch (error) {
    // Error will likely throw here if sometime during a signed in user's app use, the ID token becomes
    // invalid/expired
    const errorObject = new ResponseErrorFactory().create(401);
    res.status(401).json({
      errorMessage: `Error: (${errorObject.message}) Your session appears to be invalid. Please sign in again.`,
    });
  }

  const user = await UserModel.findOne({ email: firebaseUser.email });
  if (!user) {
    // Shouldn't happen, but this will raise if there is a de-sync issue where the verified Firebase user doesn't exist in MongoDB...
    const errorObject = new ResponseErrorFactory().create(500);
    res.status(500).json({
      errorMessage: `Error: (${errorObject.message}) Unable to find user in database`,
    });
  } else if (user.isDisabled) {
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
