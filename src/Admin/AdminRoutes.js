const router = require("express").Router();
const UserModel = require("../Database/Models/userSchema");
const EventModel = require("../Database/Models/eventSchema");

const { validateAdminUserSession } = require("../User/UserFunctions");

router.get("/", async (req, res) => {
  // Protected route: only signed in ADMIN users only should be able to view the admin page
  // To do that, validate the token (if it exists) from the header in our 'validateAdminUserSession' function,
  // and if that succeeds, only then display the admin page
  if (
    req.headers.authorization &&
    (await validateAdminUserSession(req.headers.authorization))
  ) {
    res.status(200).json();
  } else {
    res.status(401).json({
      errorMessage: "Error: Unauthorized",
    });
  }
});

router.get("/events", async (req, res) => {
  try {
    const searchQueryFilter = req.query.filter.trim();
    const regex = new RegExp(searchQueryFilter, "i"); // i for case insensitive
    const foundEvents = await EventModel.find({ title: { $regex: regex } });
    res.status(200).json(foundEvents);
  } catch (e) {
    res.json(e);
  }
});

router.delete("/events/:id", async (req, res) => {
  if (
    req.headers.authorization &&
    (await validateAdminUserSession(req.headers.authorization))
  ) {
    try {
      const deleteEvent = await EventModel.findByIdAndDelete(req.params.id);
      res.status(200).json(deleteEvent);
    } catch {
      res.json(e);
    }
  } else {
    res.status(401).json({
      errorMessage: "Error: Unauthorized",
    });
  }
});

router.get("/users", async (req, res) => {
  // Protected route: only signed in ADMIN users only should be able to query for every registered user
  // To do that, validate the token (if it exists) from the header in our 'validateAdminUserSession' function,
  // and if that succeeds, only then query for every (or filtered) registered user
  if (
    req.headers.authorization &&
    (await validateAdminUserSession(req.headers.authorization))
  ) {
    const searchQueryFilter = req.query.filter.trim();

    const regex = new RegExp(searchQueryFilter, "i"); // i for case insensitive

    let foundUsers = null;
    try {
      foundUsers = await UserModel.find({
        $or: [{ username: { $regex: regex } }, { email: { $regex: regex } }],
      });
      res.status(200).json(foundUsers);
    } catch (e) {
      res.json(e);
    }
  } else {
    res.status(401).json({
      errorMessage: "Error: Unauthorized",
    });
  }
});

router.put("/users/:id", async (req, res) => {
  // Protected route: only signed in ADMIN users only should be able to update any user's MongoDB document
  // To do that, validate the token (if it exists) from the header in our 'validateAdminUserSession' function,
  // and if that succeeds, only then query for every (or filtered) registered user
  if (
    req.headers.authorization &&
    (await validateAdminUserSession(req.headers.authorization))
  ) {
    try {
      const updateUser = await UserModel.findByIdAndUpdate(req.params.id, {
        isDisabled: req.body.isDisabled,
        isAdmin: req.body.isAdmin,
      });
      res.status(200).json(updateUser);
    } catch (e) {
      res.json(e);
    }
  } else {
    res.status(401).json({
      errorMessage: "Error: Unauthorized",
    });
  }
});

module.exports = router;
