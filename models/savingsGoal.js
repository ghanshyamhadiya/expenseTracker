const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const savingsGoalSchema = new Schema({
    owner: { 
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    deadline: {
        type: Date,
        required: true,
    },
    category: {
        type: String,
        default: "Savings",
    },
    description: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    }
});

// Virtual property to calculate progress percentage
savingsGoalSchema.virtual('progressPercentage').get(function() {
    return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
});

// Virtual property to calculate remaining amount
savingsGoalSchema.virtual('remainingAmount').get(function() {
    return Math.max(this.targetAmount - this.currentAmount, 0);
});

// Virtual property to calculate days remaining
savingsGoalSchema.virtual('daysRemaining').get(function() {
    const today = new Date();
    const deadline = new Date(this.deadline);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
});

savingsGoalSchema.set('toJSON', { virtuals: true });
savingsGoalSchema.set('toObject', { virtuals: true });

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
module.exports = SavingsGoal;