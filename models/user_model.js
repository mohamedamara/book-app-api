const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  favoriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }],
  recentlyViewedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("users", userSchema);
