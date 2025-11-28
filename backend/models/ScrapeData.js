const mongoose = require('mongoose');

const scrapeDataSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  device: {
    type: String,
    enum: ['mobile', 'desktop'],
    required: true,
  },
  scrapedAt: {
    type: Date,
    default: Date.now,
    expires: 10800, // 3 hours in seconds
  },
  title: {
    type: String,
  },
  htmlContent: {
    type: String,
    required: true,
  },
  auditResults: {
    type: Object, // Storing the full audit object
  },
  screenshotUrl: {
    type: String,
  },
});

module.exports = mongoose.model('ScrapeData', scrapeDataSchema);
