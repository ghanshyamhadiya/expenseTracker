const express = require("express");
const router = express.Router();
const SavingsGoal = require("../models/savingsGoal");
const { isLoggedIn } = require("../middlewares");

// Get all savings goals for the logged-in user
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const savingsGoals = await SavingsGoal.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.render("savings/index", { savingsGoals });
    } catch (error) {
        console.error("Error fetching savings goals:", error);
        req.flash("error", "Failed to load savings goals");
        res.redirect("/expense");
    }
});

// Render form to create a new savings goal
router.get("/new", isLoggedIn, (req, res) => {
    res.render("savings/new");
});

// Create a new savings goal
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const { title, targetAmount, currentAmount, deadline, category, description } = req.body;
        
        const newSavingsGoal = new SavingsGoal({
            owner: req.user._id,
            title,
            targetAmount,
            currentAmount: currentAmount || 0,
            deadline,
            category,
            description
        });
        
        await newSavingsGoal.save();
        req.flash("success", "Savings goal created successfully");
        res.redirect("/savings");
    } catch (error) {
        console.error("Error creating savings goal:", error);
        req.flash("error", "Failed to create savings goal");
        res.redirect("/savings/new");
    }
});

// Render form to edit a savings goal
router.get("/edit/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const savingsGoal = await SavingsGoal.findOne({ _id: id, owner: req.user._id });
        
        if (!savingsGoal) {
            req.flash("error", "Savings goal not found");
            return res.redirect("/savings");
        }
        
        res.render("savings/edit", { savingsGoal });
    } catch (error) {
        console.error("Error fetching savings goal for edit:", error);
        req.flash("error", "Failed to load savings goal");
        res.redirect("/savings");
    }
});

// Update a savings goal
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, targetAmount, currentAmount, deadline, category, description } = req.body;
        
        const savingsGoal = await SavingsGoal.findOne({ _id: id, owner: req.user._id });
        
        if (!savingsGoal) {
            req.flash("error", "Savings goal not found");
            return res.redirect("/savings");
        }
        
        // Update fields
        savingsGoal.title = title;
        savingsGoal.targetAmount = targetAmount;
        savingsGoal.currentAmount = currentAmount;
        savingsGoal.deadline = deadline;
        savingsGoal.category = category;
        savingsGoal.description = description;
        
        // Check if goal is completed
        if (parseFloat(currentAmount) >= parseFloat(targetAmount)) {
            savingsGoal.isCompleted = true;
        } else {
            savingsGoal.isCompleted = false;
        }
        
        await savingsGoal.save();
        req.flash("success", "Savings goal updated successfully");
        res.redirect("/savings");
    } catch (error) {
        console.error("Error updating savings goal:", error);
        req.flash("error", "Failed to update savings goal");
        res.redirect("/savings");
    }
});

// Delete a savings goal
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await SavingsGoal.findOneAndDelete({ _id: id, owner: req.user._id });
        
        if (!result) {
            req.flash("error", "Savings goal not found");
        } else {
            req.flash("success", "Savings goal deleted successfully");
        }
        
        res.redirect("/savings");
    } catch (error) {
        console.error("Error deleting savings goal:", error);
        req.flash("error", "Failed to delete savings goal");
        res.redirect("/savings");
    }
});

// Add contribution to a savings goal
router.post("/:id/contribute", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        
        const savingsGoal = await SavingsGoal.findOne({ _id: id, owner: req.user._id });
        
        if (!savingsGoal) {
            req.flash("error", "Savings goal not found");
            return res.redirect("/savings");
        }
        
        // Add contribution
        savingsGoal.currentAmount += parseFloat(amount);
        
        // Check if goal is completed
        if (savingsGoal.currentAmount >= savingsGoal.targetAmount) {
            savingsGoal.isCompleted = true;
            req.flash("success", "Congratulations! You've reached your savings goal!");
        } else {
            req.flash("success", `Added ${amount} to your savings goal`);
        }
        
        await savingsGoal.save();
        res.redirect("/savings");
    } catch (error) {
        console.error("Error adding contribution:", error);
        req.flash("error", "Failed to add contribution");
        res.redirect("/savings");
    }
});

module.exports = router;