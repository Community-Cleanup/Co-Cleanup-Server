const router = require("express").Router();
const EventModel = require("../Database/Models/eventSchema");

const { isValidUserSession } = require("../User/UserValidators");

router.post("/create-event", async (req, res) => {
  // Protected route: only signed in (regular or admin) users should be able to create an event.
  // To do that, validate the token (if it exists) from the header in our 'isValidUserSession' function,
  // and if that succeeds, only then create an event
  if (await isValidUserSession(req.headers.authorization)) {
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
      const errorObject = new ResponseErrorFactory().create(503);
      res.status(503).json({
        errorMessage: `Error: (${errorObject.message}) Unable to query database to create event`,
      });
    }
  } else {
    const errorObject = new ResponseErrorFactory().create(403);
    res.status(403).json({
      errorMessage: `Error: (${errorObject.message}) Permission denied`,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const allEvents = await EventModel.find(req.query);
    res.status(200).json(allEvents);
  } catch (err) {
    const errorObject = new ResponseErrorFactory().create(503);
    res.status(503).json({
      errorMessage: `Error: (${errorObject.message}) Unable to query database for events`,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.id);
    res.status(200).json(event);
  } catch (err) {
    const errorObject = new ResponseErrorFactory().create(503);
    res.status(503).json({
      errorMessage: `Error: (${errorObject.message}) Unable to query database for an event`,
    });
  }
});

router.put("/:id", async (req, res) => {
  // Protected route: only signed in (regular or admin) users should be able to update an event,
  // or add/delete comments in an event.
  // To do that, validate the token (if it exists) from the header in our 'isValidUserSession' function,
  // and if that succeeds, only then create an event
  //
  // Caution:
  // Note that this validation isn't currently checking if a signed in user is only trying to update their own event or comment,
  // so for this route, potentially any signed-in malicious users could find and pass in any valid event id (i.e. 'req.params.id') in the request
  // to update anyones' events or comments
  if (await isValidUserSession(req.headers.authorization)) {
    try {
      const updateEvent = await EventModel.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json(updateEvent);
    } catch (err) {
      const errorObject = new ResponseErrorFactory().create(503);
      res.status(503).json({
        errorMessage: `Error: (${errorObject.message}) Unable to query database to update an event`,
      });
    }
  } else {
    const errorObject = new ResponseErrorFactory().create(403);
    res.status(403).json({
      errorMessage: `Error: (${errorObject.message}) Permission denied`,
    });
  }
});

router.delete("/:id", async (req, res) => {
  // Protected route: only signed in users should be able to delete their own event.
  // To do that, validate the token (if it exists) from the header in our 'isValidUserSession' function,
  // and if that succeeds, only then create an event
  //
  // Caution:
  // Note that this validation isn't currently checking if a signed in user is only trying to delete their own event,
  // so for this route, potentially any signed-in malicious user could find and pass in any valid event id (i.e.'req.params.id') in the
  // request to delete anyones' events.
  if (await isValidUserSession(req.headers.authorization)) {
    try {
      const deleteEvent = await EventModel.findByIdAndDelete(req.params.id);
      res.status(200).json("Event Deleted");
    } catch (err) {
      const errorObject = new ResponseErrorFactory().create(503);
      res.status(503).json({
        errorMessage: `Error: (${errorObject.message}) Unable to query database to delete an event`,
      });
    }
  } else {
    const errorObject = new ResponseErrorFactory().create(403);
    res.status(403).json({
      errorMessage: `Error: (${errorObject.message}) Permission denied`,
    });
  }
});

module.exports = router;
