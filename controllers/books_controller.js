const mongoose = require("mongoose");
const bookModel = require("../models/book_model");

exports.getBooks = async (req, res) => {
  const { searchkeyword, genre, sortby, sortorder } = req.query;
  try {
    if (Object.keys(req.query).length === 0) {
      await getTopBooks(res);
    }
    if (searchkeyword) {
      await getSearchedBooks(res);
    }
    if (genre && sortby && sortorder) {
      await getFilteredBooks(sortby, sortorder, res);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTopBooks = async (res) => {
  const books = await bookModel
    .find()
    .sort({ readCount: "descending" })
    .limit(5);
  res.json(books);
};

const getSearchedBooks = async (res) => {
  const books = await bookModel.find({
    title: { $regex: searchkeyword, $options: "i" },
  });
  res.json(books);
};

const getFilteredBooks = async (sortby, sortorder, res) => {
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
    readCount,
  } = req.body;
  const newBook = new bookModel({
    title,
    author,
    contentURL,
    coverImageURL,
    genre,
    publicationDate,
    readCount,
  });
  const book = await newBook.save();
  res.status(201).json(book);
};
