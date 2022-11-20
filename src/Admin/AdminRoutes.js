const router = require("express").Router();
const UserModel = require("../Database/Models/userSchema");
const EventModel = require("../Database/Models/eventSchema");

const { isValidAdminUserSession } = require("../User/UserValidators");

const ResponseErrorFactory = require("../ErrorHandling/ResponseError");

router.get("/", async (req, res) => {
  // Protected route: only signed in ADMIN users only should be able to view the admin page
  // To do that, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
  // and if that succeeds, only then display the admin page
  if (await isValidAdminUserSession(req.headers.authorization)) {
    res.status(200).json();
  } else {
    const errorObject = new ResponseErrorFactory().create(403);
    res.status(403).json({
      errorMessage: `Error: (${errorObject.message}) Permission denied`,
    });
  }
});

router.get("/events", async (req, res) => {
  try {
    const searchQueryFilter = req.query.filter.trim();
    const regex = new RegExp(searchQueryFilter, "i"); // i for case insensitive
    const foundEvents = await EventModel.find({ title: { $regex: regex } });
    res.status(200).json(foundEvents);
  } catch (err) {
    const errorObject = new ResponseErrorFactory().create(503);
    res.status(503).json({
      errorMessage: `Error: (${errorObject.message}) Unable to query database for events`,
    });
  }
});

router.delete("/events/:id", async (req, res) => {
  // Protected route: only signed in ADMIN should be able to delete an event
  // To do that, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
  // and if that succeeds, only then update the event with the deleted comment
  if (await isValidAdminUserSession(req.headers.authorization)) {
    try {
      const deleteEvent = await EventModel.findByIdAndDelete(req.params.id);
      res.status(200).json(deleteEvent);
    } catch (err) {
      const errorObject = new ResponseErrorFactory().create(503);
      res.status(503).json({
        errorMessage: `Error: (${errorObject.message}) Unable to query database to delete event`,
      });
    }
  } else {
    const errorObject = new ResponseErrorFactory().create(403);
    res.status(403).json({
      errorMessage: `Error: (${errorObject.message}) Permission denied`,
    });
  }
});

router.put("/events/:id", async (req, res) => {
  // Protected route: only signed in ADMIN should be able to update an event to delete a comment
  // To do that, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
  // and if that succeeds, only then update the event with the deleted comment
  if (await isValidAdminUserSession(req.headers.authorization)) {
    try {
      const event = await EventModel.findById(req.params.id);

      const comments = event.comments;
      comments.splice(req.body.eventCommentIndex, 1);

      event.comments = comments;
      await event.save();
      res.status(200).json(event);
    } catch (err) {
      const errorObject = new ResponseErrorFactory().create(503);
      res.status(503).json({
        errorMessage: `Error: (${errorObject.message}) Unable to query database to update event`,
      });
    }
  } else {
    const errorObject = new ResponseErrorFactory().create(403);
    res.status(403).json({
      errorMessage: `Error: (${errorObject.message}) Permission denied`,
    });
  }
});

router.get("/users", async (req, res) => {
  // Protected route: only signed in ADMIN users only should be able to query for every registered user
  // To do that, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
  // and if that succeeds, only then query for every (or filtered) registered user
  if (await isValidAdminUserSession(req.headers.authorization)) {
    const searchQueryFilter = req.query.filter.trim();

    const regex = new RegExp(searchQueryFilter, "i"); // i for case insensitive

    let foundUsers = null;
    try {
      foundUsers = await UserModel.find({
        $or: [{ username: { $regex: regex } }, { email: { $regex: regex } }],
      });
      res.status(200).json(foundUsers);
    } catch (err) {
      const errorObject = new ResponseErrorFactory().create(503);
      res.status(503).json({
        errorMessage: `Error: (${errorObject.message}) Unable to query database for users`,
      });
    }
  } else {
    const errorObject = new ResponseErrorFactory().create(403);
    res.status(403).json({
      errorMessage: `Error: (${errorObject.message}) Permission denied`,
    });
  }
});

router.put("/users/:id", async (req, res) => {
  // Protected route: only signed in ADMIN users only should be able to update any user's MongoDB document
  // To do that, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
  // and if that succeeds, only then query for every (or filtered) registered user
  if (await isValidAdminUserSession(req.headers.authorization)) {
    try {
      const updateUser = await UserModel.findByIdAndUpdate(req.params.id, {
        isDisabled: req.body.isDisabled,
        isAdmin: req.body.isAdmin,
      });
      res.status(200).json(updateUser);
    } catch (err) {
      const errorObject = new ResponseErrorFactory().create(503);
      res.status(503).json({
        errorMessage: `Error: (${errorObject.message}) Unable to query database to update user`,
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
