const mongoose = require("mongoose");
const utils = require("../utils/utils");

const reviewSchema = mongoose.Schema(
  {
    reviewContent: {
      type: String,
      required: true,
    },
    reviewRating: {
      type: mongoose.Types.Decimal128,
      required: true,
      get: utils.formatRating,
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
    id: false,
  },
  { toJSON: { getters: true } }
);

module.exports = mongoose.model("reviews", reviewSchema);
