const router = require("express").Router();
// Our Mongoose User model schema
const UserModel = require("../Database/Models/userSchema");
// Our Mongoose Event model schema
const EventModel = require("../Database/Models/eventSchema");

// Used for "protected" routes, this will be used to validate the current user's session, if it exists,
// and to check if they have the Co Cleanup admin user role
const { isValidAdminUserSession } = require("../User/UserValidators");

// Custom error handler that will generate an error response object depending on HTTP status codes
const ResponseErrorFactory = require("../ErrorHandling/ResponseError");

// PROTECTED ROUTE:
// only signed in ADMIN users only should be able to view the admin page
router.get("/", async (req, res) => {
  // To protect this route, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
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

// Retrieve all events. Note that although this end-point is in this 'admin' API resource,
// it doesn't need to be a protected route. Any user can see all events regardless (see ../Event/EventRoutes.js)
router.get("/events", async (req, res) => {
  try {
    // The search filter string coming in the from the search bar on the client app
    const searchQueryFilter = req.query.filter.trim();
    const regex = new RegExp(searchQueryFilter, "i"); // i for case insensitive
    // Retrieve all events that include the filter string in the event title (blank filter will retrieve all event documents)
    const foundEvents = await EventModel.find({ title: { $regex: regex } });
    res.status(200).json(foundEvents);
  } catch (err) {
    const errorObject = new ResponseErrorFactory().create(503);
    res.status(503).json({
      errorMessage: `Error: (${errorObject.message}) Unable to query database for events`,
    });
  }
});

// PROTECTED ROUTE:
// only signed in ADMIN should be able to delete an event
router.delete("/events/:id", async (req, res) => {
  // To protect this route, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
  // and if that succeeds, only then delete the event
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

// PROTECTED ROUTE:
// only signed in ADMIN should be able to update an event to delete ANYONE'S comment from the event
router.put("/events/:id", async (req, res) => {
  // To protect this route, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
  // and if that succeeds, only then update the event with the deleted comment
  if (await isValidAdminUserSession(req.headers.authorization)) {
    try {
      const event = await EventModel.findById(req.params.id);

      // Retrieve all comments on the event from the event model
      const comments = event.comments;
      // Remove the comment from the comments array based on the unique comment index value passed in the request body
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

// PROTECTED ROUTE:
// only signed in ADMIN users only should be able to query for every registered user
router.get("/users", async (req, res) => {
  // To protect this route, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
  // and if that succeeds, only then query for every (or filtered) registered user
  if (await isValidAdminUserSession(req.headers.authorization)) {
    // The search filter string coming in the from the search bar on the client app
    const searchQueryFilter = req.query.filter.trim();

    const regex = new RegExp(searchQueryFilter, "i"); // i for case insensitive

    let foundUsers = null;
    try {
      // Retrieve all users that include the filter string in the user's username OR (inclusive) their email address
      // (blank filter will retrieve all event documents)
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

// PROTECTED ROUTE:
// only signed in ADMIN users only should be able to update any user's MongoDB document
router.put("/users/:id", async (req, res) => {
  // To protect this route, validate the token (if it exists) from the header in our 'isValidAdminUserSession' function,
  // and if that succeeds, only then query for every (or filtered) registered user
  if (await isValidAdminUserSession(req.headers.authorization)) {
    try {
      // Change the user's 'disabled' status or their administrator role status, or both at once, depending on what's in the request body
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
