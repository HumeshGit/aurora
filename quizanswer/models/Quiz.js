// models/Quiz.js
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String], // Array of strings
        required: true,
        validate: [arr => arr.length >= 2, 'At least two options required']
    },
    answer: {
        type: Number, // Index of correct option
        required: true,
        validate: {
            validator: function(v) {
                return v >= 0 && v < this.options.length;
            },
            message: 'Answer index must be within options range'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
