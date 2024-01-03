const bookModel = require("../models/book_model");
const userModel = require("../models/user_model");
const reviewModel = require("../models/review_model");

exports.getBooks = async (req, res) => {
  const {
    "search-keyword": searchKeyword,
    rating,
    genre,
    "sort-by": sortBy,
    "sort-order": sortOrder,
  } = req.query;
  try {
    if (Object.keys(req.query).length === 0) {
      await getTopAndRecentlyViewedBooks(req, res);
    }
    if (searchKeyword) {
      await getSearchedBooks(searchKeyword, res);
    }
    if (rating && genre && sortBy && sortOrder) {
      await getFilteredBooks(rating, genre, sortBy, sortOrder, res);
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
  const recentlyViewedBooks = currentUser.recentlyViewedBooks.slice(0, 10);
  return recentlyViewedBooks;
};

const getSearchedBooks = async (searchKeyword, res) => {
  const searchQuery = {
    $or: [
      { title: { $regex: searchKeyword, $options: "i" } },
      { author: { $regex: searchKeyword, $options: "i" } },
    ],
  };
  const books = await bookModel.find(searchQuery);
  res.json(books);
};

const getFilteredBooks = async (rating, genre, sortBy, sortOrder, res) => {
  const parsedRating = Number(rating);
  if (isNaN(parsedRating)) {
    return res.status(400).json({ message: "Error parsing rating value" });
  }
  if (parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ message: "Rating value out of range" });
  }
  const sortQuery = {};
  sortQuery[sortBy] = sortOrder;
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
  const bookReviews = await getBookReviews(bookId, res);
  const userReviewForThisBook = await getUserReviewForThisBook(req, bookId);
  const isBookInUserFavorites = await checkIfBookInUserFavorites(req, bookId);
  const isBookInUserRecents = await checkIfBookInUserRecents(req, bookId);
  res.json({
    bookReviews: bookReviews,
    userReviewForThisBook: userReviewForThisBook,
    isBookInUserFavorites: isBookInUserFavorites ? true : false,
    isBookInUserRecents: isBookInUserRecents ? true : false,
  });
};

const getBookReviews = async (bookId, res) => {
  const reviews = await reviewModel
    .find({ createdFor: bookId })
    .select("-createdFor")
    .populate("createdBy", "-_id firstName lastName email")
    .sort({
      createdAT: "descending",
    });
  return reviews;
};

const getUserReviewForThisBook = async (req, bookId) => {
  return await reviewModel
    .findOne({
      createdFor: bookId,
      createdBy: req.userId,
    })
    .select("-createdFor")
    .populate("createdBy", "-_id firstName lastName email");
};

const checkIfBookInUserFavorites = async (req, bookId) => {
  const currentUser = await userModel.findById(req.userId);
  return currentUser.favoriteBooks.includes(bookId);
};

const checkIfBookInUserRecents = async (req, bookId) => {
  const currentUser = await userModel.findById(req.userId);
  return currentUser.recentlyViewedBooks.includes(bookId);
};

exports.addNewBook = async (req, res) => {
  try {
    const {
      title,
      author,
      contentOverview,
      contentURL,
      coverImageURL,
      genre,
      language,
      numberOfPages,
      publicationDate,
      rating,
    } = req.body;
    const newBook = new bookModel({
      title,
      author,
      contentOverview,
      contentURL,
      coverImageURL,
      genre,
      language,
      numberOfPages,
      publicationDate,
      rating,
    });
    const book = await newBook.save();
    res.status(201).json(book);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
