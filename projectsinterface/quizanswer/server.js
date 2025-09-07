require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors'); // <-- import cors
const Quiz = require('./models/Quiz');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Middleware
app.use(cors()); // <-- enable CORS for all routes
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API endpoint to get quiz data
// API endpoint to get 10 random quiz questions
// API endpoint to get 10 unique questions per session
app.get('/api/quiz', async (req, res) => {
    try {
        const quizzes = await Quiz.aggregate([
            { $sample: { size: 10 } } // randomly select 10 unique documents
        ]);
        res.json(quizzes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});


// Serve HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
