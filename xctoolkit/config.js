// const CONFIG_SECRET_KEY = 'mysecretkey';

// module.exports = {
//     CONFIG_SECRET_KEY: CONFIG_SECRET_KEY
// }

// config.js

const config = {

    server: {
        host: process.env.SERVER_HOST || 'http://localhost',
        httpport: parseInt(process.env.HTTPPORT, 10) || 3080,
        httpsport: parseInt(process.env.HTTPSPORT, 10) || 3080
    },
    encryptionKey: process.env.SECRET_KEY || 'your_default_secret_key'
};

module.exports = config;
