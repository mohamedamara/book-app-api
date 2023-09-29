const express = require("express");
const usersController = require("../controllers/users_controller");
const {
  registerNewUserValidation,
} = require("../middlewares/validators/users_route_validation");

const router = express.Router();

// @route     POST api/users
// @desc      Register a user
// @access    Public
router.post(
  "/users",
  registerNewUserValidation,
  usersController.registerNewUser
);

module.exports = router;
