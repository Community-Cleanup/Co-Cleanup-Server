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
