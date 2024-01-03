const reviewModel = require("../models/review_model");

exports.addReview = async (req, res) => {
  try {
    if (await checkIfUserAlreadyWroteReviewForThisBook(req)) {
      return res
        .status(409)
        .json({ message: "This user already has a review for this book" });
    }
    await saveReview(req, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkIfUserAlreadyWroteReviewForThisBook = async (req) => {
  return await reviewModel.findOne({
    createdFor: req.body.bookId,
    createdBy: req.userId,
  });
};

const saveReview = async (req, res) => {
  const { reviewContent, reviewRating, bookId } = req.body;
  const newReview = new reviewModel({
    reviewContent,
    reviewRating,
    createdBy: req.userId,
    createdFor: bookId,
  });
  const savedReview = await newReview.save();
  const reviewDetails = await reviewModel
    .findById(savedReview._id)
    .select("-createdFor")
    .populate("createdBy", "-_id firstName lastName email");
  res.status(201).json(reviewDetails);
};
