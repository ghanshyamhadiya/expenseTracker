const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const { isLoggedIn, isOwner } = require("../middlewares")
const Budget = require("../models/budget");


router.put("/update/:id", isLoggedIn, isOwner, async (req, res) => {
    let { id } = req.params;
    let { type, amount, date, category } = req.body

    try {
        let existingExpense = await Expense.findById(id);
        if (!existingExpense) {
            return res.status(404).send("Expense not found");
        }
        
        // Only check budget if this is an expense and amount is changing
        if (type === "expense" && amount && amount !== existingExpense.Amount.toString()) {
            const inputDate = new Date(date || existingExpense.date);
            const currentMonth = inputDate.getMonth();
            const currentYear = inputDate.getFullYear();
            const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
            
            // Find budget for this category and month
            const categoryToCheck = category || existingExpense.sourceOfCategory;
            const budget = await Budget.findOne({ 
                category: categoryToCheck,
                month: { $regex: new RegExp('^' + currentMonthStr) }
            });
            
            if (budget) {
                // Calculate current spending for this category in this month (excluding this expense)
                const categoryExpenses = await Expense.aggregate([
                    { 
                        $match: { 
                            _id: { $ne: mongoose.Types.ObjectId(id) },
                            type: "expense", 
                            owner: existingExpense.owner,
                            sourceOfCategory: categoryToCheck,
                            date: {
                                $gte: new Date(currentYear, currentMonth, 1),
                                $lte: new Date(currentYear, currentMonth + 1, 0)
                            }
                        } 
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$Amount" }
                        }
                    }
                ]);
                
                const currentCategoryTotal = categoryExpenses[0]?.totalAmount || 0;
                const newTotal = currentCategoryTotal + parseFloat(amount);
                
                // Check if updating this expense would exceed the budget limit
                if (newTotal > budget.monthlyLimit) {
                    req.flash("error", `Warning: This update will exceed your budget limit for ${categoryToCheck}. Budget: ${budget.monthlyLimit}, Current spending: ${currentCategoryTotal}, This expense: ${amount}`);
                }
            }
        }
        
        let updateExpense = await Expense.findByIdAndUpdate(id, {
            type: type || existingExpense.type,
            Amount: amount || existingExpense.Amount,
            date: date || existingExpense.date,
            sourceOfCategory: category || existingExpense.sourceOfCategory,
        }, { new: true })
        req.flash("update", "expense updated")
        // console.log(updateExpense);
        res.redirect("/expense");

    } catch (error) {
        res.status(500).send("Error updating expense: " + error.message);
    }
})


router.get("/update/:id", isLoggedIn, isOwner, async (req, res) => {
    let { id } = req.params;
    let expense = await Expense.findById(id);
    res.render("./expense/update.ejs", { expense });
})

router.delete("/remove/:id", isLoggedIn, async (req, res) => {

    let { id } = req.params;
    try {
        let deleteExpense = await Expense.findByIdAndDelete(id);
        req.flash("error", "expense deleted")
        res.redirect("/expense");
    } catch (error) {
        console.error("Error deleting expense:", error);
        req.flash("error", "Failed to delete expense: " + error.message);
        res.redirect("/expense");
    }
})

