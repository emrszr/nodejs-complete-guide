const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const { doubleCsrf } = require("csrf-csrf");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const User = require("./models/user");

const CSRF_SECRET = "super csrf secret";
const COOKIES_SECRET = "super cookie secret";
const CSRF_COOKIE_NAME = "_csrf";

const MONGODB_URI =
  "mongodb+srv://node-shop:node-shop@node-rest-shop.dnhdu.mongodb.net/shop?retryWrites=true&w=majority&appName=node-rest-shop";

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
      return req.body._csrf;
    },
  });

app.use(cookieParser(COOKIES_SECRET));

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
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
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
