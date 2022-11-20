// This script can be executed when needed to seed a default user account into Co Cleanup that will automatically have the administrator user role
// for Co Cleanup
// Because, of course, Co Cleanup app needs at least one administrator user account for that account to be able to assign other users the admin role

// Steps to run:
// 1. Populate your private env file with the following details, replacing the respective values:
//
//    FIREBASE_ADMIN_PROJECT_ID="project ID"
//    FIREBASE_ADMIN_PRIVATE_KEY="Firebase private key"
//    FIREBASE_ADMIN_CLIENT_EMAIL="Firebase client email"
//    DATABASE_URI="MongoDB connection string"
//    SEED_ADMIN_USER_USERNAME="The username of your admin user"
//    SEED_ADMIN_USER_EMAIL="The email address of your admin user"
//    SEED_ADMIN_USER_PASSWORD="The plain text password of your admin user"
//
//  Note that the chosen seed user email and password values must still conform to Firebase requirements (e.g. password min. 6 characters, etc.)
//
// 2. From a Linux/Mac terminal, CD to the root level of this project directory, and enter the following command:
// `npm run seed-admin-user` (without the quotes)

const { server } = require("../index");

const firebaseAdmin = require("firebase-admin");

const UserModel = require("../Database/Models/userSchema");

const seedAdminUsername = process.env.SEED_ADMIN_USER_USERNAME;
const seedAdminEmail = process.env.SEED_ADMIN_USER_EMAIL;
const seedAdminPassword = process.env.SEED_ADMIN_USER_PASSWORD;

let firebaseUserRecord = async () => {
  try {
    userRecord = await firebaseAdmin.auth().createUser({
      email: seedAdminEmail, // Seeded admin user email address.
      emailVerified: true, // Email verification feature is not in use
      password: seedAdminPassword, // Seeded admin user password in plain text.
    });
    console.log("Admin user seed successfully saved to Firebase");
    console.log("Raw UserRecord is", userRecord);
    return userRecord;
  } catch (error) {
    console.log("Internal Firebase user seed function error is: \n" + error);
    return null;
  }
};

(async () => {
  try {
    await firebaseUserRecord();
    await new UserModel({
      email: seedAdminEmail,
      username: seedAdminUsername,
      isAdmin: true,
      isDisabled: false,
    }).save();
    console.log(
      "Admin user seed successfully saved to MongoDB with property isAdmin: true"
    );
    console.log("User seed complete");

    // Close Express server as we've finished with the seeding
    server.close(() => {
      console.log("Server closed. You can now close this terminal.");
    });
  } catch (error) {
    console.log("Error saving admin user seed to MongoDB", error);
  }
})();
