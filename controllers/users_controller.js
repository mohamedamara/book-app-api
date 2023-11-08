const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/user_model");
const bookModel = require("../models/book_model");
const reviewModel = require("../models/review_model");
require("dotenv").config();

exports.registerNewUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (user) return res.status(409).json({ message: "User already exists" });
    req.body.password = await hashPassword(password);
    await saveUser(req.body, res);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const saveUser = async (requestData, res) => {
  const { firstName, lastName, email, password } = requestData;
  const newUser = new userModel({
    firstName,
    lastName,
    email,
    password,
  });
  await newUser.save();
  const jwt = generateJsonWebToken(newUser.id);
  res.status(201).json({ jwt });
};

const generateJsonWebToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "365d" }
  );
};

exports.getProfileInfo = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.userId)
      .select(["-password", "-favoriteBooks", "-recentlyViewedBooks"]);
    const reviews = await getUserReviews(req);
    res.json({ userInfo: user, userReviews: reviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserReviews = async (req) => {
  const reviews = await reviewModel.find({ createdBy: req.userId }).sort({
    createdAT: "descending",
  });
  return reviews;
};

exports.getUserFavoriteBooks = async (req, res) => {
  try {
    const currentUser = await userModel
      .findById(req.userId)
      .populate("favoriteBooks");
    const favoriteBooks = currentUser.favoriteBooks;
    res.json(favoriteBooks);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addBookToFavorites = async (req, res) => {
  try {
    if (!(await checkIfBookIdIsValid(req)) || !(await checkIfBookExists(req))) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (await checkIfBookAlreadyInFavorites(req, res)) {
      return res
        .status(409)
        .json({ message: "Book already in user's favorites" });
    }
    await updateUserFavorites(false, req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteBookFromFavorites = async (req, res) => {
  try {
    if (!(await checkIfBookIdIsValid(req)) || !(await checkIfBookExists(req))) {
      return res.status(404).json({ message: "Book not found" });
    }
    await updateUserFavorites(true, req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addBookToRecents = async (req, res) => {
  try {
    if (!(await checkIfBookIdIsValid(req)) || !(await checkIfBookExists(req))) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (await checkIfBookAlreadyInRecent(req, res)) {
      return res
        .status(409)
        .json({ message: "Book already in user's recents" });
    }
    await updateUserRecentlyViewedBooks(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkIfBookIdIsValid = async (req) => {
  return mongoose.Types.ObjectId.isValid(req.body.bookId);
};

const checkIfBookExists = async (req) => {
  return await bookModel.findById(req.body.bookId);
};

const checkIfBookAlreadyInFavorites = async (req, res) => {
  const currentUser = await userModel.findById(req.userId);
  return currentUser.favoriteBooks.includes(req.body.bookId);
};

const checkIfBookAlreadyInRecent = async (req, res) => {
  const currentUser = await userModel.findById(req.userId);
  return currentUser.recentlyViewedBooks.includes(req.body.bookId);
};

const updateUserFavorites = async (isDelete, req, res) => {
  let updatedUser;
  if (isDelete) {
    updatedUser = await userModel.findOneAndUpdate(
      { _id: req.userId },
      { $pull: { favoriteBooks: req.body.bookId } },
      { new: true }
    );
  } else {
    updatedUser = await userModel.findOneAndUpdate(
      { _id: req.userId },
      { $push: { favoriteBooks: req.body.bookId } },
      { new: true }
    );
  }
  res.status(200).json({ favoriteBooks: updatedUser.favoriteBooks });
};

const updateUserRecentlyViewedBooks = async (req, res) => {
  const updatedUser = await userModel.findOneAndUpdate(
    { _id: req.userId },
    { $push: { recentlyViewedBooks: req.body.bookId } },
    { new: true }
  );
  res
    .status(200)
    .json({ recentlyViewedBooks: updatedUser.recentlyViewedBooks });
};
