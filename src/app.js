require("dotenv").config();
const express = require("express");
const cors = require("cors");
const CustomError = require("./utils/CustomError");
const indexRouter = require("./routes/indexRouter");

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
  }),
);

app.use(express.json());

app.use("/", indexRouter);

app.use((req, res, next) => next(new CustomError("Not Found", 404)));
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (!error.statusCode) {
    console.error(error);
    error.statusCode = 500;
    error.message = "Internal Server Error";
  }

  res
    .status(error.statusCode)
    .json({ error: `${error.statusCode}: ${error.message}` });
});

module.exports = app;
