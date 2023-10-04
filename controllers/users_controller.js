const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user_model");
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
