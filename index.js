// Developed by: John Cianfarani (https://github.com/john-cianfarani/xctoolkit)
// First Published Date: 2024-08-09
// Main function to orchestrate the API and web server
// 
//
// /api/v1/X - API endpoint

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const util = require('util');
const config = require('./config.js');
const https = require('https');
const http = require('http');
const fs = require('fs')
const forge = require('node-forge');
const app = express();

const keyPath = path.join(__dirname, './certs/key.pem');
const certPath = path.join(__dirname, './certs/cert.pem');

const {

    fetchWhoami,
    getManagedTenantsList,
    getTenantAge,
    getNSDetails,
    getTenantUsers,
    getSecurityEvents,
    getApiEndpoint,
    getInventory,
    getStats,
    getLatencyLogs,
    getLogs,
    execCopyWafExclusion,
    getSetsList,
    getConfig,
    putConfig,
    getBackup,
    decryptData,
    encryptApiKeys,
} = require('./xcapi');


// Middleware to parse JSON bodies and cookies
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());


// Start HTTP server if enabled
if (config.server.enableHttp) {
    app.listen(config.server.httpPort, () => {
        console.log(`HTTP server running on HTTP://${config.server.host}:${config.server.httpPort}`);
    });
}

// Ensure HTTPS certificates exist if not creates them
ensureCertificatesExist();

// Start HTTPS server if enabled
if (config.server.enableHttps) {
    // Read private key and certificate
    const privateKey = fs.readFileSync(config.server.httpsPrivateKey, 'utf8');
    const certificate = fs.readFileSync(config.server.httpsCertificate, 'utf8');

    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(config.server.httpsPort, () => {
        console.log(`HTTPS server running on HTTPS://${config.server.host}:${config.server.httpsPort}`);
    });
}




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

