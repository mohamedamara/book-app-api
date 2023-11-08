const { body, validationResult } = require("express-validator");

exports.addNewReviewValidation = [
  body("reviewContent")
    .notEmpty()
    .withMessage("Review content is required")
    .isString()
    .withMessage("Review content must be a String"),
  body("reviewRating")
    .notEmpty()
    .isInt({ min: 1, max: 5 })
    .withMessage("Review rating must be a numerical value between 1 and 5"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
