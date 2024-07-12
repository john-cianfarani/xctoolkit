
// Main function to orchestrate the API and web server
// 
//
// /api/v1/X - API endpoint

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const util = require('util');

const {
    fetchNamespaces,
    fetchConfig,
    fetchLbs,
    fetchHealthchecks,
    fetchStats,
    uploadCertificate,
    fetchInventory,
    getNSDetails,
    getTenantUsers,
    getSecurityEvents,
    getApiEndpoint,
    getInventory,
    getStats,
    getLogs,
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
app.use(bodyParser.json({ limit: '50mb' }));
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
        const { inventory, secondsback, lbname } = req.body;

        // Call the getStats function to retrieve the stats
        const stats = await getStats(req, inventory, secondsback, lbname);

        // Respond with the stats data
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error in /api/v1/getStats endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/getNSDetails', async (req, res) => {
    try {
        // Extract the request body
        const { tenant, namespace } = req.body;

        // Call the getNSDetails function to retrieve the stats
        const stats = await getNSDetails(req, tenant, namespace);

        // Respond with the stats data
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error in /api/v1/getNSDetails endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/getTenantUsers', async (req, res) => {
    try {
        // Extract the request body
        const { tenant, limit } = req.body;
        console.log("API - getTenantUsers: ", tenant, limit);

        const userDetails = await getTenantUsers(req, tenant, limit);

        console.log("API - getTenantUsers: ", userDetails);
        res.json({ success: true, userDetails });
    } catch (error) {
        console.error('Error in /api/v1/getTenantUsers endpoint:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


app.post('/api/v1/getSecurityEvents', async (req, res) => {
    try {
        // Extract the request body
        const { inventory, secondsback, sec_event_type } = req.body;
        console.log(" getSecurityEvents - API - Inventory: ", inventory);

        // Call the getSecurityEvents function to retrieve the security events
        const securityEvents = await getSecurityEvents(req, inventory, secondsback, sec_event_type);

        console.log("API - getSecurityEvents: ", securityEvents);

        // Respond with the security events data
        res.json({ success: true, securityEvents });
    } catch (error) {
        console.error('Error in /api/v1/getSecurityEvents endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/getApiDiscEndpoints', async (req, res) => {
    try {
        // Extract the request body
        const { tenant, namespace, lbname, secondsback } = req.body;
        console.log(" getApiDiscEndpoints - API - Endpoints: ", tenant, namespace, lbname, secondsback);

        // Call the getSecurityEvents function to retrieve the security events
        const apiendpoints = await getApiEndpoint(req, tenant, namespace, lbname, secondsback);

        console.log("API - getApiDiscEndpoints: ", apiendpoints);

        // Respond with the security events data
        res.json({ success: true, apiendpoints });
    } catch (error) {
        console.error('Error in /api/v1/getApiDiscEndpoints endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});


app.post('/api/v1/getLogs', async (req, res) => {
    try {
        // Extract the request body
        const { tenant, namespace, lbname, secondsback, logtype, additionalfilters, maxlogs, filetype } = req.body;
        console.log(" getLogs - API - Logs: ", tenant, namespace, lbname, secondsback, logtype, additionalfilters, maxlogs, filetype);

        // Call the getSecurityEvents function to retrieve the security events
        const logs = await getLogs(req, tenant, namespace, lbname, secondsback, logtype, additionalfilters, maxlogs);


        console.log('API - getLogs Data property:', util.inspect(logs, { showHidden: false, depth: null, colors: true }));
        //validateJsonFormat(logs);
        //console.log("Logs: ", logs);

        // Respond with the security events data
        res.json({ success: true, logs });
    } catch (error) {
        console.error('Error in /api/v1/getLogs endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});


function validateJsonFormat(jsonData) {
    let jsonObject;

    try {
        jsonObject = JSON.parse(jsonData);
    } catch (error) {
        console.error("Failed to parse JSON:", error);
        return false;
    }

    for (const [key, value] of Object.entries(jsonObject)) {
        if (typeof value !== 'string') {
            console.error(`Validation Error: Expected string for key '${key}', but found type '${typeof value}'`);
            return false;
        }
    }

    console.log("All fields are valid strings.");
    return true;
}


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
