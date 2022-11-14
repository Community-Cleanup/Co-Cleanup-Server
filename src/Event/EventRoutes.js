const router = require("express").Router();
const EventModel = require("../Database/Models/eventSchema");

router.post("/create-event", async (req, res) => {
  // Protected route: only signed in users should be able to create an event,
  // so check if the ID token exists before creating an event
  if (req.headers.authorization) {
    try {
      const newEvent = EventModel({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        address: req.body.address,
        coordinates: req.body.coordinates,
        user: req.body.userId,
      });
      const saveEvent = await newEvent.save();
      res.status(200).json(saveEvent);
    } catch (err) {
      console.log("An error occured:", err);
      res.json(err);
    }
  } else {
    res.status(401).json({ error: "Unauthorized" });
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
  try {
    const updateEvent = await EventModel.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    // To Do
    // This json seems to return the original document BEFORE the updated value, not AFTER the updated value,
    // may want to look into this later (but not a big problem)
    res.status(200).json(updateEvent);
  } catch (e) {
    res.json(e);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleteEvent = await EventModel.findByIdAndDelete(req.params.id);
    res.status(200).json("Event Deleted");
  } catch {
    res.json(e);
  }
});

module.exports = router;
