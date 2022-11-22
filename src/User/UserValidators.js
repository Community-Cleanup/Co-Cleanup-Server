// The Firebase Auth Admin SDK is a set of server libraries that let us interact with Firebase Auth with root/admin level security privileges
// based off the private credentials in our private env file
const firebaseAdmin = require("firebase-admin");

// Our Mongoose User model schema
const UserModel = require("../Database/Models/userSchema");

// For use by any protected routes in this whole API, this will verify that
// the user is signed in before attempted to do a particular CRUD operation on a protected route
async function isValidUserSession(authHeader) {
  if (!authHeader) {
    return false;
  }
  // The authorization header coming in from the client will be in the format of string "Bearer [id token]",
  // so split out the ID token from this string
  const token = authHeader.split(" ")[1];
  const result = await validateUserSession(token);
  return result;
}

// For use by any protected routes in this whole API, this will verify that
// the user is both signed in, AND HAS THE ADMININSTRATOR ROLE, before attempted to do a particular CRUD operation
// on a protected admin-only route
async function isValidAdminUserSession(authHeader) {
  if (!authHeader) {
    return false;
  }
  // The authorization header coming in from the client will be in the format of string "Bearer [id token]",
  // so split out the ID token from this string
  const token = authHeader.split(" ")[1];
  const result = await validateAdminUserSession(token);
  return result;
}

async function validateUserSession(token) {
  let firebaseUser = null;
  try {
    // verifyIdToken will decode the token's claims if the promise is successful
    // we just need the decoded user's email address from the token to compare against MongoDB
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
    // So finally only return true if the user is signed in and is not disabled
    return true;
  }
}

async function validateAdminUserSession(token) {
  let firebaseUser = null;
  try {
    // verifyIdToken will decode the token's claims if the promise is successful
    // we just need the decoded user's email address from the token to compare against MongoDB
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
    // So finally only return true if the user is signed in, and is not disabled, and has the administrator role
    return true;
  }
}

module.exports = {
  isValidUserSession,
  isValidAdminUserSession,
};
