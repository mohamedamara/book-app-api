const express = require("express");
const usersController = require("../controllers/users_controller");
const {
  registerNewUserValidation,
} = require("../middlewares/validators/users_route_validation");
const authVerification = require("../middlewares/auth");
const bookVerification = require("../middlewares/book");

const router = express.Router();

// @route     GET api/users
// @desc      get user's profile info
// @access    Private
router.get("/users", authVerification, usersController.getProfileInfo);

// @route     POST api/users
// @desc      Register a new user
// @access    Public
router.post(
  "/users",
  registerNewUserValidation,
  usersController.registerNewUser
);

// @route     GET api/favoritebooks
// @desc      Get user's favorite books
// @access    Private
router.get(
  "/favorite-books",
  authVerification,
  usersController.getUserFavoriteBooks
);

// @route     POST api/favoritebooks
// @desc      add book to user's favorites
// @access    Private
router.post(
  "/favorite-books/:bookId",
  authVerification,
  bookVerification,
  usersController.addBookToFavorites
);

// @route     DELETE api/favoritebooks
// @desc      delete book from user's favorites
// @access    Private
router.delete(
  "/favorite-books/:bookId",
  authVerification,
  bookVerification,
  usersController.deleteBookFromFavorites
);

// @route     POST api/recentlyviewedbooks
// @desc      add book to user's recents
// @access    Private
router.post(
  "/recently-viewed-books/:bookId",
  authVerification,
  bookVerification,
  usersController.addBookToRecents
);

module.exports = router;
