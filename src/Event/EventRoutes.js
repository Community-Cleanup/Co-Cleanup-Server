const router = require("express").Router();
const EventModel = require("../Database/Models/eventSchema");

const { validateUserSession } = require("../User/UserFunctions");

router.post("/create-event", async (req, res) => {
  // Protected route: only signed in users should be able to create an event.
  // To do that, validate the token (if it exists) from the header in our 'validateUserSession' function,
  // and if that succeeds, only then create an event
  if (
    req.headers.authorization &&
    (await validateUserSession(req.headers.authorization))
  ) {
    try {
      const newEvent = EventModel({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        address: req.body.address,
        coordinates: req.body.coordinates,
        username: req.body.username,
        userId: req.body.userId,
        attendees: req.body.attendees,
        comments: req.body.comments,
      });
      const saveEvent = await newEvent.save();
      res.status(200).json(saveEvent);
    } catch (err) {
      console.log("An error occured:", err);
      res.json(err);
    }
  } else {
    res.status(401).json({ errorMessage: "Error: Unauthorized" });
  }
});

router.get("/", async (req, res) => {
  try {
    const allEvents = await EventModel.find(req.query);
    res.status(200).json(allEvents);
  } catch (e) {
    res.json(e);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.id);
    res.status(200).json(event);
  } catch (e) {
    res.json(e);
  }
});

router.put("/:id", async (req, res) => {
  // Protected route: only signed in users should be able to update an event,
  // or add/delete comments in an event.
  // To do that, validate the token (if it exists) from the header in our 'validateUserSession' function,
  // and if that succeeds, only then create an event
  //
  // Note that this validation isn't currently checking if a signed in user is only trying to update their own event or comment,
  // so potentially a signed-in 'hacker' could pass in any valid event id (i.e. 'req.params.id') in the request to update anyones' events or comments
  if (
    req.headers.authorization &&
    (await validateUserSession(req.headers.authorization))
  ) {
    try {
      const updateEvent = await EventModel.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json(updateEvent);
    } catch (e) {
      res.json(e);
    }
  } else {
    res.status(401).json({ errorMessage: "Error: Unauthorized" });
  }
});

router.delete("/:id", async (req, res) => {
  // Protected route: only signed in users should be able to delete their own event.
  // To do that, validate the token (if it exists) from the header in our 'validateUserSession' function,
  // and if that succeeds, only then create an event
  //
  // Note that this validation isn't currently checking if a signed in user is only trying to delete their own event,
  // so potentially a signed-in 'hacker' could pass in any valid event id (i.e.'req.params.id') in the request to delete anyones' events.
  if (
    req.headers.authorization &&
    (await validateUserSession(req.headers.authorization))
  ) {
    try {
      const deleteEvent = await EventModel.findByIdAndDelete(req.params.id);
      res.status(200).json("Event Deleted");
    } catch {
      res.json(e);
    }
  } else {
    res.status(401).json({ errorMessage: "Error: Unauthorized" });
  }
});

module.exports = router;
