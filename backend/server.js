require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ScrapeData = require('./models/ScrapeData');
const { scrapePage } = require('./services/scraper');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large HTML content

// Database Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected', MONGODB_URI))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
// Health Check
app.get('/health', (req, res) => res.send('Server is running'));

const { Worker } = require('worker_threads');
const path = require('path');

// Helper to run scrape in a worker
const runScrapeWorker = (url, device) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, 'services', 'worker.js'), {
            workerData: { url, device }
        });

        worker.on('message', (message) => {
            if (message.status === 'success') {
                resolve(message.data);
            } else {
                reject(new Error(message.error));
            }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
};

app.post('/api/scrape', async (req, res) => {
    const { url, device } = req.body;

    if (!url || !device) {
        return res.status(400).json({ error: 'URL and device type are required' });
    }

    try {
        console.log(`Starting worker for ${url} (${device})...`);

        // Use worker instead of direct call
        const { title, htmlContent, auditResults } = await runScrapeWorker(url, device);

        const newData = new ScrapeData({
            url,
            device,
            title,
            htmlContent,
            auditResults,
        });

        await newData.save();
        console.log('Scrape saved successfully');

        res.status(201).json({ message: 'Scrape successful', data: newData });
    } catch (error) {
        console.error('Error in /api/scrape:', error);
        res.status(500).json({ error: 'Failed to scrape page', details: error.message });
    }
});

app.get('/api/scrapes', async (req, res) => {
    try {
        const scrapes = await ScrapeData.find().sort({ scrapedAt: -1 }).limit(10).select('-htmlContent'); // Exclude heavy HTML from list
        res.json(scrapes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scrapes' });
    }
});

app.get('/api/scrapes/:id', async (req, res) => {
    try {
        const scrape = await ScrapeData.findById(req.params.id);
        if (!scrape) return res.status(404).json({ error: 'Scrape not found' });
        res.json(scrape);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scrape details' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
