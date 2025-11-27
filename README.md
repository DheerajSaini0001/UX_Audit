# URL Scraper Walkthrough

## Prerequisites
- Node.js installed.
- MongoDB installed and running locally on default port `27017`.

## Setup & Run

### 1. Backend
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
npm start
```
The server will start on `http://localhost:5000`.

### 2. Frontend
Open a new terminal window and navigate to the `client` directory:
```bash
cd client
npm run dev
```
The frontend will start (usually on `http://localhost:5173`).

## Usage
1.  Open the frontend URL in your browser.
2.  Enter a URL (e.g., `https://example.com`).
3.  Select "Desktop" or "Mobile".
4.  Click "Scrape".
5.  Wait for the process to complete.
6.  The result will appear in the "Recent Scrapes" list below.

## Verification
- **Backend**: Check the terminal running the backend for logs like `Scraping https://example.com...` and `Scrape saved successfully`.
- **Database**: You can use MongoDB Compass or `mongosh` to inspect the `scrapedatas` collection in the `url-scraper` database.
