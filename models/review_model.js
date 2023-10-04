const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  reviewContent: {
    type: String,
    required: true,
  },
  reviewRating: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  createdFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "books",
    required: true,
  },
  createdAT: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("reviews", reviewSchema);
