require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Quiz = require('./models/Quiz');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.static(path.join(__dirname,"public")));

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "create_quiz.html"));
  });
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// API endpoint to insert quiz question
app.post('/api/quiz', async (req, res) => {
    try {
        const { question, options, answer } = req.body;
        console.log("Data received from frontend:",question,options,answer)

        // validation
        if (!question || !options || !Array.isArray(options) || options.length < 2 || answer === undefined) {
            return res.status(400).json({
                status: "fail",
                message: "Invalid input data"
            });
        }

        //const newQuiz = new Quiz({ question, options, answer });
        //await newQuiz.save();
        const newQuiz = new Quiz({ question, options, answer });
        await newQuiz.save();
        console.log("Saved to DB:", newQuiz);
                

        res.status(201).json({
            status: "success",
            message: "Quiz question saved successfully"
        });

    } catch (err) {
        console.error("Error saving quiz:", err);
        res.status(500).json({
            status: "fail",
            message: "Failed to save quiz question"
        });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
