const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/user_model");
const bookModel = require("../models/book_model");
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

exports.getUserFavoriteBooks = async (req, res) => {
  try {
    const currentUser = await userModel
      .findById(req.userId)
      .populate("favoriteBooks");
    const favoriteBooks = currentUser.favoriteBooks;
    res.json(favoriteBooks);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addBookToFavorites = async (req, res) => {
  try {
    checkIfBookIdIsValid(req, res);
    await checkIfBookExists(req, res);
    await checkIfBookAlreadyInFavorites(req, res);
    await updateUserFavorites(req, res);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkIfBookIdIsValid = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.bookId))
    return res.status(404).json({ message: "Book not found" });
};

const checkIfBookExists = async (req, res) => {
  const book = await bookModel.findById(req.body.bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });
};

const checkIfBookAlreadyInFavorites = async (req, res) => {
  const currentUser = await userModel.findById(req.userId);
  if (currentUser.favoriteBooks.includes(req.body.bookId))
    return res
      .status(409)
      .json({ message: "Book already in user's favorites" });
};

const updateUserFavorites = async (req, res) => {
  const updatedUser = await userModel.findOneAndUpdate(
    { _id: req.userId },
    { $push: { favoriteBooks: req.body.bookId } },
    { new: true }
  );
  res.status(200).json({ favoriteBooks: updatedUser.favoriteBooks });
};
