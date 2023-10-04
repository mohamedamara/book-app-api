const express = require("express");
const booksController = require("../controllers/books_controller");

const authVerification = require("../middlewares/auth");

const router = express.Router();

// @route     GET api/book
// @desc      Get books
// @access    Private
router.get("/books", authVerification, booksController.getBooks);

// @route     POST api/books
// @desc      Add new book
// @access    Public
router.post("/books", booksController.addNewBook);

module.exports = router;
