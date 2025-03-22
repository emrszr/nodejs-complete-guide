const path = require("path");
const fs = require("fs");
// const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const { doubleCsrf } = require("csrf-csrf");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

require("dotenv").config();

const errorController = require("./controllers/error");
const User = require("./models/user");

const CSRF_SECRET = process.env.CSRF_SECRET;
const COOKIES_SECRET = process.env.COOKIES_SECRET;
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME;

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@node-rest-shop.dnhdu.mongodb.net/${process.env.DEFAULT_DB}?retryWrites=true&w=majority&appName=node-rest-shop`;
console.log(MONGODB_URI);

const app = express();
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } =
  doubleCsrf({
    getSecret: () => CSRF_SECRET,
    cookieName: CSRF_COOKIE_NAME,
    cookieOptions: { sameSite: false, secure: false }, // not ideal for production, development only
    getTokenFromRequest: (req) => {
      return req.body._csrf || req.headers["csrf-token"];
    },
  });

app.use(cookieParser(COOKIES_SECRET));

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log "),
  { flags: "a" }
);

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use(express.static(path.join(__dirname, "public"))); // it serves the puclic folder statically as in the root folder
app.use("/images", express.static(path.join(__dirname, "images"))); // it it serves the images folder statically as /images folder

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(doubleCsrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.csrfToken) {
    console.error("CSRF middleware is not configured correctly");
    return next(new Error("CSRF setup error"));
  }
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken(); // Generate and store the token
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: false,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
