const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user_model");
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
  const reviews = await reviewModel
    .find({ createdBy: req.userId })
    .select("-createdBy")
    .populate("createdFor")
    .sort({
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
    if (await checkIfBookAlreadyInFavorites(req, res)) {
      return res
        .status(409)
        .json({ message: "Book already in user's favorites" });
    } else {
      updatedUser = await userModel.findOneAndUpdate(
        { _id: req.userId },
        { $push: { favoriteBooks: req.params.bookId } },
        { new: true }
      );
      res.status(200).json({ favoriteBooks: updatedUser.favoriteBooks });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteBookFromFavorites = async (req, res) => {
  try {
    if (!(await checkIfBookAlreadyInFavorites(req, res))) {
      return res
        .status(409)
        .json({ message: "Book is not in user's favorites" });
    } else {
      updatedUser = await userModel.findOneAndUpdate(
        { _id: req.userId },
        { $pull: { favoriteBooks: req.params.bookId } },
        { new: true }
      );
      res.status(200).json({ favoriteBooks: updatedUser.favoriteBooks });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkIfBookAlreadyInFavorites = async (req, res) => {
  const currentUser = await userModel.findById(req.userId);
  return currentUser.favoriteBooks.includes(req.params.bookId);
};

exports.addBookToRecents = async (req, res) => {
  try {
    if (await checkIfBookAlreadyInRecents(req, res)) {
      return res
        .status(409)
        .json({ message: "Book already in user's recents" });
    }
    await updateUserRecentlyViewedBooks(req, res);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkIfBookAlreadyInRecents = async (req, res) => {
  const currentUser = await userModel.findById(req.userId);
  return currentUser.recentlyViewedBooks.includes(req.params.bookId);
};

const updateUserRecentlyViewedBooks = async (req, res) => {
  const updatedUser = await userModel.findOneAndUpdate(
    { _id: req.userId },
    { $push: { recentlyViewedBooks: req.params.bookId } },
    { new: true }
  );
  res
    .status(200)
    .json({ recentlyViewedBooks: updatedUser.recentlyViewedBooks });
};
