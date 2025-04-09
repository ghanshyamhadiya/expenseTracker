const express = require("express");
const router = express.Router();
const Budget = require("../models/budget");

router.delete("/:id/delete", async (req, res) => {
    let { id } = req.params;
    console.log(id)
    try {
        let deleteBudget = await Budget.findByIdAndDelete(id);
        req.flash("error", "budget deleted")
        res.redirect("/expense");    
    } catch (error) {
        console.log("error occur in budget delete")
    }
})

router.post("/", async (req, res) => {
    let { category, monthlyLimit, month } = req.body;
    // console.log(req.body);
    try {
        let newBudget = new Budget({
            category: category,
            monthlyLimit: monthlyLimit,
            month: month,
        })
        await newBudget.save();
        req.flash("success", "Budget Added")
        res.redirect("/expense")
    } catch (error) {
        console.log(error);
    } 
    
})

router.get("/add", async (req, res) => {
    res.render("budget/add.ejs");
})

module.exports = router;