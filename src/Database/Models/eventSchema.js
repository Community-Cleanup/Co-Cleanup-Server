const mongoose = require("mongoose");

// Schema to structure the data
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: Number,
  address: String,
  coordinates: Array,
  user: String,
});

// const EventModel = mongoose.model("Event", eventSchema);
// module.exports = { EventModel };

// The first parameter will become the name of the Collection, but lowercased and pluralised automatically
module.exports = mongoose.model("Event", eventSchema);