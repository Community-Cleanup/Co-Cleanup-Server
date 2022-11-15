// This code has been modified from Alex Holder's MERN Masterclass presented to Coder Academy on the 17th October, 2022
// Link Alex's Masterclass tutorial is: https://github.com/AlexHolderDeveloper/expressjs-class-oct-22

// The Admin SDK is a set of server libraries that let you interact with Firebase from root level environments
const firebaseAdmin = require("firebase-admin");

const UserModel = require("../Database/Models/userSchema");

// Set up the Firebase Client SDK
//const { firebaseClientConfig } = require("../../keys/firebaseClientKey");
//const firebaseClient = require("firebase/app");
// Adding the Firebase products that will be used
//const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
// Initialize the Firebase Client SDK
//firebaseClient.initializeApp(firebaseClientConfig);

async function createUser(req, res, next) {
  try {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = req.headers.authorization.split(" ")[1];

    // verifyIdToken will decode the token's claims is the promise is successful
    const firebaseUser = await firebaseAdmin.auth().verifyIdToken(token);

    firebaseUser.email_verified = true;
    let newUser = await new UserModel({
      email: firebaseUser.email,
      username: req.body.username,
      isAdmin: false,
      isDisabled: false,
    }).save();
    res.status(200).json(newUser);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      error: "Unauthorized",
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
    if (error.code == "auth/id-token-revoked") {
      console.log(
        "Error: You must sign in again to access this. Full error is: \n" +
          error
      );
    } else {
      console.log("Error: Session token is invalid. Full error is: \n" + error);
    }
    res.status(401).json({
      errorMessage: "Error: Unauthorized token",
    });
  }

  const user = await UserModel.findOne({ email: firebaseUser.email });
  if (!user) {
    // Shouldn't happen, but if the verified Firebase user doesn't exist in MongoDB...
    res.status(404).json({
      errorMessage:
        "Error: Verified Firebase user not found in MongoDB database",
    });
  } else if (user.isDisabled) {
    res.status(401).json({
      errorMessage:
        "Error: This user had been disabled by an administrator of Co Cleanup",
    });
  } else if (user) {
    // All is ok, respond with the user from MongoDB
    res.status(200).json(user);
  }
  next();
}

async function validateUserSession(headerToken) {
  let firebaseUser = null;
  try {
    // The authorization header will be in the format of string "Bearer [id token]",
    // so split out the ID token from the word "Bearer"
    const token = headerToken.split(" ")[1];

    // verifyIdToken will decode the token's claims is the promise is successful
    firebaseUser = await firebaseAdmin.auth().verifyIdToken(token);
  } catch (error) {
    if (error.code == "auth/id-token-revoked") {
      console.log(
        "Error: You must sign in again to access this. Full error is: \n" +
          error
      );
    } else {
      console.log("Error: Session token is invalid. Full error is: \n" + error);
    }
    return false;
  }

  const user = await UserModel.findOne({ email: firebaseUser.email });
  if (!user) {
    // Shouldn't happen, but if the verified Firebase user doesn't exist in MongoDB...
    console.log("Error: Verified Firebase user not found in MongoDB database");
    return false;
  } else if (user.isDisabled) {
    console.log(
      "Error: This user had been disabled by an administrator of Co Cleanup"
    );
    return false;
  } else if (user) {
    return true;
  }
}

// async function signUpUser(userDetails) {
//   // Use the Firebase Admin SDK to create the user
//   return firebaseAdmin
//     .auth()
//     .createUser({
//       email: userDetails.email, // User email address.
//       emailVerified: true, // Email verification feature is not in use
//       password: userDetails.password, // password. You'll never see this value even as project admin.
//       displayName: userDetails.displayName, // the username
//       // photoURL: "", // point to an image file hosted elsewhere
//       disabled: false, // if a user is banned/usable
//     })
//     .then(async (userRecord) => {
//       console.log(`\n Raw userRecord is ${JSON.stringify(userRecord)} \n`);

//       // Set "Custom Claims" on the new user
//       let defaultUserClaims = firebaseAdmin
//         .auth()
//         .setCustomUserClaims(userRecord.uid, { regularUser: true })
//         .then(() => {
//           console.log(
//             "Set a regularUser claim to the new user! They must log in again to get the new access."
//           );
//           // To Do
//           // You can do things like detect values in the email address (eg. if the new user email is the project admin email) and set the claim object to include other values.
//           // Claims allow you to handle authorization without ever giving the client any data that they could hack or manipulate.
//           // Of course, you can still pass the claims along to the client if you want to (eg. for front-end authorization to hide content), just know that front-end authorization isn't bulletproof.
//         });

//       return userRecord;
//     })
//     .catch((error) => {
//       console.log("Internal sign-up function error is: \n" + error);
//       return { error: error };
//     });
// }

// async function signInUser(userDetails) {
//   const firebaseClientAuth = getAuth();

//   let signInResult = signInWithEmailAndPassword(
//     firebaseClientAuth,
//     userDetails.email,
//     userDetails.password
//   )
//     .then(async (userCredential) => {
//       let userIdToken = await firebaseClientAuth.currentUser.getIdTokenResult(
//         false
//       );

//       console.log(`userIdToken obj is\n ${JSON.stringify(userIdToken)}`);

//       return {
//         idToken: userIdToken.token,
//         refreshToken: userCredential.user.refreshToken,
//         email: userCredential.user.email,
//         emailVerified: userCredential.user.emailVerified,
//         displayName: userCredential.user.displayName,
//         photoURL: userCredential.user.photoURL,
//         uid: userCredential.user.uid,
//       };
//     })
//     .catch((error) => {
//       console.log("Internal signin function error is: \n" + error);
//       return { error: error };
//     });

//   return signInResult;
// }

// async function validateUserSession(sessionDetails) {
//   let userRefreshToken = sessionDetails.refreshToken;
//   let userIdToken = sessionDetails.idToken;

//   return firebaseAdmin
//     .auth()
//     .verifyIdToken(userIdToken, true)
//     .then(async (decodedToken) => {
//       console.log(`Decoded session token is ${JSON.stringify(decodedToken)}`);

//       return {
//         isValid: true,
//         uid: decodedToken.uid,
//         fullDecodedToken: decodedToken,
//       };
//     })
//     .catch((error) => {
//       if (error.code == "auth/id-token-revoked") {
//         // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
//         console.log(
//           "You must sign in again to access this. Full error is: \n" + error
//         );
//       } else {
//         // Token is invalid.
//         console.log("Session token is invalid. Full error is: \n" + error);
//       }

//       return { error: error };
//     });
// }

module.exports = {
  createUser,
  findCurrentUser,
  // signUpUser,
  // signInUser,
  validateUserSession,
};
