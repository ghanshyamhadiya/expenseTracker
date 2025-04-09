
if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
app.use(methodOverride('_method'));

const passport = require("passport");
const LocalStrategy = require("passport-local");
const userRoute = require("./routes/user");
const User = require("./models/user");

const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const expenseRoutes = require("./routes/expense");
const budgetRoutes = require("./routes/budget");
const ExpressError = require("./ExpressError");
const recurrenceRoute = require("./routes/recurring")
const savingRoute = require("./routes/savingsGoal")

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());


const dbUrl = process.env.MONGO_ATLAS_URL

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})

store.on("error", function (error) {
    console.log("Session store error:", error);
});

const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }
}

app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.update = req.flash("update");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;

    next();
})


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/", userRoute);


async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(res => console.log("connected"))
    .catch(err => console.log(err));

app.use("/expense", expenseRoutes);
app.use("/budget", budgetRoutes);
app.use("/recurring", recurrenceRoute);
app.use("/savings", savingRoute)


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found"))
})


app.use((err, req, res, next) => {

    let { status, message } = err;

    if (err.name === "CastError") {
        status = 400;
        message = "Invalid ID format. The requested resource could not be found.";
    }

    status = status || 500;
    message = message || "Something went wrong!";

    try {
        res.status(status).render("error.ejs", { message, status });
    } catch (renderError) {
        console.error("Error rendering error page:", renderError);
        res.status(500).send("An unexpected error occurred.");
    }
});

// app.get("/error", (req, res) => {
//     res.render("./expense/error.ejs")
// })

app.listen(3000, () => {
    console.log("Server started on port 3000");
});


