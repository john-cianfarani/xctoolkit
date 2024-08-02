// const express = require('express');
// const app = express();
const bodyParser = require('body-parser');
const util = require('util');

const { fetchNamespaces, fetchConfig, fetchLbs, fetchHealthchecks, fetchStats, uploadCertificate, generateCertificate, encryptApiKeys, fetchUsers, fetchConfigItems, fetchInventory, fetchSecurityEvents } = require('./xcapi');

const ONE_MINUTE = 60; // 1 minute
const FIVE_MINUTES = 5 * 60; // 5 minutes
const ONE_HOUR = 60 * 60; // 1 hour
const SIX_HOURS = 6 * 60 * 60; // 6 hours
const ONE_DAY = 24 * 60 * 60; // 1 day
const ONE_WEEK = 7 * 24 * 60 * 60; // 1 week

// Authorization header value
const authToken = 'DE25+WuCfoVb5QWuldejOhD0ji4=';
const authToken_finastra = 'noaUI6nxp9FsCi1hGjVtzZONUUc=';
const xcTenant1 = 'f5-amer-ent';
const finastra = 'finastra';
const namespace1 = 'j-cianfarani';
const namespace2 = 'demo-shop';
const namespace3 = 'p-ashworth';
const lb1 = 'juice-shop-https';

const tenant_xcel = 'xcel';
const xcel_token = 'dCUXpzY4OjQdoEPpe3uJUE9Zi6U=';


// fetchNamespaces(xcTenant1, authToken)
//     .then(data => {
//         namespacesData = data;

//         // Iterate through the namespaces object
//         for (const name in data) {
//             // Check if the property is directly owned by the object (not inherited)
//             if (data.hasOwnProperty(name)) {
//                 const description = data[name];
//                 console.log(`"${name}" - "${description}"`);
//             }
//         }

//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });


// fetchLbs(xcTenant1, authToken, namespace1)
//     .then(lbs => {
//         console.log('Load Balancers:', JSON.stringify(lbs, null, 2));
//     })
//     .catch(error => {
//         console.error('Failed to fetch load balancers:', error);
//     });


// fetchHealthchecks(xcTenant1, authToken, namespace1, lb1)
// .then(data => {


//     console.log(data);
//     // // Iterate through the lb object
//     // for (const uid in data) {
//     //     // Check if the property is directly owned by the object (not inherited)

//     //     console.log(`"${uid}" - "${data[uid].name}" - "${data[uid].namespace}" - "${data[uid].description}" - "${data[uid].domains}"`);
//     //     // if (data.hasOwnProperty(name)) {
//     //     //     const description = data[name];
//     //     //     console.log(`"${name}" - "${description}"`);
//     //     // }
//     // }

// })
// .catch(error => {
//     console.error('Error:', error);
// });     


// fetchConfig(authToken, xcTenant1, namespace1, 'bgp_asn_sets', 'test-asn')
//     .then(data => {

//         console.log(data);
//         //console.log(util.inspect(data, {depth: null}));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

// 'ip_prefix_sets' 'origin_pools' 
fetchConfigItems(authToken, xcTenant1, 'shared', 'ip_prefix_sets')
    .then(data => {

        console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
        //console.log(util.inspect(data, {depth: null}));
    })
    .catch(error => {
        console.error('Error:', error);
    });
// fetchConfigItems(xcTenant1, authToken, namespace1, 'bgp_asn_sets')
//     .then(data => {

//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//         //console.log(util.inspect(data, {depth: null}));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

// Usage example
//uploadCertificate(xcTenant1, authToken, namespace1, 'test-cert', './testcert.pem', './testkey.key');

// fetchStats(xcTenant1, authToken, namespace1, 7200, lb1)
//     .then(data => {
//         console.log(data);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });


// fetchStats(xcTenant1, authToken, namespace2, ONE_DAY,)
//     .then(data => {
//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

// fetchUsers(finastra, authToken_finastra, 5)
//     .then(data => {
//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//     })
//     .catch(error => {
//         console.error('Error:', error); gr
//     });


// Usage example
// (async () => {
//     try {
//         const commonName = 'example.com';
//         const altNames = ['example.com', 'www.example.net', 'IP:10.0.0.1'];
//         const { key, cert } = await generateCertificate(commonName, altNames);

//         console.log('Key:', key);
//         console.log('Certificate:', cert);
//     } catch (error) {
//         console.error('Failed to generate certificate:', error);
//     }
// })();


// fetchInventory(tenant_xcel, xcel_token, true,)
//     .then(data => {

//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//         //console.log(util.inspect(data, {depth: null}));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });


// fetchStats(xcTenant1, authToken, true, undefined, ONE_DAY,)
//     .then(data => {
//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
// console.log(new Date().getTime());
// fetchSecurityEvents(xcTenant1, authToken, false, namespace3, ONE_DAY, 'total')
//     .then(data => {
//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

// fetchSecurityEvents(xcTenant1, authToken, namespace3, ONE_DAY, 'waf_sec_event')
//     .then(data => {
//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

// fetchSecurityEvents(xcTenant1, authToken, namespace3, ONE_DAY, 'bot_sec_event')
//     .then(data => {
//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
// fetchSecurityEvents(xcTenant1, authToken, namespace3, ONE_DAY, 'api_sec_event')
//     .then(data => {
//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
// fetchSecurityEvents(xcTenant1, authToken, namespace3, ONE_DAY, 'svc_sec_event')
//     .then(data => {
//         console.log('Data property:', util.inspect(data, { showHidden: false, depth: null, colors: true }));
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });


console.log(new Date().getTime());


