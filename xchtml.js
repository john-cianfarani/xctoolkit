const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

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
app.post('/setapikey', (req, res) => {
    // Assuming req.body contains the submitted API keys array
    const submittedApiKeys = req.body;

    // Encrypt the API keys
    const encryptedApiKeys = encryptApiKeys(submittedApiKeys);

    // Set encrypted keys as cookie
    res.cookie('apiKeys', JSON.stringify(encryptedApiKeys), { httpOnly: false });

    // Respond with a success message
    res.json({ success: true, message: 'API keys received and processed successfully.' });
});

// Function to encrypt API keys
function encryptApiKeys(apiKeys) {
    const processedKeys = apiKeys.map(apiKey => {
        // Check if the API key is already encrypted
        if (apiKey["apikey-format"] === 'enc') {
            return {
                "apikey-type": apiKey["apikey-type"],
                "tenant-name": apiKey["tenant-name"],
                "namespace-type": apiKey["namespace-type"],
                "namespace-name": apiKey["namespace-name"],
                "apikey-format": apiKey["apikey-format"],
                "apikey": apiKey["apikey"]
            };
        } else {
            // Encrypt the API key if not already encrypted
            return {
                "apikey-type": apiKey["apikey-type"],
                "tenant-name": apiKey["tenant-name"],
                "namespace-type": apiKey["namespace-type"],
                "namespace-name": apiKey["namespace-name"],
                "apikey-format": 'enc',
                "apikey": encrypt(apiKey["apikey"])
            };
        }
    });
    return processedKeys;
}

// Function to encrypt data
function encrypt(data) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.alloc(16, 0)); // Ensure encryptionKey is hex
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
