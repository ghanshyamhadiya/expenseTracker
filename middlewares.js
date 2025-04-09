
let Expense = require("./models/expense")
let User = require("./models/user")

module.exports.isLoggedIn = ((req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        let redirectUrl = req.originalUrl
        console.log(redirectUrl)
        req.flash("error", "You must be logged in to do that")
        return res.redirect("/login")
    }
    next()
})

module.exports.isOwner = (async (req, res, next) => {
    try {
        let { id } = req.params;

        let expense = await Expense.findById(id).populate("owner");
        if (!expense) {
            req.flash("error", "Expense not found")
            return res.redirect("/expense")
        }

        if (!expense.owner._id.equals(req.user._id)) {
            req.flash("error", "You are not authorized to do that")
            return res.redirect("/expense")
        }
        next()
    } catch (err) {
        console.log(err);
        req.flash("error", err.message)
        res.redirect("/expense")
    }
})
