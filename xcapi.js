/// Main functions to support retrieving data from the F5XC API

// Naming Convention
// fetchX - Fetches data from the F5XC API
// getX - Supports nodejs API calls to abstract and transform the F5XC API calls
// encrypt / decrypt - Encrypts and decrypts data

const axios = require('axios');
const fs = require('fs');
const util = require('util');
const crypto = require('crypto');

const forge = require('node-forge'); //Generate Certificates
const pki = forge.pki; // Generate Certificates


const encryptionKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Global headers
const headers = (tenant, apikey) => ({
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `APIToken ${apikey}`,
    'x-volterra-apigw-tenant': tenant
});


const ONE_MINUTE = 60; // 1 minute
const FIVE_MINUTES = 5 * 60; // 5 minutes
const ONE_HOUR = 60 * 60; // 1 hour
const SIX_HOURS = 6 * 60 * 60; // 6 hours
const ONE_DAY = 24 * 60 * 60; // 1 day
const ONE_WEEK = 7 * 24 * 60 * 60; // 1 week

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

async function fetchUsers(tenant, apikey, limit = null) {
    const users = [];
    try {
        // Construct the URL with variables using string interpolation
        const url = `https://${tenant}.console.ves.volterra.io/api/web/custom/namespaces/system/user_roles`;

        // Make GET request to the constructed URL with Authorization header
        const response = await axios.get(url, {
            headers: {
                'Authorization': `APIToken ${apikey}`,
                'accept': 'application/json'
            }
        });

        //Build return
        response.data.items.forEach(item => {
            const name = item.name;
            const email = item.email;
            const firstname = item.first_name;
            const lastname = item.last_name;
            const lastlogin = item.last_login_timestamp;


            const obj = {
                name: name,
                fullname: firstname + ' ' + lastname,
                email: email,
                lastlogin: lastlogin
            };

            users.push(obj);

        });

        // Sort users by last login time in descending order
        users.sort((a, b) => new Date(b.lastlogin) - new Date(a.lastlogin));

        // If limit is specified, return only the top X users
        if (limit) {
            return users.slice(0, limit);
        }

        return users;

    } catch (error) {
        // Handle any errors that occur during the request
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be caught by the caller if necessary
    }
}


