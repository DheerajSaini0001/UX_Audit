const { parentPort, workerData } = require('worker_threads');
const { scrapePage } = require('./scraper');

const run = async () => {
    try {
        const { url, device } = workerData;
        const result = await scrapePage(url, device);
        parentPort.postMessage({ status: 'success', data: result });
    } catch (error) {
        parentPort.postMessage({ status: 'error', error: error.message });
    }
};

run();
