const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const databaseConnection = require("./config/database_connection");
const usersRoute = require("./routes/users_route");
const authRoute = require("./routes/auth_route");

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ extended: false }));
const port = process.env.PORT || 5000;

databaseConnection();

app.use("/api", usersRoute);
app.use("/api", authRoute);

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
