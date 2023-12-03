const bookModel = require("../models/book_model");
const userModel = require("../models/user_model");
const reviewModel = require("../models/review_model");
const mongoose = require("mongoose");

exports.getBooks = async (req, res) => {
  const { searchkeyword, rating, genre, sortby, sortorder } = req.query;
  try {
    if (Object.keys(req.query).length === 0) {
      await getTopAndRecentlyViewedBooks(req, res);
    }
    if (searchkeyword) {
      await getSearchedBooks(searchkeyword, res);
    }
    if (rating && genre && sortby && sortorder) {
      await getFilteredBooks(rating, genre, sortby, sortorder, res);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTopAndRecentlyViewedBooks = async (req, res) => {
  const topBooks = await bookModel
    .find()
    .sort({ rating: "descending" })
    .limit(5);
  const recentlyViewedBooks = await getUserRecentlyViewedBooks(req);
  res.send({ topBooks: topBooks, recentlyViewedBooks: recentlyViewedBooks });
};

const getUserRecentlyViewedBooks = async (req) => {
  const currentUser = await userModel
    .findById(req.userId)
    .populate("recentlyViewedBooks");
  const recentlyViewedBooks = currentUser.recentlyViewedBooks;
  return recentlyViewedBooks;
};

const getSearchedBooks = async (searchkeyword, res) => {
  const searchQuery = {
    $or: [
      { title: { $regex: searchkeyword, $options: "i" } },
      { author: { $regex: searchkeyword, $options: "i" } },
    ],
  };
  const books = await bookModel.find(searchQuery);
  res.json(books);
};

const getFilteredBooks = async (rating, genre, sortby, sortorder, res) => {
  const parsedRating = Number(rating);
  if (isNaN(parsedRating)) {
    return res.status(400).json({ message: "Error parsing rating value" });
  }
  if (parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ message: "Rating value out of range" });
  }
  const sortQuery = {};
  sortQuery[sortby] = sortorder;
  const books = await bookModel
    .find({
      genre: genre,
      rating: { $gt: parsedRating, $lt: parsedRating + 1 },
    })
    .sort(sortQuery);
  res.json(books);
};

exports.getBookDetails = async (req, res) => {
  const { bookId } = req.params;
  const reviews = await getBookReviews(bookId, res);
  const isBookReviewedByUser = await checkIfBookReviewedByUser(req, bookId);
  const isBookInUserFavorites = await checkIfBookInUserFavorites(req, bookId);
  res.json({
    bookReviews: reviews,
    isBookReviewedByUser: isBookReviewedByUser ? true : false,
    isBookInUserFavorites: isBookInUserFavorites ? true : false,
  });
};

const getBookReviews = async (bookId, res) => {
  if (
    !(await checkIfBookIdIsValid(bookId)) ||
    !(await checkIfBookExists(bookId))
  ) {
    return res.status(404).json({ message: "Book not found" });
  }
  const reviews = await reviewModel
    .find({ createdFor: bookId })
    .select("-createdFor")
    .populate("createdBy", "-_id firstName lastName")
    .sort({
      createdAT: "descending",
    });
  return reviews;
};

const checkIfBookIdIsValid = async (bookId) => {
  return mongoose.Types.ObjectId.isValid(bookId);
};

const checkIfBookExists = async (bookId) => {
  return await bookModel.findById(bookId);
};

const checkIfBookReviewedByUser = async (req, bookId) => {
  return await reviewModel.findOne({
    createdFor: bookId,
    createdBy: req.userId,
  });
};
const checkIfBookInUserFavorites = async (req, bookId) => {
  const currentUser = await userModel.findById(req.userId);
  return currentUser.favoriteBooks.includes(bookId);
};

exports.addNewBook = async (req, res) => {
  try {
    await saveBook(req, res);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const saveBook = async (req, res) => {
  const {
    title,
    author,
    contentURL,
    coverImageURL,
    genre,
    publicationDate,
    rating,
  } = req.body;
  const newBook = new bookModel({
    title,
    author,
    contentURL,
    coverImageURL,
    genre,
    publicationDate,
    rating,
  });
  const book = await newBook.save();
  res.status(201).json(book);
};
