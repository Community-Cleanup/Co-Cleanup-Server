const router = require("express").Router();
const UserModel = require("../Database/Models/userSchema");

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

module.exports = router;
