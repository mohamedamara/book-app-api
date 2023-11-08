const express = require("express");
const usersController = require("../controllers/users_controller");
const {
  registerNewUserValidation,
} = require("../middlewares/validators/users_route_validation");
const authVerification = require("../middlewares/auth");

const router = express.Router();

// @route     GET api/users
// @desc      get user's profile info
// @access    Private
router.get("/users", authVerification, usersController.getProfileInfo);

// @route     POST api/users
// @desc      Register a user
// @access    Public
router.post(
  "/users",
  registerNewUserValidation,
  usersController.registerNewUser
);

// @route     GET api/favoritebooks
// @desc      Get user favorite books
// @access    Private
router.get(
  "/favoritebooks",
  authVerification,
  usersController.getUserFavoriteBooks
);

// @route     POST api/favoritebooks
// @desc      add book to favorites
// @access    Private
router.post(
  "/favoritebooks",
  authVerification,
  usersController.addBookToFavorites
);

// @route     DELETE api/favoritebooks
// @desc      delete book from favorites
// @access    Private
router.delete(
  "/favoritebooks",
  authVerification,
  usersController.deleteBookFromFavorites
);

// @route     POST api/recentlyviewedbooks
// @desc      add book to recents
// @access    Private
router.post(
  "/recentlyviewedbooks",
  authVerification,
  usersController.addBookToRecents
);

module.exports = router;
