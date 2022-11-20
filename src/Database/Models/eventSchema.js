const mongoose = require("mongoose");

// Schema to create a model on Mongoose to hold details of Co Cleanup events and their comments

// Schema to structure the data
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    date: String,
    address: String,
    coordinates: Array,
    username: String,
    userId: String,
    attendees: Array,
    comments: Array,
  },
  { timestamps: true }
);

// The first parameter will become the name of the Collection, but lowercased and pluralised automatically
module.exports = mongoose.model("Event", eventSchema);
