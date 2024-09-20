![Logo](/public/images/xctoolkit_logo_dark.png)


# XC Toolkit



XC Toolkit provides with a variety of functions to help you on your journey with F5's Distributed Cloud Platform.

This toolkit provides options to enhance your visibility of  deployed Load Balancers across multiple tenants and
namespaces.

Additional tools are available to help with extracting data and managing configuration.

XC Toolkit itself is a standalone Node.js application that is designed to be run either locally or within a docker container.

Please note that XC Toolkit is provided "AS-IS" without warranties of any kind, either expressed or implied.


# Features

Current features of the toolkit are as follows:

v1.1
- Delegated Access - Add tenants which have access delegated via another tenant. Allows the ability to easily add multiple tenants via one API key.
- Quota List - List quote elements per tenant, sorted by percentage consumed. Search also available.
- Improved retry logic with exponential backoff. Allows for more tenants to be added.
- Batching of API calls. Currently only getStats is batched, as this seemed to be one of the heaviest calls on to the XC platform.
- Collapse All and Expand All added to Overview.
- Minor bug fixes and general logic updates.

v1.0 
 - Stateless architecture -  No API Keys or cached data is intentionally stored serverside.  All sensitive data is stored on the client side browser.  API Keys are further stored encrypted.
 - Multi-Tenant Overview - View multiple tenant and namespaces, as well as enabled features in a single pane of glass dashboard.
 - Per Path Latency Breakdown - Visualize various latency metrics on a per endpoint basis.
 - Export Access and Security Logs - Export extended amount of log files.
 - Export API Endpoints
 - Copy WAF Exclusion Rules
 - Editor for IP Prefix / BGP ASN Sets
 - Backup

---

## Installation

Two methods of running the application exist.

 - Direct NodeJS
 - Docker

 The app needs both an encryptionkey and https certs.  Both of these are checked for on startup and created if missing.

### Direct NodeJS

### MacOS/Linux
Node.js and Git  are required to complete these steps. See the commands below to check if they are installed.

```sh
~# node -v
v18.20.3

~# git --version
git version 2.34.1

```

```sh
git clone https://github.com/john-cianfarani/xctoolkit.git

cd xctoolkit

npm install

npm start
```
The web ui should now be accessible on http://127.0.0.1:3080 or https://127.0.0.1:3443

---

## Updates

To update a Node.js based installation, docker currently has to be rebuilt.

Enter the original install directory.
```sh
cd xctoolkit

git pull

npm install

npm start
```

---
### Docker

### MacOS/Linux
This assumes you have docker installed and running on the host.
```sh
    git clone https://github.com/john-cianfarani/xctoolkit.git
    
    cd xctoolkit

    docker build -f docker/dockerfile . -t xctoolkit:latest
```    

Once completed the docker container should be added to your list of docker images.
```sh
    docker image list

   
    REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
    xctoolkit    latest    b1e6c0593347   24 hours ago   1.04GB
```    

After confirmation the docker container can be started with the following command.

```sh
    docker run -p 3080:3080 -p 3443:3443 -d xctoolkit
```

---

### Advanced Parameters

This section details adjustable parameters that can be configured either directly in `config.js` or by setting environment variables.

#### Environmental Variables

- **`KEY`**: Sets the encryption key for protecting API keys.
- **`SERVER_HOST`**: Specifies the server hostname. Default: `localhost`.
- **`ENABLE_HTTP`**: Enables or disables HTTP. Accepts `true` or `false`. Default: `true`.
- **`HTTP_PORT`**: Specifies the port for the HTTP server. Default: `3080`.
- **`ENABLE_HTTPS`**: Enables or disables HTTPS. Accepts `true` or `false`. Default: `true`.
- **`HTTPS_PORT`**: Specifies the port for the HTTPS server. Default: `3443`.
- **`HTTPS_PRIVATE_KEY`**: Path to the HTTPS private key file. Automatically generated on the first run. Default: `./certs/key.pem`.
- **`HTTPS_CERTIFICATE`**: Path to the HTTPS certificate file. Automatically generated on the first run. Default: `./certs/cert.pem`.
- **`API_RETRY`**: Sets the retry count for failed API calls. Increase this if adding many tenants causes queries to fail. Default: `4`.
- **`API_BACKOFF_JITTER`**: Sets the backoff jitter delay for API retries, measured in milliseconds. Default: `500`.
- **`API_BATCH_SIZE`**: Sets the batch size for batched API calls (currently only applies to `getStats`). Default: `6`.
- **`LOG_LEVEL`**: Adjusts the logging level within the application for troubleshooting. Values range from 0 (off) to 4 (debug). Default: `2` (info).

---

### API Key Security

Efforts are focused on ensuring the security of API keys:

- **Storage**: API keys are encrypted using AES-256-CBC and stored client-side in cookies, never on the server.
- **Encryption Key**: At startup, the server checks for an encryption key in the `KEY` environment variable or in `./encryption.txt`. If not found, a random key is generated and stored in `./encryption.txt`.
- **Data Flow**:
  - **Submission**: Users submit their API key via the web interface.
  - **Encryption**: The key is encrypted and returned to the user's browser as a cookie.  apiKeys and delegated_apiKeys
  - **Usage**: For operations requiring API key access, the encrypted cookie is sent to the server for decryption.

![API Key Security Workflow](/public/screenshots/apikey-security-callflow.png)

---

### Application Screenshots


<img src="/public/screenshots/overview.png" width="750">


<img src="/public/screenshots/backup.png" width="750">


<img src="/public/screenshots/quota.png" width="750">

---





