const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = authVerification = (req, res, next) => {
  let token;
  const AuthorizationHeader = req.header("Authorization");
  if (AuthorizationHeader) {
    token = AuthorizationHeader.split(" ")[1];
  } else {
    return res.status(401).json({ message: "Unauthorized user" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ message: "Unauthorized user" });
  }
};
