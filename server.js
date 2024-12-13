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
const PORT = process.env.PORT || 3003;

let currentQuestionIndex = 0;

// Paraphrase content
const askGemini = async (content) => {
    try {
        const currentDate = new Date().toISOString();
        const prompt = `Create a completely new, original, and heartfelt love quote (maximum 30 words) that has never been written before. 
        
Requirements:
- Must be unique and not similar to existing quotes
- Express deep emotion but stay concise
- Can be about any aspect of love (romantic, lasting love, first sight, etc.)
- No famous references or clichés
- No quotation marks
- Consider ${currentDate} as inspiration for seasonal/temporal context

Here are some examples for tone and style (but DO NOT copy or closely paraphrase these):
- To the world you may be one person, but to one person you are the world.
- I need you like a heart needs a beat.
- If you live to be a hundred, I want to live to be a hundred minus one day so I never have to live without you.

Remember: Generate something completely new and different from these examples. Be creative and original.`;

        const response = await axios.post('https://gemini-uts6.onrender.com/api/askgemini', {
            text: prompt
        });

        // Clean up the response
        let quote = response.data.response;
        quote = quote.replace(/["'"]/g, ''); // Remove any quotes
        quote = quote.trim();

        // Validate the response
        if (quote.split(' ').length > 30) {
            quote = quote.split(' ').slice(0, 30).join(' ') + '...';
        }

        return quote;
    } catch (error) {
        console.error('Quote generation error:', error.message);
        return null;
    }
};

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

cron.schedule('*/59 * * * *', postQuotes);

// getTiktokCookies('https://www.tiktok.com/login', 'tiktok')
// getInstagramCookies('https://www.instagram.com/accounts/login/', 'instagram')

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Initial quotes postingjob starting...');
    postQuotes(); // Initial run on startup
});