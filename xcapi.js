const axios = require('axios');
const fs = require('fs');

// Function to make Pull list of Namespaces
async function fetchNamespaces(tenant, apikey) {
    const namespaces = {};
    try {
        // Construct the URL with variables using string interpolation
        const url = `https://${tenant}.console.ves.volterra.io/api/web/namespaces`;

        // Make GET request to the constructed URL with Authorization header
        const response = await axios.get(url, {
            headers: {
                'Authorization': `APIToken ${apikey}`,
                'accept': 'application/json'
            }
        });

        response.data.items.forEach(item => {
            namespaces[item.name] = item.description;
        });

        return namespaces;

    } catch (error) {
        // Handle any errors that occur during the request
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be caught by the caller if necessary
    }
}

async function fetchLbs(tenant, apikey, namespace) {
    const lbs = {};
    try {
        // Construct the URL with variables using string interpolation
        const url = `https://${tenant}.console.ves.volterra.io/api/config/namespaces/${namespace}/http_loadbalancers?report_fields=string`;

        // Make GET request to the constructed URL with Authorization header
        const response = await axios.get(url, {
            headers: {
                'Authorization': `APIToken ${apikey}`,
                'accept': 'application/json'
            }
        });

        //Build return
        response.data.items.forEach(item => {

            const uid = item.uid;
            const name = item.name;
            const description = item.description;
            const namespace = item.namespace;
            const domains = item.get_spec.domains;

        
            const obj = {
                name: name,
                description: description,
                namespace: namespace,
                domains: domains
            };

            lbs[uid] = obj;

        });


        return lbs;

    } catch (error) {
        // Handle any errors that occur during the request
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be caught by the caller if necessary
    }
}

async function fetchConfig(tenant, apikey, namespace, type, objname) {
    try {

        // types examples
        //http_loadbalancers, app_firewalls, origin_pools, healthchecks, ip_prefix_sets, rate_limiter, rate_limiter_policys, routes

        // Construct the URL with variables using string interpolation
        const url = `https://${tenant}.console.ves.volterra.io/api/config/namespaces/${namespace}/${type}/${objname}`;



        // Make GET request to the constructed URL with Authorization header
        const response = await axios.get(url, {
            headers: {
                'Authorization': `APIToken ${apikey}`,
                'accept': 'application/json'
            }
        });

        return response.data;

    } catch (error) {
        // Handle any errors that occur during the request
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be caught by the caller if necessary
    }
}


async function fetchHealthchecks(tenant, apikey, namespace, lbname ) {
    try {
        const url = `https://${tenant}.console.ves.volterra.io/api/data/namespaces/${namespace}/graph/service/node/instances`;
        
        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `APIToken ${apikey}`,
            'x-volterra-apigw-tenant': tenant
        };

        // Calculate the epoch time for the last 5 minutes
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const fiveMinutesAgo = currentTime - (15 * 60); // 5 minutes ago in seconds


        const requestData = {
            field_selector: {
                metric: {
                    upstream: ["REQUEST_THROUGHPUT", "RESPONSE_THROUGHPUT", "HTTP_RESPONSE_LATENCY", "HTTP_REQUEST_RATE", "HTTP_ERROR_RATE", "HTTP_ERROR_RATE_5XX", "SERVER_RTT", "TCP_CONNECTION_RATE"]
                },
                healthscore: {
                    types: ["HEALTHSCORE_OVERALL"]
                }
            },
            step: "300s",
            end_time: currentTime.toString(),
            start_time: fiveMinutesAgo.toString(),
            label_filter: [{
                label: "LABEL_VHOST",
                op: "EQ",
                value: `ves-io-http-loadbalancer-${lbname}`
            }]
        };

        const response = await axios.post(url, requestData, { headers });

        // Initialize an empty object to store the parsed data
        const obj = {};

        // // Iterate over the instances array
        response.data.data.instances.forEach(instance => {
            const { id, data } = instance;
            const { site } = id;
            const { metric, healthscore } = data;
            const metricsObj = {};

            //console.log( `---  ${metric.upstream} -  ${metric.upstream} ---` );

            if (metric !== null) {
                metric.upstream.forEach(metric => {
                    const { type, value } = metric;
                    metricsObj[type] = value.raw[0].value;

                });
            }

            // Extract the overall health score
            const overallHealthScore = healthscore.data[0].value[0].value;

            if (!obj[lbname]) {
               obj[lbname] = {};
               obj[lbname][site] = {};
            }

            obj[lbname][site] = {
                ...metricsObj,
                HEALTHSCORE_OVERALL: overallHealthScore
            };
        });

        return obj;
    } catch (error) {
        console.error('Error fetching healthchecks:', error);
        throw error;
    }
}

async function uploadCertificate(tenant, apiKey, namespace, certName, certUrlPath, privateKeyPath) {
    try {
        // Read certificate and private key files and encode them as Base64
        const certBase64 = fs.readFileSync(certUrlPath, 'base64');
        const privateKeyBase64 = fs.readFileSync(privateKeyPath, 'base64');

        // Prepare the request body
        const requestBody = {
            metadata: {
                name: certName, 
                namespace: namespace
            },
            spec: {
                certificate_url: `string:///${certBase64}`,
                private_key: {
                    clear_secret_info: {
                        url: `string:///${privateKeyBase64}`
                    }
                }
            }
        };

        // Prepare the URL
        const url = `https://${tenant}.console.ves.volterra.io/api/config/namespaces/${namespace}/certificates`;

        // Prepare the headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `APIToken ${apiKey}`,
            'x-volterra-apigw-tenant': tenant
        };

        // Make the POST request
        const response = await axios.post(url, requestBody, {
            headers: headers
        });

        console.log('Certificate uploaded successfully:', response.data);
    } catch (error) {
        console.error('Error uploading certificate:', error);
    }
}




//Export Functions
module.exports = {
    fetchNamespaces,
    fetchConfig,
    fetchLbs,
    fetchHealthchecks,
    uploadCertificate

};


