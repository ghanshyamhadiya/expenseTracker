const { Model } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const budgetSchema = new Schema({
    category: {
        type: String,
        required: true,
    },
    monthlyLimit: {
        type: Number,
        required: true,
        min: 0,
    },
    month: {
        type: String,
        required: true,
    }
})

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;
