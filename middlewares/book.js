const mongoose = require("mongoose");
const bookModel = require("../models/book_model");

module.exports = bookVerification = async (req, res, next) => {
  let bookId;
  if (req.params.bookId) {
    bookId = req.params.bookId;
  } else if (req.body.bookId) {
    bookId = req.body.bookId;
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
  if (
    mongoose.Types.ObjectId.isValid(bookId) &&
    (await bookModel.findById(bookId))
  ) {
    next();
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
};
