

const config = {

    logLevel: process.env.LOG_LEVEL || '2', // 0 - off, 1 - always on, 2 - info, 3 - verbose, 4 - debug,

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