async function fetchConfig(tenant, apikey, namespace, type, objname = null) {
    try {

        // types examples
        //http_loadbalancers, app_firewalls, origin_pools, healthchecks, ip_prefix_sets, rate_limiter, rate_limiter_policys, routes

        // Construct the URL with variables using string interpolation

        let url = `https://${tenant}.console.ves.volterra.io/api/config/namespaces/${namespace}/${type}`;

        if (objname) {
            url += `/${objname}`;
        }

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

async function fetchConfigItems(tenant, apikey, namespace, type) {
    const list = [];
    try {
        const data = await fetchConfig(tenant, apikey, namespace, type);

        const items = data.items;
        items.forEach(item => {
            const name = item.name;
            const description = item.description;
            const namespace = item.namespace;
            const tenant = item.tenant;

            const obj = {
                name: name,
                description: description,
                namespace: namespace,
                tenant: tenant
            };

            list.push(obj);
        });

        //console.log("list:", list);
        return list;

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be caught by the caller if necessary
    }
}


async function fetchHealthchecks(tenant, apikey, namespace, lbname) {
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



/**
 * Fetches the stats of HTTP and TCP load balancers in the specified tenant.
 *
 * @param {string} tenant - The F5XC tenant.
 * @param {string} apikey - The F5XC API key.
 * @param {boolean} [allnsapi=true] - Whether to use the all namespaces API or just the app inventory API for the specified namespace.
 * @param {string} [namespace=null] - The namespace to filter results or for the inventory API URL (required if allnsapi is false).
 * @param {number} secondsback - The time range in seconds to fetch stats for.
 * @param {string} [lbname=null] - The load balancer name to filter results.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the stats data.
 * @throws {Error} - If a namespace is provided but allnsapi is set to false.
 * CLIENT_RTT: CLIENT LATENCY The time it takes for the client to send a request to the LB. 0.0189 = 18.9ms
 * SERVER_RTT: SERVER LATENCY The time it takes for the server to respond to a request from the LB. 0.05136 = 51.4ms
 * REQUEST_THROUGHPUT: From Downstream metric: Upstream Throughput The number of requests that are sent to the server per second. 18409 = 18.4kbps
 * RESPONSE_THROUGHPUT: From Downstream metric: Downstream Throughput The number of responses that are received from the server per second. 601091 = 601.09kbps
 * HTTP_REQUEST_RATE: The number of HTTP requests per second. 6.68 = 6.7/s
 * HTTP_APP_LATENCY: inconsistent doesn't always show up.
 */
async function fetchStats(tenant, apikey, allnsapi = true, namespace = null, secondsback, lbname = null) {
    try {
        // If allnsapi is true, set namespace to 'system'
        if (allnsapi) {
            namespace = 'system';
        } else if (!namespace) {
            throw new Error('Namespace must be provided if allnsapi is set to false');
        }

        // Construct the URL for the API request
        const url = allnsapi
            ? `https://${tenant}.console.ves.volterra.io/api/data/namespaces/system/graph/all_ns_service`
            : `https://${tenant}.console.ves.volterra.io/api/data/namespaces/${namespace}/graph/service`;

        // Calculate the epoch time for the desired time range
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const startTime = currentTime - secondsback;

        // Construct the request body based on the provided parameters
        const labelFilter = lbname
            ? [{ "label": "LABEL_VHOST", "op": "EQ", "value": `ves-io-http-loadbalancer-${lbname}` }]
            : [];

        const requestData = {
            "field_selector": {
                "node": {
                    "metric": {
                        "downstream": [
                            "SERVER_RTT",
                            "HTTP_SERVER_DATA_TRANSFER_TIME",
                            "CLIENT_RTT",
                            "HTTP_APP_LATENCY",
                            "HTTP_RESPONSE_LATENCY",
                            "HTTP_REQUEST_RATE",
                            "HTTP_ERROR_RATE",
                            "REQUEST_THROUGHPUT",
                            "RESPONSE_THROUGHPUT",
                            "HTTP_ERROR_RATE_5XX",
                            "HTTP_ERROR_RATE_4XX"
                        ]
                    },
                    "healthscore": {
                        "types": [
                            "HEALTHSCORE_OVERALL"
                        ]
                    }
                }
            },
            "end_time": currentTime.toString(),
            "start_time": startTime.toString(),
            "label_filter": labelFilter,
            "namespace": namespace,
            "group_by": [
                "VHOST",
                "NAMESPACE"
            ]
        };

        console.log('Request:', requestData);

        // Make the API request and get the response
        const response = await axios.post(url, requestData, { headers: headers(tenant, apikey) });

        // Initialize an empty object to store the parsed data
        const obj = {};

        // Iterate over the nodes in the response and extract the stats
        const nodes = response.data.data.nodes;
        nodes.forEach(node => {
            const { id, data } = node;
            const { metric, healthscore } = data;
            const metricsObj = {};

            if (metric !== null) {
                metric.downstream.forEach(metric => {
                    const { type, value } = metric;
                    metricsObj[type] = value.raw[0].value;
                });
            }

            // Extract the overall health score with validation
            let overallHealthScore = null;
            if (healthscore && healthscore.data && healthscore.data[0] && healthscore.data[0].value && healthscore.data[0].value[0]) {
                overallHealthScore = healthscore.data[0].value[0].value;
            }

            const nodeNamespace = id.namespace; // Use the namespace from the response

            // Create the nested structure for tenant -> namespace -> vhost
            if (!obj[tenant]) {
                obj[tenant] = {};
            }

            if (!obj[tenant][nodeNamespace]) { // Use nodeNamespace instead of namespace
                obj[tenant][nodeNamespace] = {};
            }

            const vhost = id.vhost;

            // Filter vhosts starting with 'ves-io-http-loadbalancer-' or 'ves-io-tcp-loadbalancer-'
            if (vhost.startsWith('ves-io-http-loadbalancer-') || vhost.startsWith('ves-io-tcp-loadbalancer-')) {
                const vhostName = vhost.replace('ves-io-http-loadbalancer-', '').replace('ves-io-tcp-loadbalancer-', '');

                if (!obj[tenant][nodeNamespace][vhostName]) { // Use nodeNamespace instead of namespace
                    obj[tenant][nodeNamespace][vhostName] = {};
                }

                obj[tenant][nodeNamespace][vhostName] = { // Use nodeNamespace instead of namespace
                    ...metricsObj,
                    HEALTHSCORE_OVERALL: overallHealthScore
                };
            }
        });

        return obj;
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
}






/**
 * Fetches the inventory of HTTP and TCP load balancers in the specified tenant.
 *
 * @param {string} tenant - The F5XC tenant.
 * @param {string} apikey - The F5XC API key.
 * @param {boolean} [allnsapi=true] - Whether to use the all namespaces api or just the app inventory api for the specified namespace.
 * @param {string} [namespaceFilter=null] - The namespace to filter results or for the inventory api url equired if allnsapi is false).
 * @returns {Promise<Object>} - A promise that resolves to an object containing the inventory data.
 * @throws {Error} - If a namespace is provided but allnsapi is set to false.
 */
async function fetchInventory(tenant, apikey, allnsapi = true, namespaceFilter = null) {
    try {
        +        console.log('Fetching inventory for tenant:', tenant + ', apikey:', apikey, ', allnsapi:', allnsapi, ', namespaceFilter:', namespaceFilter);
        // Construct the URL for the API request
        let url;
        if (allnsapi) {
            url = `https://${tenant}.console.ves.volterra.io/api/config/namespaces/system/all_application_inventory`;
        } else {
            if (!namespaceFilter) {
                throw new Error('Namespace must be provided if allnsapi is set to false');
            }
            url = `https://${tenant}.console.ves.volterra.io/api/config/namespaces/${namespaceFilter}/application_inventory`;
        }

        // Construct the request data
        const requestData = { "http_load_balancer_filter": {}, "tcp_load_balancer_filter": {} };

        // Make the API request and get the response
        const response = await axios.post(url, requestData, { headers: headers(tenant, apikey) });
        +        console.log('API request successful');

        // Initialize an empty object to store the parsed data
        const inventory = {};

        /**
         * Processes the results of the inventory API request and adds them to the inventory object.
         *
         * @param {string} lbtype - The type of load balancer ("http_loadbalancers" or "tcp_loadbalancers").
         * @param {Array} results - The array of load balancer objects.
         */
        //  JSON Example.
        // {
        //     "tenant_name": {
        //         "namespace_name": {
        //             "http_loadbalancers": {  // Or "tcp_loadbalancers"
        //                 "load_balancer_name": {
        //                     "config": {
        //                         "name": "string",
        //                         "namespace": "string",
        //                         "loadbalancer_algorithm": "string",
        //                         "dns_info": "string",
        //                         "vip_type": "string",
        //                         "domains": ["string"],
        //                         "http_listen_port_choice": "string",
        //                         "certification_status": "string",
        //                         "waf_policy_ref": [
        //                             {
        //                                 "tenant": "string",
        //                                 "namespace": "string",
        //                                 "name": "string"
        //                             }
        //                         ],
        //                         "http": true,
        //                         "waf": true,
        //                         "ddos_protection": true,
        //                         "bot_protection": true,
        //                         "api_protection": true,
        //                         "client_side_defense": true,
        //                         "namespace_service_policy": true,
        //                         "service_policy": true,
        //                         "ip_reputation": true,
        //                         "malicious_user_detection": true,
        //                         "private_advertisement": true,
        //                         "public_advertisment": true,
        //                         "waf_exclusion": true,
        //                         "ddos_mitigation": true,
        //                         "slow_ddos_mitigation": true,
        //                         "malicious_user_mitigation": true,
        //                         "trusted_client": true,
        //                         "trusted_client_ip_headers": true,
        //                         "api_schema_validation": true,
        //                         "api_definition": true,
        //                         "data_guard": true,
        //                         "csrf_protection": true,
        //                         "graph_ql_inspection": true,
        //                         "cookie_protection": true,
        //                         "client_blocking": true,
        //                         "cors_policy": true,
        //                         "routes": true,
        //                         "origin_server_subset": true,
        //                         "default_loadbalancer": true,
        //                         "mutual_tls": true,
        //                         "tls_security_level": "string",
        //                         "idle_timeout": 0,
        //                         "connection_idle_timeout": 0,
        //                         "certification_expiration_date": "string",
        //                         "api_discovery": true
        //                     }
        //                 }
        //             },
        //         }
        //     }
        // }

        function processResults(lbtype, results) {
            results.forEach(lb => {
                const namespace = lb.namespace;
                const lbName = lb.name;

                // Skip if namespaceFilter is provided and does not match the current namespace
                if (namespaceFilter && namespace !== namespaceFilter) return;

                if (!inventory[tenant]) inventory[tenant] = {};
                if (!inventory[tenant][namespace]) inventory[tenant][namespace] = {};
                if (!inventory[tenant][namespace][lbtype]) inventory[tenant][namespace][lbtype] = {};

                inventory[tenant][namespace][lbtype][lbName] = {
                    config: {
                        name: lb.name,
                        namespace: lb.namespace,
                        loadbalancer_algorithm: lb.loadbalancer_algorithm,
                        dns_info: lb.dns_info,
                        vip_type: lb.vip_type,
                        domains: lb.domains,
                        http_listen_port_choice: lb.http_listen_port_choice,
                        certification_status: lb.certification_status,
                        waf_policy_ref: lb.waf_policy_ref,
                        http: !!lb.http_enabled,
                        waf: !!lb.waf_enabled,
                        ddos_protection: !!lb.ddos_protection_enabled,
                        bot_protection: !!lb.bot_protection_enabled,
                        api_protection: !!lb.api_protection_enabled,
                        client_side_defense: !!lb.client_side_defense_enabled,
                        namespace_service_policy: !!lb.namespace_service_policy_enabled,
                        service_policy: !!lb.service_policy_enabled,
                        ip_reputation: !!lb.ip_reputation_enabled,
                        malicious_user_detection: !!lb.malicious_user_detection_enabled,
                        private_advertisement: !!lb.private_advertisement_enabled,
                        public_advertisment: !!lb.public_advertisment_enabled,
                        waf_exclusion: !!lb.waf_exclusion_enabled,
                        ddos_mitigation: !!lb.ddos_mitigation_enabled,
                        slow_ddos_mitigation: !!lb.slow_ddos_mitigation_enabled,
                        malicious_user_mitigation: !!lb.malicious_user_mitigation_enabled,
                        trusted_client: !!lb.trusted_client_enabled,
                        trusted_client_ip_headers: !!lb.trusted_client_ip_headers_enabled,
                        api_schema_validation: !!lb.api_schema_validation_enabled,
                        api_definition: !!lb.api_definition_enabled,
                        data_guard: !!lb.data_guard_enabled,
                        csrf_protection: !!lb.csrf_protection_enabled,
                        graph_ql_inspection: !!lb.graph_ql_inspection_enabled,
                        cookie_protection: !!lb.cookie_protection_enabled,
                        client_blocking: !!lb.client_blocking_enabled,
                        cors_policy: !!lb.cors_policy_enabled,
                        routes: !!lb.routes_enabled,
                        origin_server_subset: !!lb.origin_server_subset_enabled,
                        default_loadbalancer: !!lb.default_loadbalancer_enabled,
                        mutual_tls: !!lb.mutual_tls_enabled,
                        tls_security_level: lb.tls_security_level,
                        idle_timeout: lb.idle_timeout,
                        connection_idle_timeout: lb.connection_idle_timeout,
                        certification_expiration_date: lb.certification_expiration_date,
                        api_discovery: !!lb.api_discovery_enabled
                    }
                };
            });
        }

        // Process the HTTP load balancers
        if (response.data.http_loadbalancers && response.data.http_loadbalancers.httplb_results) {
            +            console.log('Processing HTTP load balancers');
            processResults('http_loadbalancers', response.data.http_loadbalancers.httplb_results);
        }

        // Process the TCP load balancers
        if (response.data.tcp_loadbalancers && response.data.tcp_loadbalancers.tcplb_results) {
            +            console.log('Processing TCP load balancers');
            processResults('tcp_loadbalancers', response.data.tcp_loadbalancers.tcplb_results);
        }

        return inventory;
    } catch (error) {
        +        console.error('Error fetching inventory:', error);
        -        console.error('Error fetching stats:', error);
        throw error;
    }
}

/**
 * Fetches security events from the specified tenant and namespace, aggregates the results,
 * and returns them in a structured JSON format.
 *
 * @param {string} tenant - The F5XC tenant.
 * @param {string} apikey - The F5XC API key.
 * @param {string} namespace - The namespace to filter results or for the inventory API URL.
 * @param {number} secondsback - The time range in seconds for fetching events (e.g., last hour).
 * @param {string} sec_event_type - The security event type to filter ('all', 'waf_sec_event', 'bot_defense_sec_event', 'api_sec_event', 'svc_policy_sec_event').
 * @returns {Promise<Object>} - A promise that resolves to an object containing the aggregated security events.
 * @throws {Error} - Throws an error if there is an issue fetching the security events.
 *
 * @example
 *
 * fetchSecurityEvents('my-tenant', 'my-apikey', 'my-namespace', 3600, 'all')
 *     .then(data => console.log('Security Events:', data))
 *     .catch(error => console.error('Error:', error));
 *
 * Output format:
 * {
 *   "tenant_name": {
 *     "namespace_name": {
 *       "loadbalancer_name": {
 *         "waf_sec_event": number,
 *         "bot_defense_sec_event": number,
 *         "api_sec_event": number,
 *         "svc_policy_sec_event": number,
 *         "total_events": number
 *       },
 *       ...
 *     },
 *     ...
 *   },
 *   ...
 * }
 *
 * Description:
 * - tenant_name: The name of the tenant.
 * - namespace_name: The name of the namespace.
 * - loadbalancer_name: The name of the load balancer (derived from the original key, with 'ves-io-http-loadbalancer-' or 'ves-io-tcp-loadbalancer-' removed).
 * - waf_sec_event: The count of WAF security events.
 * - bot_defense_sec_event: The count of bot defense security events.
 * - api_sec_event: The count of API security events.
 * - svc_policy_sec_event: The count of service policy security events.
 * - total_events: The total count of all security events.
 */
async function fetchSecurityEvents(tenant, apikey, namespace, secondsback, sec_event_type) {
    try {
        // Define the security event types
        const secEventTypes = ['waf_sec_event', 'bot_defense_sec_event', 'api_sec_event', 'svc_policy_sec_event'];

        // Helper function to construct the query based on sec_event_type
        const constructQuery = (type) => {
            return `{sec_event_type=~"${type}"}`;
        };

        // Calculate the epoch time for the desired time range
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const startTime = currentTime - secondsback;

        // Initialize an empty object to store the parsed data
        const obj = {};

        // Function to fetch events for a specific type
        const fetchEventsForType = async (type) => {
            const query = constructQuery(type);
            const requestData = {
                "namespace": namespace,
                "query": query,
                "aggs": {
                    "fieldAggregation_VH_NAME": {
                        "field_aggregation": {
                            "field": "VH_NAME"
                        }
                    }
                },
                "end_time": currentTime.toString(),
                "start_time": startTime.toString(),
            };

            console.log('Request:', requestData);

            const url = `https://${tenant}.console.ves.volterra.io/api/data/namespaces/${namespace}/app_security/events/aggregation`;
            const response = await axios.post(url, requestData, { headers: headers(tenant, apikey) });

            const buckets = response.data.aggs.fieldAggregation_VH_NAME.field_aggregation.buckets;
            return { type, buckets };
        };

        // Fetch events for all security event types if 'all' is specified, otherwise fetch for the given type
        const eventsData = sec_event_type === 'all'
            ? await Promise.all(secEventTypes.map(type => fetchEventsForType(type)))
            : [await fetchEventsForType(sec_event_type)];

        // Process the fetched events and combine them into the obj
        eventsData.forEach(({ type, buckets }) => {
            buckets.forEach(bucket => {
                const { key, count } = bucket;
                const loadbalancer = key.replace('ves-io-http-loadbalancer-', '').replace('ves-io-tcp-loadbalancer-', '');
                const nodeNamespace = namespace;

                if (!obj[tenant]) {
                    obj[tenant] = {};
                }

                if (!obj[tenant][nodeNamespace]) {
                    obj[tenant][nodeNamespace] = {};
                }

                if (!obj[tenant][nodeNamespace][loadbalancer]) {
                    obj[tenant][nodeNamespace][loadbalancer] = {
                        waf_sec_event: 0,
                        bot_defense_sec_event: 0,
                        api_sec_event: 0,
                        svc_policy_sec_event: 0,
                        total_events: 0
                    };
                }

                obj[tenant][nodeNamespace][loadbalancer][type] += parseInt(count, 10);
                obj[tenant][nodeNamespace][loadbalancer].total_events += parseInt(count, 10);
            });
        });

        return obj;
    } catch (error) {
        console.error('Error fetching security events:', error);
        throw error;
    }
}

async function getSecurityEvents(req, secondsback, sec_event_type) {
    try {
        // Step 1: Retrieve and decrypt API keys from the cookie
        const decryptedApiKeys = getDecryptedApiKeys(req);

        // Step 2: Remove duplicates and prioritize read keys over write keys
        const uniqueApiKeys = {};
        decryptedApiKeys.forEach(apiKey => {
            // Skip any disabled API keys
            if (apiKey['apikey-state'] === 'disabled') {
                return;
            }
            // Create a unique key based on tenant name and namespace name
            const key = `${apiKey['tenant-name']}-${apiKey['namespace-name']}`;
            // Store the API key if it's the first one we've seen for this tenant-namespace pair
            // Or if it's a read key and the current stored key is a write key
            if (!uniqueApiKeys[key] || (uniqueApiKeys[key]['apikey-type'] === 'write' && apiKey['apikey-type'] === 'read')) {
                uniqueApiKeys[key] = apiKey;
            }
        });

        // Step 3: Fetch security events for each unique tenant-namespace pair
        // `Promise.all` is used to run multiple asynchronous operations in parallel
        const securityEvents = await Promise.all(
            // Convert the values of the `uniqueApiKeys` object into an array and map over it
            Object.values(uniqueApiKeys).map(apiKey => {
                // Call the `fetchSecurityEvents` function for each API key
                console.log(`Fetching security events for tenant ${apiKey['tenant-name']} and namespace ${apiKey['namespace-name']}`);
                return fetchSecurityEvents(apiKey['tenant-name'], apiKey['apikey'], apiKey['namespace-name'], secondsback, sec_event_type);
            })
        );

        // Step 4: Merge all fetched security events into one
        let mergedSecurityEvents = {};
        securityEvents.forEach(event => {
            mergedSecurityEvents = mergeDeep(mergedSecurityEvents, event);
        });

        return mergedSecurityEvents; // Return the combined security events
    } catch (error) {
        console.error('Error fetching security events:', error);
        throw error;
    }
}


/**
 * Asynchronously retrieves the complete inventory by fetching inventories for each unique tenant-namespace pair.
 * @param {Object} req - The request object containing the cookies.
 * @returns {Promise<Object>} A promise that resolves to the combined inventory.
 * @throws {Error} Throws an error if there's an error fetching the inventory.
 * 
 */
async function getInventory(req) {
    try {
        // Step 1: Retrieve and decrypt API keys from the cookie
        const decryptedApiKeys = getDecryptedApiKeys(req);

        // Step 2: Remove duplicates and prioritize read keys over write keys
        const uniqueApiKeys = {};
        decryptedApiKeys.forEach(apiKey => {
            // Skip any disabled API keys
            if (apiKey['apikey-state'] === 'disabled') {
                return;
            }
            // Create a unique key based on tenant name and namespace name
            const key = `${apiKey['tenant-name']}-${apiKey['namespace-name']}`;
            // Store the API key if it's the first one we've seen for this tenant-namespace pair
            // Or if it's a read key and the current stored key is a write key
            if (!uniqueApiKeys[key] || (uniqueApiKeys[key]['apikey-type'] === 'write' && apiKey['apikey-type'] === 'read')) {
                uniqueApiKeys[key] = apiKey;
            }
        });

        // Step 3: Fetch inventories for each unique tenant-namespace pair
        // `Promise.all` is used to run multiple asynchronous operations in parallel
        const inventories = await Promise.all(
            // Convert the values of the `uniqueApiKeys` object into an array and map over it
            Object.values(uniqueApiKeys).map(apiKey => {
                // Determine if we need to fetch all namespaces or a specific namespace
                console.log(`apikey-rights: ${apiKey['apikey-rights']}`);

                let allnsapi = {};
                if (apiKey['apikey-rights'] === 'allns') {
                    allnsapi = true;
                } else {
                    allnsapi = false;
                }
                // Call the `fetchInventory` function for each API key
                // `apiKey['tenant-name']` is the tenant
                // `apiKey['apikey']` is the decrypted API key
                // `allnsapi ? null : apiKey['namespace-name']` determines if we pass null for all namespaces or a specific namespace
                console.log(`Fetching inventory for tenant ${apiKey['tenant-name']} and namespace ${apiKey['namespace-name']} and allnsapi ${allnsapi}`);
                return fetchInventory(apiKey['tenant-name'], apiKey['apikey'], allnsapi, apiKey['namespace-name']);
            })
        );

        // Step 4: Merge all fetched inventories into one
        let mergedInventory = {};
        inventories.forEach(inventory => {
            mergedInventory = mergeDeep(mergedInventory, inventory);
        });

        return mergedInventory; // Return the combined inventory
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
}



/**
 * Asynchronously retrieves the complete stats by fetching stats for each unique tenant-namespace pair.
 * @param {Object} req - The request object containing the cookies.
 * @param {number} secondsback - The time range in seconds to fetch stats for.
 * @param {string} [lbname=null] - The load balancer name to filter results.
 * @returns {Promise<Object>} A promise that resolves to the combined stats.
 * @throws {Error} Throws an error if there's an error fetching the stats.
 */
async function getStats(req, secondsback, lbname = null) {
    try {
        // Step 1: Retrieve and decrypt API keys from the cookie
        const decryptedApiKeys = getDecryptedApiKeys(req);

        // Step 2: Remove duplicates and prioritize read keys over write keys
        const uniqueApiKeys = {};
        decryptedApiKeys.forEach(apiKey => {
            // Skip any disabled API keys
            if (apiKey['apikey-state'] === 'disabled') {
                return;
            }
            // Create a unique key based on tenant name and namespace name
            const key = `${apiKey['tenant-name']}-${apiKey['namespace-name']}`;
            // Store the API key if it's the first one we've seen for this tenant-namespace pair
            // Or if it's a read key and the current stored key is a write key
            if (!uniqueApiKeys[key] || (uniqueApiKeys[key]['apikey-type'] === 'write' && apiKey['apikey-type'] === 'read')) {
                uniqueApiKeys[key] = apiKey;
            }
        });

        // Step 3: Fetch stats for each unique tenant-namespace pair
        // `Promise.all` is used to run multiple asynchronous operations in parallel
        const stats = await Promise.all(
            // Convert the values of the `uniqueApiKeys` object into an array and map over it
            Object.values(uniqueApiKeys).map(apiKey => {
                // Determine if we need to fetch all namespaces or a specific namespace
                console.log(`apikey-rights: ${apiKey['apikey-rights']}`);

                let allnsapi = {};
                if (apiKey['apikey-rights'] === 'allns') {
                    allnsapi = true;
                } else {
                    allnsapi = false;
                }
                // Call the `fetchStats` function for each API key
                // `apiKey['tenant-name']` is the tenant
                // `apiKey['apikey']` is the decrypted API key
                // `allnsapi ? null : apiKey['namespace-name']` determines if we pass null for all namespaces or a specific namespace
                console.log(`Fetching stats for tenant ${apiKey['tenant-name']} and namespace ${apiKey['namespace-name']} and allnsapi ${allnsapi}`);
                return fetchStats(apiKey['tenant-name'], apiKey['apikey'], allnsapi, apiKey['namespace-name'], secondsback, lbname);
            })
        );

        // Step 4: Merge all fetched stats into one
        let mergedStats = {};
        stats.forEach(stat => {
            mergedStats = mergeDeep(mergedStats, stat);
        });

        return mergedStats; // Return the combined stats
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
}



/**
 * Uploads a certificate to F5XC using the provided tenant, API key, namespace, certificate name, certificate URL path, and private key path.
 * @param {string} tenant - The F5XC tenant.
 * @param {string} apiKey - The F5XC API key.
 * @param {string} namespace - The F5XC namespace.
 * @param {string} certName - The name of the certificate.
 * @param {string} certUrlPath - The path to the certificate URL file.
 * @param {string} privateKeyPath - The path to the private key file.
 * @returns {Promise<void>} - A Promise that resolves when the certificate is uploaded successfully.
 */
async function uploadCertificate(tenant, apiKey, namespace, certName, certUrlPath, privateKeyPath) {
    try {
        // Read certificate and private key files and encode them as Base64
        const certBase64 = fs.readFileSync(certUrlPath, 'base64'); // Read certificate file and encode as Base64
        const privateKeyBase64 = fs.readFileSync(privateKeyPath, 'base64'); // Read private key file and encode as Base64

        // Prepare the request body
        const requestBody = {
            metadata: {
                name: certName, // Set the certificate name
                namespace: namespace // Set the namespace
            },
            spec: {
                certificate_url: `string:///${certBase64}`, // Set the certificate URL
                private_key: {
                    clear_secret_info: {
                        url: `string:///${privateKeyBase64}` // Set the private key URL
                    }
                }
            }
        };

        // Prepare the URL
        const url = `https://${tenant}.console.ves.volterra.io/api/config/namespaces/${namespace}/certificates`; // Set the URL

        // Prepare the headers
        const headers = {
            'Content-Type': 'application/json', // Set the content type
            'Authorization': `APIToken ${apiKey}`, // Set the authorization header
            'x-volterra-apigw-tenant': tenant // Set the Volterra API gateway tenant
        };

        // Make the POST request
        const response = await axios.post(url, requestBody, {
            headers: headers
        });

        console.log('Certificate uploaded successfully:', response.data); // Log the response data
    } catch (error) {
        console.error('Error uploading certificate:', error); // Log any errors that occur
    }
}



/**
 * Generates a self-signed X.509v3 certificate using the given common name and alternative names.
 * @param {string} commonName - The common name for the certificate.
 * @param {Array<string>} altNames - An array of alternative names for the certificate.
 * @param {number} [validityDays=10] - The number of days the certificate is valid for. Defaults to 10.
 * @returns {Promise<Object>} - A Promise that resolves to an object containing the private key and certificate in PEM format.
 */
async function generateCertificate(commonName, altNames, validityDays = 10) {
    return new Promise((resolve, reject) => {
        // Generate a keypair and create an X.509v3 certificate
        const keys = pki.rsa.generateKeyPair(2048);
        const cert = pki.createCertificate();
        cert.publicKey = keys.publicKey;

        // Set serial number and validity period
        cert.serialNumber = '01';
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + validityDays);

        // Set subject and issuer (self-signed certificate)
        const attrs = [
            { name: 'commonName', value: commonName },
            { name: 'countryName', value: 'US' },
            { shortName: 'ST', value: 'State' },
            { name: 'localityName', value: 'City' },
            { name: 'organizationName', value: 'Organization' },
            { shortName: 'OU', value: 'Unit' }
        ];

        cert.setSubject(attrs);
        cert.setIssuer(attrs);

        // Set the extensions
        cert.setExtensions([
            // Basic constraints
            {
                name: 'basicConstraints',
                cA: true
            },
            // Key usage
            {
                name: 'keyUsage',
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true
            },
            // Extended key usage
            {
                name: 'extKeyUsage',
                serverAuth: true,
                clientAuth: true,
                codeSigning: true,
                emailProtection: true,
                timeStamping: true
            },
            // Subject alternative names
            {
                name: 'subjectAltName',
                altNames: altNames.map(name => {
                    if (name.startsWith('IP:')) {
                        return { type: 7, ip: name.substring(3) };
                    }
                    return { type: 2, value: name };
                })
            }
        ]);

        // Self-sign certificate
        cert.sign(keys.privateKey);

        // Convert to PEM format
        const pemCert = pki.certificateToPem(cert);
        const pemKey = pki.privateKeyToPem(keys.privateKey);

        resolve({ key: pemKey, cert: pemCert });
    });
}






/**
 * Stores the given data in the browser's local storage, under the specified key.
 * Also adds a timestamp to the data.
 * @param {string} key - The key under which the data will be stored in local storage.
 * @param {any} data - The data to be stored in local storage.
 */
function cacheData(key, data) {
    // Get the current timestamp
    const timestamp = new Date().getTime();

    // Create the cache entry object
    const cacheEntry = {
        data: data,
        timestamp: timestamp
    };

    // Stringify the cache entry and store it in local storage
    localStorage.setItem(key, JSON.stringify(cacheEntry));

    // Log a message indicating the data has been stored in local storage
    console.log(`Data stored in LocalStorage under key '${key}'`);
}

/**
 * Retrieves data from the browser's local storage, under the specified key.
 * If the data is present and not older than the specified maximum age, it is returned.
 * Otherwise, null is returned.
 * @param {string} key - The key under which the data is stored in local storage.
 * @param {number} maxAgeInSeconds - The maximum age (in seconds) of the cached data.
 * @returns {any|null} - The retrieved data if it is not older than the maximum age, null otherwise.
 */
function getCachedData(key, maxAgeInSeconds) {
    // Retrieve the cache entry from local storage
    const cacheEntry = localStorage.getItem(key);
    if (cacheEntry) {
        // Parse the cache entry
        const parsedEntry = JSON.parse(cacheEntry);
        const currentTime = new Date().getTime();
        const ageInSeconds = (currentTime - parsedEntry.timestamp) / 1000;
        // Check if the data is not older than the maximum age
        if (ageInSeconds <= maxAgeInSeconds) {
            // Log a message indicating the use of cached data
            console.log(`Using cached data for key '${key}'`);
            // Return the cached data
            return parsedEntry.data;
        } else {
            // Log a message indicating that the cached data is older than the maximum age
            console.log(`Cached data for key '${key}' is older than ${maxAgeInSeconds} seconds`);
            // Remove the cache entry from local storage
            localStorage.removeItem(key);
        }
    }
    // Return null if the cached data is not available or is older than the maximum age
    return null;
}

/**
 * Function to encrypt API keys
 * @param {Array} apiKeys - An array of API key objects
 * @returns {Array} - An array of encrypted API key objects
 */
function encryptApiKeys(apiKeys) {
    // Map over each API key object in the array
    const processedKeys = apiKeys.map(apiKey => {
        // Check if the API key is already encrypted
        if (apiKey["apikey-format"] === 'enc') {
            // If encrypted, return the API key object as is
            return {
                "apikey-type": apiKey["apikey-type"],
                "tenant-name": apiKey["tenant-name"],
                "namespace-type": apiKey["namespace-type"],
                "namespace-name": apiKey["namespace-name"],
                "apikey-format": apiKey["apikey-format"],
                "apikey-rights": apiKey["apikey-rights"],
                "apikey-state": apiKey["apikey-state"],
                "apikey": apiKey["apikey"]
            };
        } else {
            // If not encrypted, encrypt the API key and return a new object
            return {
                "apikey-type": apiKey["apikey-type"],
                "tenant-name": apiKey["tenant-name"],
                "namespace-type": apiKey["namespace-type"],
                "namespace-name": apiKey["namespace-name"],
                "apikey-rights": apiKey["apikey-rights"],
                "apikey-state": apiKey["apikey-state"],
                "apikey-format": 'enc',
                "apikey": encryptData(apiKey["apikey"])
            };
        }
    });
    return processedKeys;
}

// Function to get and decrypt API keys from the cookie
function decryptedApiKeys(req) {
    const apiKeysCookie = req.cookies.apiKeys;
    if (!apiKeysCookie) {
        throw new Error('API keys cookie not found');
    }

    const apiKeys = JSON.parse(apiKeysCookie);

    return apiKeys.map(apiKey => {
        if (apiKey["apikey-format"] === 'enc') {
            return {
                ...apiKey,
                "apikey": decryptData(apiKey["apikey"])
            };
        }
        return apiKey;
    });
}

// Function to encrypt data
function encryptData(data) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.alloc(16, 0)); // Ensure encryptionKey is hex
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
}

function decryptData(data) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.alloc(16, 0));
    let decryptedData = decipher.update(data, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}

/**
 * Function to get and decrypt API keys from the cookie.
 * 
 * @param {Object} req - The request object containing the cookies.
 * @throws {Error} Throws an error if the API keys cookie is not found.
 * @returns {Array} An array of API keys with decrypted "apikey" values.
 */
function getDecryptedApiKeys(req) {
    // Get the API keys cookie from the request object
    const apiKeysCookie = req.cookies.apiKeys;

    // Throw an error if the API keys cookie is not found
    if (!apiKeysCookie) {
        throw new Error('API keys cookie not found');
    }

    // Parse the API keys cookie into an array
    const apiKeys = JSON.parse(apiKeysCookie);

    // Decrypt the "apikey" value of each API key if it is encrypted
    return apiKeys.map(apiKey => {
        if (apiKey["apikey-format"] === 'enc') {
            return {
                ...apiKey, // Copy all properties of the API key object
                "apikey": decryptData(apiKey["apikey"]) // Decrypt the "apikey" value
            };
        }
        return apiKey; // Return the API key as is if it is not encrypted
    });
}

/**
 * Recursively merges two objects into a new object.
 * If both objects have the same key, the value from the `source` object will be merged into the corresponding value of the `target` object.
 * If the value in the `source` object is an object, the function will recursively merge the two objects.
 *
 * @param {Object} target - The target object to merge into.
 * @param {Object} source - The source object to merge from.
 * @returns {Object} - A new object that is the result of merging `target` and `source`.
 */
function mergeDeep(target, source) {
    // Loop through each key in the `source` object
    for (const key of Object.keys(source)) {
        // If the value in the `source` object is an object and the `target` object has the same key
        if (source[key] instanceof Object && key in target) {
            // Recursively merge the two objects
            Object.assign(source[key], mergeDeep(target[key], source[key]));
        }
    }
    // Join `target` and modified `source`
    Object.assign(target || {}, source);
    // Return the merged object
    return target;
}

// Function to select the correct API key
/// Do we still need it???
function getCorrectApiKey(req, tenant, namespace = null, need = 'read') {
    const apiKeys = getDecryptedApiKeys(req);

    // Filter the API keys based on tenant and namespace
    const filteredKeys = apiKeys.filter(apiKey => {
        if (apiKey['tenant-name'] !== tenant) return false;
        if (namespace && apiKey['namespace-name'] !== namespace && apiKey['namespace-type'] !== 'all') return false;
        return true;
    });

    // Attempt to find the required key type (read/write)
    let selectedKey = filteredKeys.find(apiKey => apiKey['apikey-type'] === need);

    // If no read key found and read is requested, fall back to write key
    if (!selectedKey && need === 'read') {
        selectedKey = filteredKeys.find(apiKey => apiKey['apikey-type'] === 'write');
    }

    // If no keys match, throw an error
    if (!selectedKey) {
        throw new Error('No suitable API key found');
    }

    // Return the matched key
    return selectedKey.apikey;
}


//Export Functions
module.exports = {
    fetchNamespaces,
    fetchConfig,
    fetchConfigItems,
    fetchLbs,
    fetchUsers,
    fetchHealthchecks,
    fetchStats,
    fetchInventory,
    fetchSecurityEvents,
    getSecurityEvents,
    getInventory,
    getStats,
    uploadCertificate,
    generateCertificate,
    encryptApiKeys,
    decryptedApiKeys,
    getDecryptedApiKeys,
    getCorrectApiKey,
    encryptData,
    decryptData,
    mergeDeep,
    cacheData,
    getCachedData

};


