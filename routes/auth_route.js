const express = require("express");
const authController = require("../controllers/auth_controller");
const {
  loginUserValidation,
} = require("../middlewares/validators/auth_route_validation");
const authVerification = require("../middlewares/auth");

const router = express.Router();

// @route     POST api/auth
// @desc      Login user and get token
// @access    Public
router.post("/auth", loginUserValidation, authController.loginUser);

// @route     GET api/auth
// @desc      Get logged user
// @access    Private
router.get("/auth", authVerification, authController.getLoggedUser);

module.exports = router;
