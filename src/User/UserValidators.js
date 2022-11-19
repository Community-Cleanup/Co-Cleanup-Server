// The Admin SDK is a set of server libraries that let you interact with Firebase from root level environments
const firebaseAdmin = require("firebase-admin");

const UserModel = require("../Database/Models/userSchema");

async function validateUserSession(headerToken) {
  let firebaseUser = null;
  try {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = headerToken.split(" ")[1];

    // verifyIdToken will decode the token's claims is the promise is successful
    firebaseUser = await firebaseAdmin.auth().verifyIdToken(token);
  } catch (error) {
    return false;
  }

  const user = await UserModel.findOne({ email: firebaseUser.email });
  if (!user) {
    // Shouldn't happen, but this will raise if there is a de-sync issue where the verified Firebase user doesn't exist in MongoDB...
    return false;
  } else if (user.isDisabled) {
    // User has been disabled by an administrator of the app
    return false;
  } else if (user) {
    // Else user session is valid and their account isn't disabled, so return true
    return true;
  }
}

async function validateAdminUserSession(headerToken) {
  let firebaseUser = null;
  try {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = headerToken.split(" ")[1];

    // verifyIdToken will decode the token's claims is the promise is successful
    firebaseUser = await firebaseAdmin.auth().verifyIdToken(token);
  } catch (error) {
    return false;
  }

  const user = await UserModel.findOne({ email: firebaseUser.email });
  if (!user) {
    // Shouldn't happen, but this will raise if there is a de-sync issue where the verified Firebase user doesn't exist in MongoDB...
    return false;
  } else if (user.isDisabled) {
    // User has been disabled by an administrator of the app
    return false;
  } else if (!user.isAdmin) {
    // The user does not have the administrator role
    return false;
  } else if (user) {
    // Else user's session is valid, and their account isn't disabled, and they have the administrator role, so return true
    return true;
  }
}

module.exports = { validateUserSession, validateAdminUserSession };
