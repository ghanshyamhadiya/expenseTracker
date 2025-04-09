const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recurringTransactionSchema = new Schema({
    owner: { 
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    sourceOfCategory: {
        type: String,
        default: "personal",
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    endDate: {
        type: Date,
        default: null,
    },
    description: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastProcessed: {
        type: Date,
        default: null,
    },
    nextDueDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Calculate the next due date based on frequency and last processed date
recurringTransactionSchema.methods.calculateNextDueDate = function() {
    const baseDate = this.lastProcessed || this.startDate;
    const date = new Date(baseDate);
    
    switch(this.frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'biweekly':
            date.setDate(date.getDate() + 14);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    
    return date;
};

// Pre-save hook to calculate next due date if not set
recurringTransactionSchema.pre('save', function(next) {
    if (!this.nextDueDate) {
        this.nextDueDate = this.calculateNextDueDate();
    }
    next();
});

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema);
module.exports = RecurringTransaction;