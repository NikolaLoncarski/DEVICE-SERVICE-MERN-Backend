const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
dotenv.config({ path: "./config.env" });

const userRoutes = require("./routes/userRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const modelRoutes = require("./routes/deviceSubRoutes/modelRoutes");
const brandRoutes = require("./routes/deviceSubRoutes/brandRoutes");
const auth = require("./controllers/authenticationController");

const appError = require("./utils/appError");
const app = express();
app.use(express.json({ limit: "30kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use(helmet());
app.use(cookieParser());

// const limiter = rateLimit({
//   max: 250,
//   windowMs: 60 * 60 * 1000,
//   message: "To many requests from this IP, please try again in an hour",
// });
// app.use("/", limiter);

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(3001, () => {
      console.log(`App running on port 3001`);
    });
  });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});
app.use("/user", userRoutes);

app.use("/service", deviceRoutes, modelRoutes, brandRoutes);

app.all("*", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});
