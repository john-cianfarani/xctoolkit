const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const { fetchNamespaces, fetchConfig, fetchLbs, fetchHealthchecks, fetchStats, uploadCertificate, generateCertificate, encryptApiKeys, fetchUsers, fetchConfigItems } = require('./xcapi');

const app = express();
const port = 3080;

// Sample encryption key (replace with your own)
const encryptionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Middleware to parse JSON bodies and cookies
app.use(bodyParser.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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
    res.cookie('apiKeys', JSON.stringify(encryptedApiKeys), { httpOnly: false });

    // Respond with a success message
    res.json({ success: true, message: 'API keys received and processed successfully.' });
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
