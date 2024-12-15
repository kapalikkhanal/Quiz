const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs').promises;
require('dotenv').config();

const { renderVideo } = require('./modules/remotion/render');
const { PostToTiktok, getTiktokCookies } = require('./modules/tiktok/tiktok');
const { postToInstagram, getInstagramCookies } = require('./modules/instagram/instagram');

const app = express();
const PORT = process.env.PORT || 3002;

let currentQuestionIndex = 0;

const getNextQuestion = async () => {
    try {
        // Read the questions.json file
        const questionsData = await fs.readFile('./public/questions.json', 'utf8');
        const questions = JSON.parse(questionsData);

        // Get the next question and increment the index
        const question = questions[currentQuestionIndex];

        // Update index for next time, loop back to 0 if we reach the end
        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;

        return question;
    } catch (error) {
        console.error('Error reading questions:', error);
        return null;
    }
};

const postQuotes = async () => {
    try {
        // const quotes = await askGemini();
        const quizData = await getNextQuestion();

        if (!quizData) {
            throw new Error('Failed to get quiz data');
        }

        console.log(quizData);

        const videoPath = await renderVideo({
            video: '/videos/option1.mp4',
            data: quizData,
            imageUrl: "https://kapalik.com"
        });
        console.log("Path", videoPath);
        await PostToTiktok(videoPath);
        // await postToInstagram("./output/66b23a91dc9c.mp4");

        await fs.unlink(videoPath);
        console.log('Posted Sucessfully.');
    } catch (error) {
        console.error('Error rendering video:', error.message);
    }
};

// Manual trigger endpoint
app.get('/trigger-quotes', async (req, res) => {
    try {
        await postQuotes();
        res.json({ message: 'Quotes posting completed successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Quotes posting failed',
            error: error.message
        });
    }
});

app.get('/current-index', (req, res) => {
    res.json({
        currentIndex: currentQuestionIndex
    });
});

app.get('/health-check', async (req, res) => {
    try {
        res.json({ message: 'Server is working fine.' });
    } catch (error) {
        res.status(500).json({
            message: 'Server failed'
        });
    }
});

cron.schedule('*/59 * * * *', postQuotes);

// getTiktokCookies('https://www.tiktok.com/login', 'tiktok')
// getInstagramCookies('https://www.instagram.com/accounts/login/', 'instagram')

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Initial quotes postingjob starting...');
    postQuotes(); // Initial run on startup
});