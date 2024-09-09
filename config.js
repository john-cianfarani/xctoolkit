

const config = {

    logLevel: process.env.LOG_LEVEL || '2', // 0 - off, 1 - always on, 2 - info (default), 3 - verbose, 4 - debug,
    apiRetry: parseInt(process.env.API_RETRY, 10) || 4, // Set API retry count for failed API calls increase if many tenants are added and queries are failing
    apiBackoffJitter: parseFloat(process.env.API_BACKOFF_JITTER, 10) || 500, // Set API backoff jitter delay in milliseconds.  If API calls are increase if many tenants are added and queries are failing
    apiBatchSize: parseInt(process.env.API_BATCH_SIZE, 10) || 6, // Set API batch size for batched API calls

    server: {
        host: process.env.SERVER_HOST || 'localhost',
        enableHttp: process.env.ENABLE_HTTP || true,
        httpPort: parseInt(process.env.HTTP_PORT, 10) || 3080,
        enableHttps: process.env.ENABLE_HTTPS || true,
        httpsPort: parseInt(process.env.HTTPS_PORT, 10) || 3443,
        httpsPrivateKey: process.env.HTTPS_PRIVATE_KEY || './certs/key.pem',
        httpsCertificate: process.env.HTTPS_CERTIFICATE || './certs/cert.pem'

    }

};

module.exports = config;
