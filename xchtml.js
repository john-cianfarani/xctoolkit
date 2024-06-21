
// Main function to orchestrate the API and web server
// 
//
// /api/v1/X - API endpoint

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const {
    fetchNamespaces,
    fetchConfig,
    fetchLbs,
    fetchHealthchecks,
    fetchStats,
    uploadCertificate,
    fetchInventory,
    getSecurityEvents,
    getInventory,
    getStats,
    generateCertificate,
    encryptApiKeys,
    fetchUsers,
    fetchConfigItems
} = require('./xcapi');

const app = express();
const port = 3080;

// Sample encryption key
const encryptionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Middleware to parse JSON bodies and cookies
app.use(bodyParser.json());
app.use(cookieParser());



// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Endpoint to handle API key submission
app.post('/api/v1/setapikey', (req, res) => {
    // Assuming req.body contains the submitted API keys array
    const submittedApiKeys = req.body;

    // Encrypt the API keys
    const encryptedApiKeys = encryptApiKeys(submittedApiKeys);

    // Set encrypted keys as cookie
    res.cookie('apiKeys', JSON.stringify(encryptedApiKeys), { httpOnly: false, maxAge: 60 * 60 * 24 * 60 * 1000, expires: false });

    // Respond with a success message
    res.json({ success: true, message: 'API keys received and processed successfully.' });
});


app.post('/api/v1/getInventory', async (req, res) => {
    try {
        // Call the `getInventory` function to get the combined inventory
        const inventory = await getInventory(req);
        // Respond with the inventory data
        res.json({ success: true, inventory });
    } catch (error) {
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/getStats', async (req, res) => {
    try {
        // Extract the request body
        const { secondsback, lbname } = req.body;

        // Call the getStats function to retrieve the stats
        const stats = await getStats(req, secondsback, lbname);

        // Respond with the stats data
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error in /api/v1/getStats endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/getSecurityEvents', async (req, res) => {
    try {
        // Extract the request body
        const { secondsback, sec_event_type } = req.body;

        // Call the getSecurityEvents function to retrieve the security events
        const securityEvents = await getSecurityEvents(req, secondsback, sec_event_type);

        // Respond with the security events data
        res.json({ success: true, securityEvents });
    } catch (error) {
        console.error('Error in /api/v1/getSecurityEvents endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