// Endpoint to handle Delegated API key submission
app.post('/api/v1/setdelegatedapikey', (req, res) => {
    // Assuming req.body contains the submitted API keys array
    const submittedApiKeys = req.body;

    // Encrypt the API keys
    const encryptedApiKeys = encryptApiKeys(submittedApiKeys);

    // Set encrypted keys as cookie
    res.cookie('delegated_apiKeys', JSON.stringify(encryptedApiKeys), { httpOnly: false, maxAge: 60 * 60 * 24 * 60 * 1000, expires: false });

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

app.post('/api/v1/getManagedTenants', async (req, res) => {
    try {
        // Call the `getManagedTenantsList` function to get the list of all delegated tenants
        const managedtenants = await getManagedTenantsList(req);
        // Respond with the delegated tenants list
        res.json({ success: true, managedtenants });
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

app.post('/api/v1/getTenantAge', async (req, res) => {
    try {
        // Extract the inventory parameter from the request body
        const { inventory } = req.body;

        // Call the getTenantAge function to retrieve the age data for tenants
        const tenantAges = await getTenantAge(req, inventory);

        // Respond with the tenant ages data
        res.json({ success: true, tenantAges });
    } catch (error) {
        console.error('Error in /api/v1/getTenantAge endpoint:', error);
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
        //console.log("API - getTenantUsers: ", tenant, limit);

        const userDetails = await getTenantUsers(req, tenant, limit);

        //console.log("API - getTenantUsers: ", userDetails);
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

        //console.log("API - getSecurityEvents: ", securityEvents);

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

        //console.log("API - getApiDiscEndpoints: ", apiendpoints);

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


        //console.log('API - getLogs Data property:', util.inspect(logs, { showHidden: false, depth: null, colors: true }));
        //validateJsonFormat(logs);

        // Respond with the security events data
        res.json({ success: true, logs });
    } catch (error) {
        console.error('Error in /api/v1/getLogs endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});


app.post('/api/v1/getLatencyLogs', async (req, res) => {
    try {
        // Extract the request body
        const { tenant, namespace, lbname, secondsback, maxlogs, topx } = req.body;
        console.log("getLatencyLogs - API - Request Parameters: ", tenant, namespace, lbname, secondsback, maxlogs, topx);

        // Call the getLatencyLogs function to retrieve and process the latency logs
        const logs = await getLatencyLogs(req, tenant, namespace, lbname, secondsback, maxlogs, topx);

        //console.log('API - getLatencyLogs Data property:', util.inspect(logs, { showHidden: false, depth: null, colors: true }));
        // Respond with the processed latency logs data
        res.json({ success: true, logs });
    } catch (error) {
        console.error('Error in /api/v1/getLatencyLogs endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/execCopyWafExclusion', async (req, res) => {
    try {
        // Extract the request body for source and destination
        const {
            sourceTenant, sourceNamespace, sourceLbName,
            destinationTenant, destinationNamespace, destinationLbName
        } = req.body;
        console.log("execCopyWafExclusion - API - Request Parameters: ",
            sourceTenant, sourceNamespace, sourceLbName,
            destinationTenant, destinationNamespace, destinationLbName);

        // Call the execCopyWafExclusion function to copy the WAF exclusion rules
        await execCopyWafExclusion(req, sourceTenant, sourceNamespace, sourceLbName,
            destinationTenant, destinationNamespace, destinationLbName);

        console.log('API - execCopyWafExclusion completed successfully from',
            sourceTenant, sourceNamespace, sourceLbName, 'to',
            destinationTenant, destinationNamespace, destinationLbName);
        res.json({ success: true, message: "WAF exclusion rules copied successfully." });
    } catch (error) {
        console.error('Error in /api/v1/execCopyWafExclusion endpoint:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});


// API endpoint to get sets
app.post('/api/v1/getSetsList', async (req, res) => {
    try {
        // Extract parameters from the request body
        const { tenant, namespace } = req.body;


        // Call the getSets function to retrieve the sets
        const sets = await getSetsList(req, tenant, namespace);

        //console.log('API - getSets Data:', JSON.stringify(sets, null, 2));
        // Respond with the sets data
        res.json({ success: true, sets });
    } catch (error) {
        console.error('Error in /api/v1/getSets endpoint:', error);
        // Handle any errors by responding with an error message
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/getConfig', async (req, res) => {
    try {
        // Extract parameters from the request body
        const { tenant, namespace, type, objname } = req.body;
        //console.log("getConfig - API - Request Parameters:", tenant, namespace, type, objname);

        // Call the getConfig abstraction function to retrieve configuration
        const configData = await getConfig(req, tenant, namespace, type, objname);

        //console.log('API - getConfig Data:', JSON.stringify(configData, null, 2));
        // Respond with the configuration data
        res.json({ success: true, config: configData });
    } catch (error) {
        console.error('Error in /api/v1/getConfig endpoint:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Used for testing API keys
app.post('/api/v1/testApikey', async (req, res) => {
    try {
        // Extract parameters from the request body
        const { tenant, encryptedKey, parent_tenant } = req.body;

        // Decrypt the API key
        const apikey = decryptData(encryptedKey);
        console.log("testApikey - API - Request Parameters:", tenant);

        // Call the fetchAPI directly just to test the API Key
        const responseData = await fetchWhoami(apikey, tenant, parent_tenant);

        //console.log('API - testApikey Data:', JSON.stringify(responseData, null, 2));
        // Respond with the configuration data
        res.json({ success: true, config: responseData });
    } catch (error) {
        console.error('Error in /api/v1/testApikey endpoint:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/putConfig', async (req, res) => {
    try {
        const { tenant, namespace, type, objname, newData } = req.body;


        if (!type || !objname) {
            return res.status(400).json({ success: false, message: "Type and object name must be provided for the update." });
        }

        // Call the putConfig function to update configuration
        const updateResponse = await putConfig(req, tenant, namespace, type, objname, newData);

        // Respond with the result of the update operation
        res.json({ success: true, updateResponse });
    } catch (error) {
        console.error('Error in /api/v1/putConfig endpoint:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/v1/getBackup', async (req, res) => {
    try {
        // Extract parameters from the request body
        const { tenant, namespace, backupShared } = req.body;
        console.log("getBackup - API - Request Parameters:", tenant, namespace, backupShared);

        // Call the getBackup function to perform the backup process
        const zipContent = await getBackup(req, tenant, namespace, backupShared);

        // Determine current UTC time in a readable format
        const utcNow = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');

        // Determine if 'shared' should be part of the filename
        const sharedSuffix = backupShared ? '_shared' : '';

        // Set proper headers for file download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${tenant}_${namespace}${sharedSuffix}_${utcNow}_backup.zip`);

        // Send the zip file as a response
        res.send(zipContent);
    } catch (error) {
        console.error('Error in /api/v1/getBackup endpoint:', error);
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

function generateCertificates() {
    // Generate a keypair and create an X.509v3 certificate
    const keys = forge.pki.rsa.generateKeyPair(4096);
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01'; // Serial number can be dynamically generated or hardcoded
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10); // 10 year validity

    const attrs = [
        { name: 'commonName', value: 'xctoolkit.local' },
        { name: 'countryName', value: 'US' },
        { name: 'stateOrProvinceName', value: 'State' },
        { name: 'localityName', value: 'City' },
        { name: 'organizationName', value: 'Organization' }
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs); // self-signed, so issuer is also subject
    cert.sign(keys.privateKey, forge.md.sha256.create());

    // Convert a Forge certificate to PEM format
    const certPem = forge.pki.certificateToPem(cert);
    const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

    // Write the key and cert to disk
    fs.writeFileSync(keyPath, keyPem);
    fs.writeFileSync(certPath, certPem);

    console.log('Certificates generated and saved.');
}

function ensureCertificatesExist() {
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        console.log('Certificate or key file missing, generating new ones...');
        generateCertificates();
    } else {
        console.log('Certificate and key files already exist.');
    }
}