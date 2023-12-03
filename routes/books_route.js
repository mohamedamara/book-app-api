const express = require("express");
const booksController = require("../controllers/books_controller");

const authVerification = require("../middlewares/auth");

const router = express.Router();

// @route     GET api/book
// @desc      Get books
// @access    Private
router.get("/books", authVerification, booksController.getBooks);

// @route     GET api/book/:id/book-details
// @desc      Get book details
// @access    Private
router.get("/books/:bookId/book-details", authVerification, booksController.getBookDetails);

// @route     POST api/books
// @desc      Add new book
// @access    Public
router.post("/books", booksController.addNewBook);

module.exports = router;