router.post("/new", isLoggedIn, async (req, res) => {

    let { type, amount, date, category } = req.body

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const inputDate = new Date(date);
    if (inputDate.getMonth() !== currentMonth || inputDate.getFullYear() !== currentYear) {
        req.flash("error", "add running month and year date")
        return res.redirect("/expense/new")
    }
    let owner = req.user._id
    // console.log(owner);

    // If this is an expense (not income), check if there's enough balance
    if (type === "expense") {
        try {
            // Calculate total income
            const incomeResult = await Expense.aggregate([
                { $match: { type: "income", owner: owner } },
                {
                    $group: {
                        _id: null,
                        totalIncomeAmount: { $sum: "$Amount" }
                    }
                }
            ]);
            const totalIncome = incomeResult[0]?.totalIncomeAmount || 0;

            // Calculate total expenses
            const expenseResult = await Expense.aggregate([
                { $match: { type: "expense", owner: owner } },
                {
                    $group: {
                        _id: null,
                        totalExpenseAmount: { $sum: "$Amount" }
                    }
                }
            ]);
            const totalExpense = expenseResult[0]?.totalExpenseAmount || 0;

            // Calculate remaining balance
            const remainingBalance = totalIncome - totalExpense;

            // Check if adding this expense would make balance negative
            if (remainingBalance <= 0 || remainingBalance < parseFloat(amount)) {
                req.flash("error", "Cannot add expense: Insufficient balance. Your current balance is " + remainingBalance);
                return res.redirect("/expense/new");
            }
            
            // Check if this expense would exceed the budget limit for this category
            const Budget = require("../models/budget");
            const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
            
            // Find budget for this category and month
            const budget = await Budget.findOne({ 
                category: category,
                month: { $regex: new RegExp('^' + currentMonthStr) }
            });
            
            if (budget) {
                // Calculate current spending for this category in this month
                const categoryExpenses = await Expense.aggregate([
                    { 
                        $match: { 
                            type: "expense", 
                            owner: owner,
                            sourceOfCategory: category,
                            date: {
                                $gte: new Date(currentYear, currentMonth, 1),
                                $lte: new Date(currentYear, currentMonth + 1, 0)
                            }
                        } 
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$Amount" }
                        }
                    }
                ]);
                
                const currentCategoryTotal = categoryExpenses[0]?.totalAmount || 0;
                const newTotal = currentCategoryTotal + parseFloat(amount);
                
                // Check if adding this expense would exceed the budget limit
                if (newTotal > budget.monthlyLimit) {
                    req.flash("error", `Warning: This expense will exceed your budget limit for ${category}. Budget: ${budget.monthlyLimit}, Current spending: ${currentCategoryTotal}, This expense: ${amount}`);
                }
            }
        } catch (error) {
            console.error("Error checking balance or budget:", error);
            req.flash("error", "Failed to check balance or budget: " + error.message);
            return res.redirect("/expense/new");
        }
    }

    try {
        let newExpanse = new Expense({
            owner: owner,
            type: type,
            Amount: amount,
            date: date,
            sourceOfCategory: category,
        })

        let addExpense = await newExpanse.save()
        req.flash("success", "expense added succesfully")
        // console.log(addExpense);
        res.redirect("/expense");
    } catch (error) {
        console.error("Error adding expense:", error);
        req.flash("error", "Failed to add expense: " + error.message);
        res.redirect("/expense/new");
    }
})

router.get("/new", isLoggedIn, (req, res) => {

    res.render("./expense/new.ejs");
})


router.get("/", isLoggedIn,async (req, res) => {

    try {
        let userId = req.user._id;
        const result2 = await Expense.aggregate([
            { $match: { type: "income", owner: userId, } },
            {
                $group: {
                    _id: null,
                    totalIncomeAmount: { $sum: "$Amount" }
                }
            }
        ]);

        const total2 = result2[0]?.totalIncomeAmount || 0;

        const result = await Expense.aggregate([
            { $match: { type: "expense", owner: userId } }, // Filter by 'expense' type
            {
                $group: {
                    _id: null,
                    totalExpenseAmount: { $sum: "$Amount" }
                }
            }
        ]);

        const total = result[0]?.totalExpenseAmount || 0;
        const remain = total2 - total;
        
        // Check if remaining amount is under 20% of total income
        if (total2 > 0 && remain < (total2 * 0.2)) {
            req.flash("error", "Warning: Your remaining balance is below 20% of your total income!");
        }
        
        // Get budget information
        const Budget = require("../models/budget");
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        
        // Find all budgets for the current month
        const budgets = await Budget.find({
            month: { $regex: new RegExp('^' + currentMonthStr) }
        });
        
        // Get category spending for each budget
        const budgetData = [];
        for (const budget of budgets) {
            const categoryExpenses = await Expense.aggregate([
                { 
                    $match: { 
                        type: "expense", 
                        owner: userId,
                        sourceOfCategory: budget.category,
                        date: {
                            $gte: new Date(currentYear, currentMonth, 1),
                            $lte: new Date(currentYear, currentMonth + 1, 0)
                        }
                    } 
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$Amount" }
                    }
                }
            ]);
            
            const currentSpending = categoryExpenses[0]?.totalAmount || 0;
            const percentUsed = (currentSpending / budget.monthlyLimit) * 100;
            
            budgetData.push({
                category: budget.category,
                limit: budget.monthlyLimit,
                spent: currentSpending,
                remaining: budget.monthlyLimit - currentSpending,
                percentUsed: percentUsed.toFixed(1),
                id: budget._id
            });
        }
        
        let allExpenses = await Expense.find({owner: userId}).populate("owner").sort({ date: -1 });

        res.render("./expense/index.ejs", { allExpenses, total, total2, remain, budgetData });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        req.flash("error", "Failed to fetch expenses: " + error.message);
        res.redirect("/expense");
    }
})

module.exports = router;