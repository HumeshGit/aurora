// models/Quiz.js
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String], // Array of 4 strings
        required: true,
        validate: [arr => arr.length === 4, 'Exactly 4 options required']
    },
    answer: {
        type: Number, // Index of correct option: 0,1,2,3
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
