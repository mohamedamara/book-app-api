const express = require("express");
const usersController = require("../controllers/users_controller");
const {
  registerNewUserValidation,
} = require("../middlewares/validators/users_route_validation");
const authVerification = require("../middlewares/auth");

const router = express.Router();

// @route     POST api/users
// @desc      Register a user
// @access    Public
router.post(
  "/users",
  registerNewUserValidation,
  usersController.registerNewUser
);

// @route     GET api/favoritebook
// @desc      Get user favorite books
// @access    Private
router.get(
  "/favoritebooks",
  authVerification,
  usersController.getUserFavoriteBooks
);

// @route     POST api/favoritebook
// @desc      add book to favorites
// @access    Private
router.post(
  "/favoritebooks",
  authVerification,
  usersController.addBookToFavorites
);

module.exports = router;
