const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  contentURL: {
    type: String,
    required: true,
  },
  coverImageURL: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    default: "other",
  },
  publicationDate: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: mongoose.Types.Decimal128,
    default: 0,
  },
});

module.exports = mongoose.model("books", bookSchema);
