const express = require("express");
const router = express.Router();
const RecurringTransaction = require("../models/recurringTransaction");
const Expense = require("../models/expense");
const { isLoggedIn } = require("../middlewares");

// Get all recurring transactions for the logged-in user
router.get("/", isLoggedIn, async (req, res) => {
    try {
        req.flash("error", "dark theme is under process for this page")
        const recurringTransactions = await RecurringTransaction.find({ 
            owner: req.user._id 
        }).sort({ nextDueDate: 1 });
        
        res.render("recurring/index", { recurringTransactions });
    } catch (error) {
        console.error("Error fetching recurring transactions:", error);
        req.flash("error", "Failed to load recurring transactions");
        res.redirect("/expense");
    }
});

// Render form to create a new recurring transaction
router.get("/new", isLoggedIn, (req, res) => {
    res.render("recurring/new");
});

// Create a new recurring transaction
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const { title, type, amount, sourceOfCategory, frequency, startDate, endDate, description } = req.body;
        
        const newRecurringTransaction = new RecurringTransaction({
            owner: req.user._id,
            title,
            type,
            amount,
            sourceOfCategory,
            frequency,
            startDate,
            endDate: endDate || null,
            description
        });
        
        await newRecurringTransaction.save();
        req.flash("success", "Recurring transaction created successfully");
        res.redirect("/recurring");
    } catch (error) {
        console.error("Error creating recurring transaction:", error);
        req.flash("error", "Failed to create recurring transaction");
        res.redirect("/recurring/new");
    }
});

// Render form to edit a recurring transaction
router.get("/edit/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const recurringTransaction = await RecurringTransaction.findOne({ 
            _id: id, 
            owner: req.user._id 
        });
        
        if (!recurringTransaction) {
            req.flash("error", "Recurring transaction not found");
            return res.redirect("/recurring");
        }
        
        res.render("recurring/edit", { recurringTransaction });
    } catch (error) {
        console.error("Error fetching recurring transaction for edit:", error);
        req.flash("error", "Failed to load recurring transaction");
        res.redirect("/recurring");
    }
});

// Update a recurring transaction
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, amount, sourceOfCategory, frequency, startDate, endDate, description, isActive } = req.body;
        
        const recurringTransaction = await RecurringTransaction.findOne({ 
            _id: id, 
            owner: req.user._id 
        });
        
        if (!recurringTransaction) {
            req.flash("error", "Recurring transaction not found");
            return res.redirect("/recurring");
        }
        
        // Update fields
        recurringTransaction.title = title;
        recurringTransaction.type = type;
        recurringTransaction.amount = amount;
        recurringTransaction.sourceOfCategory = sourceOfCategory;
        recurringTransaction.frequency = frequency;
        recurringTransaction.startDate = startDate;
        recurringTransaction.endDate = endDate || null;
        recurringTransaction.description = description;
        recurringTransaction.isActive = isActive === 'on' || isActive === true;
        
        // Recalculate next due date if frequency changed
        if (recurringTransaction.isModified('frequency')) {
            recurringTransaction.nextDueDate = recurringTransaction.calculateNextDueDate();
        }
        
        await recurringTransaction.save();
        req.flash("success", "Recurring transaction updated successfully");
        res.redirect("/recurring");
    } catch (error) {
        console.error("Error updating recurring transaction:", error);
        req.flash("error", "Failed to update recurring transaction");
        res.redirect("/recurring");
    }
});

// Delete a recurring transaction
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await RecurringTransaction.findOneAndDelete({ 
            _id: id, 
            owner: req.user._id 
        });
        
        if (!result) {
            req.flash("error", "Recurring transaction not found");
        } else {
            req.flash("success", "Recurring transaction deleted successfully");
        }
        
        res.redirect("/recurring");
    } catch (error) {
        console.error("Error deleting recurring transaction:", error);
        req.flash("error", "Failed to delete recurring transaction");
        res.redirect("/recurring");
    }
});

// Process due recurring transactions
router.post("/process", isLoggedIn, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Find all active recurring transactions that are due
        const dueTransactions = await RecurringTransaction.find({
            owner: req.user._id,
            isActive: true,
            nextDueDate: { $lte: today },
            $or: [{ endDate: null }, { endDate: { $gte: today } }]
        });
        
        let processedCount = 0;
        
        // Process each due transaction
        for (const transaction of dueTransactions) {
            // Create a new expense/income entry
            const newExpense = new Expense({
                owner: req.user._id,
                type: transaction.type,
                Amount: transaction.amount,
                sourceOfCategory: transaction.sourceOfCategory,
                date: new Date(),
                description: `${transaction.title} (Recurring)`
            });
            
            await newExpense.save();
            
            // Update the recurring transaction
            transaction.lastProcessed = new Date();
            transaction.nextDueDate = transaction.calculateNextDueDate();
            
            // If this transaction has reached its end date, deactivate it
            if (transaction.endDate && transaction.nextDueDate > transaction.endDate) {
                transaction.isActive = false;
            }
            
            await transaction.save();
            processedCount++;
        }
        
        if (processedCount > 0) {
            req.flash("success", `Processed ${processedCount} recurring transaction(s)`);
        } else {
            req.flash("info", "No recurring transactions due for processing");
        }
        
        res.redirect("/recurring");
    } catch (error) {
        console.error("Error processing recurring transactions:", error);
        req.flash("error", "Failed to process recurring transactions");
        res.redirect("/recurring");
    }
});

// Toggle active status
router.post("/:id/toggle", isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const recurringTransaction = await RecurringTransaction.findOne({ 
            _id: id, 
            owner: req.user._id 
        });
        
        if (!recurringTransaction) {
            req.flash("error", "Recurring transaction not found");
            return res.redirect("/recurring");
        }
        
        // Toggle active status
        recurringTransaction.isActive = !recurringTransaction.isActive;
        await recurringTransaction.save();
        
        req.flash("success", `Recurring transaction ${recurringTransaction.isActive ? 'activated' : 'deactivated'}`);
        res.redirect("/recurring");
    } catch (error) {
        console.error("Error toggling recurring transaction status:", error);
        req.flash("error", "Failed to update recurring transaction");
        res.redirect("/recurring");
    }
});

module.exports = router;