const mongoose = require("mongoose");

// Schema to create a model on Mongoose to hold details of Co Cleanup registered users and their disabled and admin status
// Note that this model is independent of Firebase Auth and as such MongoDB will not store any Firebase auth/id tokens or passwords

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
    },
    isDisabled: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

// The first parameter will become the name of the Collection, but lowercased and pluralised automatically
module.exports = mongoose.model("User", userSchema);
