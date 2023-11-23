const bookModel = require("../models/book_model");
const userModel = require("../models/user_model");

exports.getBooks = async (req, res) => {
  const { searchkeyword, genre, sortby, sortorder } = req.query;
  try {
    if (Object.keys(req.query).length === 0) {
      await getTopAndRecentlyViewedBooks(req, res);
    }
    if (searchkeyword) {
      await getSearchedBooks(searchkeyword, res);
    }
    if (genre && sortby && sortorder) {
      await getFilteredBooks(genre, sortby, sortorder, res);
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

const getFilteredBooks = async (genre, sortby, sortorder, res) => {
  const sortQuery = {};
  sortQuery[sortby] = sortorder;
  const books = await bookModel.find({ genre: genre }).sort(sortQuery);
  res.json(books);
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
