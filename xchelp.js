const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { fetchNamespaces, fetchLbs, fetchHealthchecks } = require('./xcapi');

// Authorization header value
const authToken = 'DE25+WuCfoVb5QWuldejOhD0ji4=';
const xcTenant1 = 'f5-amer-ent';
const namespace1 = 'j-cianfarani';
const lb1 = 'juice-shop-https';


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
//     .then(data => {

//         // Iterate through the lb object
//         for (const uid in data) {
//             // Check if the property is directly owned by the object (not inherited)

//             console.log(`"${uid}" - "${data[uid].name}" - "${data[uid].namespace}" - "${data[uid].description}" - "${data[uid].domains}"`);
//             // if (data.hasOwnProperty(name)) {
//             //     const description = data[name];
//             //     console.log(`"${name}" - "${description}"`);
//             // }
//         }

//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });    


fetchHealthchecks(xcTenant1, authToken, namespace1, lb1)
.then(data => {


    console.log(data);
    // // Iterate through the lb object
    // for (const uid in data) {
    //     // Check if the property is directly owned by the object (not inherited)

    //     console.log(`"${uid}" - "${data[uid].name}" - "${data[uid].namespace}" - "${data[uid].description}" - "${data[uid].domains}"`);
    //     // if (data.hasOwnProperty(name)) {
    //     //     const description = data[name];
    //     //     console.log(`"${name}" - "${description}"`);
    //     // }
    // }

})
.catch(error => {
    console.error('Error:', error);
});     