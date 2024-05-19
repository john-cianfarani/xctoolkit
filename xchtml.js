const express = require('express');
const path = require('path');
const app = express();
const port = 3080;
const nodemon = require('nodemon');

// Serve static files 
app.use(express.static(path.join(__dirname, 'public' )));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Start nodemon
nodemon({
    script: 'xchtml.js', // your main server file
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