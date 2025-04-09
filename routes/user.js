const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), (req, res) => {
    req.flash("success", "Welcome back to the Expense Tracker App!");
    res.redirect("/expense");
})

router.get("/login", (req, res) => {
    res.render("auth/login.ejs");
})

router.post("/signup", async (req, res) => {
    let { username, email, password } = req.body;
    console.log(req.body);
    try {
        if (!password || password.length < 6) {
            req.flash("error", "Password must be at least 6 characters long");
            return res.redirect("/signup");
        }
        const newUser = new User({ username, email });
        let registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                console.log(err);
                return res.redirect("/signup");
            }
            req.flash("success", "Welcome to the Expense Tracker App!");
            res.redirect("/expense");
        });


    } catch (error) {
        console.log(error)
    }
})

router.get("/signup", (req, res) => {
    res.render("auth/signup.ejs");
})

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "Goodbye! See you again soon!");
        res.redirect("/expense");
    })
})

module.exports = router;