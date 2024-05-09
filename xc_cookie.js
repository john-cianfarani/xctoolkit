const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');
const nodemon = require('nodemon');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON bodies and cookies
app.use(bodyParser.json());
app.use(cookieParser());

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cookietest.html'));
});

// Route for encrypting and setting cookie
app.post('/encryptAndSetCookie', (req, res) => {
    const requestData = req.body;

    // Array to store encrypted data
    const encryptedData = [];

    requestData.forEach(data => {
        const encryptedObject = {};

        // Encrypt values
        encryptedObject.tenant = encrypt(data.tenant);
        encryptedObject.namespace = encrypt(data.namespace);
        encryptedObject.key = encrypt(data.key);

        encryptedData.push(encryptedObject);
    });

    // Set cookie with encrypted JSON
    res.cookie('encryptedData', JSON.stringify(encryptedData));
    
    res.send('Values encrypted and cookie set successfully.');
});

// Route for validating and logging clear text values
app.get('/validate', (req, res) => {
    const encryptedData = req.cookies.encryptedData;

    if (!encryptedData) {
        res.status(400).send('No encrypted data found in cookie.');
        return;
    }

    // Decrypt encrypted data
    const decryptedData = JSON.parse(encryptedData).map(obj => ({
        tenant: decrypt(obj.tenant),
        namespace: decrypt(obj.namespace),
        key: decrypt(obj.key)
    }));

    // Log clear text values to console
    console.log('Decrypted data:', decryptedData);
    
    res.send('Clear text values logged to console.');
});

// Function to encrypt data
function encrypt(data) {
    const cipher = crypto.createCipher('aes192', 'your_encryption_key');
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Function to decrypt data
function decrypt(data) {
    const decipher = crypto.createDecipher('aes192', 'your_encryption_key');
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Start nodemon
nodemon({
    script: 'xc_cookie.js', // your main server file
    ext: 'js html', // watch for changes in JS and HTML files
    ignore: ['node_modules/'] // ignore changes in the node_modules directory
});

// Close the server gracefully on nodemon restart
nodemon.on('restart', () => {
    console.log('Server restarting...');
    server.close(() => {
        console.log('Server closed.');
    });
});
