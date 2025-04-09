const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    
    owner: { type: Schema.Types.ObjectId, 
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    },
    Amount: {
        type: Number,
        required: true,
        min: 0,
    },
    sourceOfCategory: {
        type: String,
        default: "personal",
    },
    date: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
        required: true,
        default: "No description",
    },
})

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;