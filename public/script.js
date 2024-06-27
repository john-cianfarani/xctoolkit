// script.js v1.2


// validateX - To validate input fields
// renderX - To render updates to the DOM

// import transitions from "bootstrap";


//// Initial Variables ///

const ONE_MINUTE = 60; // 1 minute
const FIVE_MINUTES = 5 * 60; // 5 minutes
const ONE_HOUR = 60 * 60; // 1 hour
const SIX_HOURS = 6 * 60 * 60; // 6 hours
const ONE_DAY = 24 * 60 * 60; // 1 day
const ONE_WEEK = 7 * 24 * 60 * 60; // 1 week

const keysToClear = ['dataInventory', 'dataStats', 'item3'];

const pageConfig = {
    default: {
        url: 'default.html',
        func: function () {
            console.log('Deafult page specific function executed.');
            // Add home page specific logic here
        }
    },
    apisetup: {
        url: 'api-keys.html',
        func: function () {
            console.log('API Keys page specific function executed.');
            populateFormFromCookie()
            // Add about page specific logic here
        }
    },
    overview: {
        url: 'overview.html',
        func: function () {
            console.log('Overview page specific function executed.');
            initPopovers();
            // Add contact page specific logic here
        }
    },
    profile: {
        url: 'js/pages/profile.html',
        func: function () {
            console.log('Profile page specific function executed.');
            // Add profile page specific logic here
        }
    },
    settings: {
        url: 'js/pages/settings.html',
        func: function () {
            console.log('Settings page specific function executed.');
            // Add settings page specific logic here
        }
    }
};


$(document).ready(function () {
    // $("#api-keys-link").click(function () {
    //     loadContent('api-keys.html', 'Settings > API Keys');
    // });
    const currentPage = localStorage.getItem('currentPage') || 'default';
    //console.log('Current page:', currentPage);
    loadContent(currentPage);
    checkCookie();
    populateTenantSelect();
});

function initPopovers() {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}


function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

$(document).ready(function () {
    // Event delegation for all current and future collapse elements of a specific type/class
    $('body').on('show.bs.collapse', '.collapse .collapse-row', function () {
        console.log('1. show.bs.collapse triggered for ' + this.id);
        var tenant = $(this).data('tenant');
        var namespace = $(this).data('namespace');
        var lbname = $(this).data('lbname');
        console.log('1. Data:', tenant, namespace, lbname);
        // populateRowDetails(this.id, tenant, namespace, lbname);
    });
    // $('body').on('shown.bs.collapse', '.collapse .collapse-row', function () {
    //     console.log('2. shown.bs.collapse triggered for ' + this.id);
    // }).on('hide.bs.collapse', '.collapse .collapse-row', function () {
    //     console.log('3. hide.bs.collapse triggered for ' + this.id);
    // }).on('hidden.bs.collapse', '.collapse .collapse-row', function () {
    //     console.log('4. hidden.bs.collapse triggered for ' + this.id);
    // });

    // // Event delegation for clicks on collapse triggers in resource rows
    // $('body').on('click', '.resource-row .collapse-trigger', function () {
    //     console.log('Collapse trigger clicked: ' + this.id);
    //     var tenant = $(this).data('tenant');
    //     var namespace = $(this).data('namespace');
    //     var lbname = $(this).data('lbname');
    //     console.log('Data:', tenant, namespace, lbname);
    // });
});


// Define the populateRowDetails function to update the details section
function populateRowDetails(collapseId, tenant, namespace, lbname) {
    // Placeholder text incorporating data attributes
    var placeholderText = "Loading details for Tenant: " + tenant + ", Namespace: " + namespace + ", LB Name: " + lbname + "...";

    // Find the collapse element and update its content
    $('#' + collapseId + ' .tableDetails').html(placeholderText);

    console.log('Populating details for: ' + collapseId + " with Tenant: " + tenant + ", Namespace: " + namespace + ", LB Name: " + lbname);
}







// $(document).ready(function () {
//     // This event triggers when a collapse element starts to show
//     $(document).on('show.bs.collapse', '.collapse', function (event) {
//         // Get the triggering element, which could be retrieved from the event object
//         var triggerElement1 = $(event.currentTarget);
//         var triggerElement = $(event.target).prev('[data-bs-toggle="collapse"]');
//         var tenant = triggerElement.data('tenant');
//         var namespace = triggerElement.data('namespace');
//         var lbname = triggerElement.data('lbname');

//         // Call the function with the parameters
//         console.log('Collapse Opened:', tenant, namespace, lbname, triggerElement1.attr('id'), event.target.id);
//     });
// });
/**
 * Checks if the "xchelperapi" cookie is valid. If not, it loads the API keys page.
 */
function checkCookie() {
    // Get the value of the "xchelperapi" cookie
    let apiCookie = getCookie("apiKeys");

    // If the cookie is invalid or not present, load the API keys page
    if (!apiCookie) {
        //if (!apiCookie || !isValidCookie(apiCookie)) {    
        //alert("Please set your API keys first!");
        loadContent('apisetup', 'Settings > API Keys');

    }
}

function isValidCookie(cookie) {
    // Placeholder function - replace with actual validation logic
    return cookie === "valid";
}

/**
 * Loads the content from the specified URL and updates the breadcrumbs.
 *
 * @param {string} url - The URL of the content to load.
 * @param {string} breadcrumbsText - The text to display in the breadcrumbs.
 */
function loadContent(page, breadcrumbsText = "") {

    console.log('Loading content:', page);



    if (pageConfig[page]) {
    } else {
        console.error('Invalid page:', page);
        return;
    }

    const { url, func } = pageConfig[page];

    localStorage.setItem('currentPage', page);
    // Send an AJAX GET request to fetch the content from the specified URL
    $.get(url, function (html) {
        // Update the content of the subcontent element with the fetched HTML
        $("#subcontent").html(html);
        func();
        // Split the breadcrumbs text by " > " and update the breadcrumbs
        //setBreadcrumbs(breadcrumbsText.split(" > "));

    })
        // Handle any errors that occur during the AJAX request
        .fail(function (error) {
            // Log the error to the console
            console.error('Error loading content:', error);
        });
}

function setBreadcrumbs(breadcrumbs) {
    for (let i = 0; i < 5; i++) {
        $("#breadcrumb-" + (i + 1)).html(breadcrumbs[i] || "");
    }
}
function populateTenantSelect() {
    const cookieName = 'apiKeys';
    const cookieValue = getCookie(cookieName);

    if (cookieValue) {
        try {
            // Decode URI components and parse the JSON string
            const decodedCookieValue = decodeURIComponent(cookieValue);
            const apiKeys = JSON.parse(decodedCookieValue);

            // Extract and deduplicate tenant names, ignoring disabled tenants
            const tenants = apiKeys
                .filter(apiKey => !apiKey.disabled)
                .map(apiKey => apiKey["tenant-name"]);
            const uniqueTenants = [...new Set(tenants)];

            // Populate the select element
            const select = $('#service-tenant');
            select.empty(); // Clear existing options
            select.append('<option value="all">All Tenants</option>'); // Add "All Tenants" option
            uniqueTenants.forEach(tenant => {
                select.append(`<option value="${tenant}">${tenant}</option>`);
            });
        } catch (e) {
            console.error('Error parsing JSON from cookie:', e);
        }
    }
}



/////////////// API KEYS PAGE CODE BELOW //////////////////


// Function to read cookie
function getCookie(name) {

    let value = `; ${document.cookie}`;
    //console.log(value);
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to populate the form with API keys from the cookie
function populateFormFromCookie() {
    console.log('Populating Cookies');
    let apiKeysCookie = getCookie('apiKeys');
    if (apiKeysCookie) {
        try {
            let decodedCookie = decodeURIComponent(apiKeysCookie);
            let apiKeys = JSON.parse(decodedCookie);
            console.log('API Keys from cookie:', apiKeys);

            for (let i = 0; i < apiKeys.length; i++) {
                let key = apiKeys[i];
                if (i > 0) {
                    $('#add-api-key').click(); // Add a new row for each key except the first one
                }
                let row = $(".api-key-row").eq(i);
                console.log('Tenant Name:', key['tenant-name']);
                console.log('Namespace Type:', key['namespace-type']);
                console.log('Namespace Name:', key['namespace-name']);
                console.log('API Key Type:', key['apikey-type']);
                console.log('API Key Format:', key['apikey-format']);
                console.log('API Key:', key['apikey']);

                console.log('Row found:', row.length);
                let tenantNameElement = row.find('.tenant-name');
                let namespaceTypeElement = row.find('.namespace-type');
                let namespaceNameElement = row.find('.namespace-name');
                let apiKeyTypeElement = row.find('.apikey-type');
                let apiKeyFormatElement = row.find('.apikey-format');
                let apiKeyRightsElement = row.find('.apikey-rights');
                let apiKeyStateElement = row.find('.apikey-state');
                let apiKeyElement = row.find('.apikey');

                console.log('Tenant Name element found:', tenantNameElement.length);
                console.log('Namespace Type element found:', namespaceTypeElement.length);
                console.log('Namespace Name element found:', namespaceNameElement.length);
                console.log('API Key Type element found:', apiKeyTypeElement.length);
                console.log('API Key Format element found:', apiKeyFormatElement.length);
                console.log('API Key element found:', apiKeyElement.length);

                tenantNameElement.val(key['tenant-name']);
                namespaceTypeElement.val(key['namespace-type']);
                namespaceNameElement.val(key['namespace-name']);
                apiKeyTypeElement.val(key['apikey-type']);
                apiKeyFormatElement.val(key['apikey-format']);
                apiKeyRightsElement.val(key['apikey-rights']);
                apiKeyStateElement.val(key['apikey-state']);
                apiKeyElement.val(key['apikey']);

                console.log('Tenant Name set to:', tenantNameElement.val());
                console.log('Namespace Type set to:', namespaceTypeElement.val());
                console.log('Namespace Name set to:', namespaceNameElement.val());
                console.log('API Key Type set to:', apiKeyTypeElement.val());
                console.log('API Key Format set to:', apiKeyFormatElement.val());
                console.log('API Key set to:', apiKeyElement.val());

                if (key['namespace-type'] === 'custom') {
                    namespaceNameElement.prop('disabled', false);
                } else {
                    namespaceNameElement.prop('disabled', true);
                }
            }
        } catch (e) {
            console.error('Failed to parse API keys cookie:', e);
        }
    }
}



// Attach the click event to the "Edit Existing Keys" button
$(document).on('click', '#edit-existing-keys', function () {
    console.log('Edit Entered');
    populateFormFromCookie();
});

//  $('#etest-existing-keys').on('click', apikeyTest(){});

// Add API Key Button Click Event
$(document).on('click', '#add-api-key', function () {
    console.log('Add API Key button clicked');
    var newRow = $(".api-key-row").first().clone(); // Clone the first row
    newRow.find('input, select').val(''); // Clear input values
    newRow.find('.namespace-type').val('all'); // Select default value for Namespace Type
    newRow.find('.apikey-type').val('write'); // Select default value for API Key Type
    newRow.find('.apikey-format').val('clear'); // Select default value for API Key Format
    newRow.find('.apikey-rights').val('allns'); // Select default value for API Key Type
    newRow.find('.apikey-state').val('enabled'); // Select default value for API Key Format    
    newRow.find('.namespace-name').prop('disabled', true); // Ensure Namespace Name is disabled
    newRow.find('.remove-api-key').prop('disabled', false); // Enable remove button for new row
    $("#api-keys-container").append(newRow); // Append the new row to the container
    console.log('Row appended'); // Confirm row append
});

// Remove API Key Button Click Event
$(document).on('click', '.remove-api-key', function () {
    var row = $(this).closest('.api-key-row');
    if (!row.is(':first-child')) { // Check if it's not the first row
        row.remove(); // Remove the row
        console.log('Row removed');
    }
});

// Namespace Type Change Event
$(document).on('change', '.namespace-type', function () {
    var namespaceType = $(this).val();
    var namespaceNameInput = $(this).closest('.api-key-row').find('.namespace-name');
    if (namespaceType === 'all') {
        namespaceNameInput.prop('disabled', true).val('');
        namespaceNameInput.removeClass('is-invalid');
    } else {
        namespaceNameInput.prop('disabled', false);
    }
    console.log('Namespace type changed to:', namespaceType);
});

// Form Field Blur Event for Validation
$(document).on('blur', '.tenant-name, .namespace-name, .apikey', function () {
    validateField($(this)); // Validate the blurred field
});

// Form Submission
$(document).on('click', '#submit-api-keys', function (event) {
    event.preventDefault(); // Prevent default form submission
    console.log('Submit button clicked');

    // Validate all fields
    var isValidForm = true;
    $(".api-key-row input, .api-key-row select").each(function () {
        if (!validateField($(this))) {
            isValidForm = false;
        }
    });

    if (isValidForm) {
        // Construct JSON object from form data
        var apiKeys = [];
        $(".api-key-row").each(function () {
            var apiKey = {
                "apikey-type": $(this).find(".apikey-type").val(),
                "tenant-name": $(this).find(".tenant-name").val(),
                "namespace-type": $(this).find(".namespace-type").val(),
                "namespace-name": $(this).find(".namespace-name").val(),
                "apikey-format": $(this).find(".apikey-format").val(),
                "apikey-rights": $(this).find(".apikey-rights").val(),
                "apikey-state": $(this).find(".apikey-state").val(),
                "apikey": $(this).find(".apikey").val()
            };
            apiKeys.push(apiKey);
        });

        console.log('API Keys:', apiKeys); // Log the constructed JSON object

        // Send JSON object to server via POST request
        $.ajax({
            type: "POST",
            url: "/api/v1/setapikey",
            contentType: "application/json",
            data: JSON.stringify(apiKeys),
            success: function (response) {
                console.log('Server response:', response);
                if (response.success) {
                    alert("API keys set successfully!");
                    loadContent('apisetup', 'Settings > API Keys');
                    populateTenantSelect();
                } else {
                    alert("Failed to set API keys.");
                }
            },
            error: function () {
                console.log('AJAX request failed');
                alert("An error occurred while setting API keys.");
            }
        });
    } else {
        console.log('Form is invalid, showing alert');
        alert('Please correct the errors in the form');
    }
});

// Function to validate a field
function validateField(field) {
    var isValid = true;
    var value = field.val();
    console.log('Validating field:', field, 'value:', value);

    if (field.hasClass('namespace-name')) {
        var namespaceType = field.closest('.api-key-row').find('.namespace-type').val();
        console.log('Namespace Type:', namespaceType);
        if (namespaceType === 'all') {
            isValid = true; // Skip validation for namespace-name when namespace-type is 'all'
            console.log('Namespace type is all, skipping validation for namespace-name');
            field.removeClass('is-invalid');
            return isValid;
        } else {
            isValid = /^[a-z0-9\-]{3,20}$/.test(value);
            console.log('Namespace name validation result:', isValid);
        }
    } else {
        if (value === '') {
            isValid = false;
            console.log('Field value is empty, marking as invalid');
        } else {
            switch (true) {
                case field.hasClass('tenant-name'):
                    isValid = /^[a-z0-9\-]{5,16}$/.test(value);
                    console.log('Tenant name validation result:', isValid);
                    break;
                case field.hasClass('apikey'):
                    isValid = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|-]{10,80}$/.test(value);
                    console.log('API key validation result:', isValid);
                    break;
                default:
                    isValid = true;
                    console.log('Default validation passed');
            }
        }
    }

    if (isValid) {
        field.removeClass('is-invalid');
        console.log('Field marked as valid');
    } else if (isValid === false) {
        field.addClass('is-invalid');
        console.log('Field marked as invalid');
    } else {
        console.log('Fallback logic triggered');
    }

    console.log('Field validation complete:', field.attr('class'), 'ValidState:', isValid);

    return isValid;
}




/**
 * Fetches inventory from the API and summarizes the count of various items per tenant, with caching.
 * @param {boolean} forcerefresh - If true, forces a fresh API call, otherwise uses cached data if available.
 * @returns {Promise} - A promise that resolves with the inventory data and summary.
 */
// function getApiInventory(forcerefresh = false) {
//     const cacheKey = 'dataInventory';
//     const summaryCacheKey = 'dataInventorySummary';
//     const maxAgeInSeconds = 10 * 60; // 10 minutes for caching the response

//     return new Promise((resolve, reject) => {
//         // Check if the data should be fetched from cache
//         if (!forcerefresh) {
//             const cachedData = cacheGetData(cacheKey, maxAgeInSeconds);
//             const cachedSummary = cacheGetData(summaryCacheKey, maxAgeInSeconds);
//             if (cachedData !== null && cachedSummary !== null) {
//                 resolve({ inventory: cachedData, summary: cachedSummary });
//                 return;
//             }
//         }

//         // Make AJAX call to /api/v1/getInventory endpoint
//         $.ajax({
//             url: '/api/v1/getInventory',
//             method: 'POST',
//             success: function (response) {
//                 if (response.success) {
//                     const inventory = response.inventory;
//                     const summary = compileInventorySummary(inventory);
//                     cacheSetData(cacheKey, inventory); // Cache the full inventory data
//                     cacheSetData(summaryCacheKey, summary); // Cache the summarized inventory data
//                     resolve({ inventory: inventory, summary: summary });
//                 } else {
//                     reject(new Error(response.message));
//                 }
//             },
//             error: function (jqXHR, textStatus, errorThrown) {
//                 reject(new Error(`${textStatus} - ${errorThrown}`));
//             }
//         });
//     });
// }


function getApiInventory(forcerefresh = false, checkselection = false, tenantFilter = null) {
    const cacheKey = 'dataInventory';
    const summaryCacheKey = 'dataInventorySummary';
    const maxAgeInSeconds = 30 * 60; // 30 minutes for caching the response

    return new Promise((resolve, reject) => {
        const applyTenantFilter = (inventory) => {
            let tenantToFilter = null;
            if (tenantFilter !== null) {
                tenantToFilter = tenantFilter;
            } else if (checkselection) {
                const selectedTenant = $('#service-tenant').val();
                if (selectedTenant && selectedTenant !== 'all') {
                    tenantToFilter = selectedTenant;
                }
            }

            if (tenantToFilter) {
                // Create a new object containing only the filtered tenant
                if (inventory.hasOwnProperty(tenantToFilter)) {
                    return { [tenantToFilter]: inventory[tenantToFilter] };
                } else {
                    console.error('Tenant not found in inventory:', tenantToFilter);
                    return {};
                }
            }

            return inventory;
        };

        // Check if the data should be fetched from cache
        if (!forcerefresh) {
            const cachedData = cacheGetData(cacheKey, maxAgeInSeconds);
            const cachedSummary = cacheGetData(summaryCacheKey, maxAgeInSeconds);
            if (cachedData !== null && cachedSummary !== null) {
                const filteredInventory = applyTenantFilter(cachedData);
                resolve({ inventory: filteredInventory, summary: cachedSummary });
                return;
            }
        }

        // Make AJAX call to /api/v1/getInventory endpoint
        $.ajax({
            url: '/api/v1/getInventory',
            method: 'POST',
            success: function (response) {
                if (response.success) {
                    const inventory = response.inventory;
                    const summary = compileInventorySummary(inventory);
                    cacheSetData(cacheKey, inventory); // Cache the full inventory data
                    cacheSetData(summaryCacheKey, summary); // Cache the summarized inventory data

                    const filteredInventory = applyTenantFilter(inventory);
                    resolve({ inventory: filteredInventory, summary: summary });
                } else {
                    reject(new Error(response.message));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`${textStatus} - ${errorThrown}`));
            }
        });
    });
}


function compileInventorySummary(inventory) {
    const summary = {};

    // Traverse through the inventory data to compile the summary
    for (const tenantName in inventory) {
        const tenantData = inventory[tenantName];
        const tenantSummary = {
            http_loadbalancers: { total: 0 },
            tcp_loadbalancers: { total: 0 }
        };

        // Initialize counters for each category
        const httpCategories = ['waf', 'bot_protection', 'api_protection', 'api_discovery', 'client_side_defense', 'private_advertisement', 'public_advertisement', 'malicious_user_mitigation', 'malicious_user_detection', 'api_definition', 'api_scheme_validation'];
        const tcpCategories = ['private_advertisement', 'public_advertisement'];

        httpCategories.forEach(category => tenantSummary.http_loadbalancers[category] = 0);
        tcpCategories.forEach(category => tenantSummary.tcp_loadbalancers[category] = 0);

        let httpTotal = 0;
        let tcpTotal = 0;

        for (const namespaceName in tenantData) {
            const namespaceData = tenantData[namespaceName];
            if (namespaceData.http_loadbalancers) {
                Object.values(namespaceData.http_loadbalancers).forEach(lb => {
                    httpCategories.forEach(category => {
                        if (lb.config && lb.config[category]) tenantSummary.http_loadbalancers[category]++;
                    });
                });
                httpTotal += Object.values(namespaceData.http_loadbalancers).length;
            }
            if (namespaceData.tcp_loadbalancers) {
                Object.values(namespaceData.tcp_loadbalancers).forEach(lb => {
                    tcpCategories.forEach(category => {
                        if (lb.config && lb.config[category]) tenantSummary.tcp_loadbalancers[category]++;
                    });
                });
                tcpTotal += Object.values(namespaceData.tcp_loadbalancers).length;
            }
        }

        // Set the total counts for the tenant
        tenantSummary.http_loadbalancers.total = httpTotal;
        tenantSummary.tcp_loadbalancers.total = tcpTotal;

        summary[tenantName] = tenantSummary;
    }

    return summary;
}





/**
 * Fetches stats from the API with caching.
 * @param {Object} inventory - The inventory data.
 * @param {boolean} forcerefresh - If true, forces a fresh API call, otherwise uses cached data if available.
 * @param {number} secondsback - The time range in seconds to fetch stats for.
 * @param {string} [lbname=null] - The load balancer name to filter results (optional).
 * @returns {Promise} - A promise that resolves with the stats data.
 */
function getApiStats(inventory, forcerefresh, secondsback, lbname = null) {
    // Set the cache key and maximum age for the data
    const cacheKey = `dataStats_${secondsback}`;
    const maxAgeInSeconds = 10 * 60; // 10 minutes

    return new Promise((resolve, reject) => {
        // Check if the data should be fetched from cache
        if (!forcerefresh) {
            const cachedData = cacheGetData(cacheKey, maxAgeInSeconds);
            if (cachedData !== null) {
                resolve(cachedData);
                return;
            }
        }

        // Make AJAX call to /api/v1/getStats endpoint
        $.ajax({
            url: '/api/v1/getStats',
            method: 'POST',
            data: JSON.stringify({ inventory, secondsback, lbname }),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    const stats = response.stats;
                    cacheSetData(cacheKey, stats); // Cache the data
                    resolve(stats);
                } else {
                    reject(new Error(response.message));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`${textStatus} - ${errorThrown}`));
            }
        });
    });
}



/**
 * Fetches security events from the API with caching.
 * @param {Object} inventory - The inventory data.
 * @param {boolean} forcerefresh - If true, forces a fresh API call, otherwise uses cached data if available.
 * @param {number} secondsback - The time range in seconds for the security events query.
 * @param {string} sec_event_type - (Disabled for now issues with XC API calls) - The type of security event to query (or 'all' for all types, 'total' to only repot the combined total of all security events). 
 * @returns {Promise} - A promise that resolves with the security events data.
 */
function getApiTotalSecurityEvents(inventory, forcerefresh, secondsback) {
    const sec_event_type = 'total';
    // Set the cache key based on the secondsback parameter
    const cacheKey = `dataTotalSecEvents_${secondsback}`;
    const maxAgeInSeconds = 10 * 60; // 10 minutes

    return new Promise((resolve, reject) => {
        // Check if the data should be fetched from cache
        if (!forcerefresh) {
            const cachedData = cacheGetData(cacheKey, maxAgeInSeconds);
            if (cachedData !== null) {
                resolve(cachedData);
                return;
            }
        }

        console.log("JS getApiTotalSecurityEvents: ", inventory);
        // Make AJAX call to /api/v1/getSecurityEvents endpoint
        $.ajax({
            url: '/api/v1/getSecurityEvents',
            method: 'POST',
            data: JSON.stringify({ inventory, secondsback, sec_event_type }),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    const securityEvents = response.securityEvents;
                    cacheSetData(cacheKey, securityEvents); // Cache the data
                    resolve(securityEvents);
                } else {
                    reject(new Error(response.message));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`${textStatus} - ${errorThrown}`));
            }
        });
    });
}


function getApiAllSecurityEvents(tenant, namespace, forcerefresh, secondsback) {
    const sec_event_type = 'all';
    // Set the cache key based on the secondsback parameter
    const cacheKey = `dataAllSecEvents_${tenant}_${namespace}_${secondsback}`;
    const maxAgeInSeconds = 10 * 60; // 10 minutes

    // Fake an inventory object so I don't have to create multiple downstream functions to work around the XC API call isssue with security events
    const inventory = {};

    if (!inventory[tenant]) {
        inventory[tenant] = {};
    }

    if (!inventory[tenant][namespace]) {
        inventory[tenant][namespace] = {};
    }

    return new Promise((resolve, reject) => {
        // Check if the data should be fetched from cache
        if (!forcerefresh) {
            const cachedData = cacheGetData(cacheKey, maxAgeInSeconds);
            if (cachedData !== null) {
                resolve(cachedData);
                return;
            }
        }

        console.log("JS getApiAllSecurityEvents: ", inventory);
        // Make AJAX call to /api/v1/getSecurityEvents endpoint
        $.ajax({
            url: '/api/v1/getSecurityEvents',
            method: 'POST',
            data: JSON.stringify({ inventory, secondsback, sec_event_type }),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    const securityEvents = response.securityEvents;
                    cacheSetData(cacheKey, securityEvents); // Cache the data
                    resolve(securityEvents);
                } else {
                    reject(new Error(response.message));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`${textStatus} - ${errorThrown}`));
            }
        });
    });
}

/**
 * Fetches namespace details from the API with caching.
 * @param {string} tenant - The tenant identifier.
 * @param {string} namespace - The namespace identifier.
 * @param {boolean} forcerefresh - If true, forces a fresh API call, otherwise uses cached data if available.
 * @returns {Promise} - A promise that resolves with the namespace details.
 */
function getApiNSDetails(tenant, namespace, forcerefresh) {
    // Set the cache key based on tenant and namespace
    const cacheKey = `dataNSDetails_${tenant}_${namespace}`;
    const maxAgeInSeconds = 10 * 60; // 10 minutes for caching the response

    return new Promise((resolve, reject) => {
        // Check if the data should be fetched from cache
        if (!forcerefresh) {
            const cachedData = cacheGetData(cacheKey, maxAgeInSeconds);
            if (cachedData !== null) {
                resolve(cachedData);
                return;
            }
        }

        console.log("Fetching namespace details for:", tenant, namespace);
        // Make AJAX call to /api/v1/getNSDetails endpoint
        $.ajax({
            url: '/api/v1/getNSDetails',
            method: 'POST',
            data: JSON.stringify({ tenant, namespace }),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    const namespaceDetails = response.stats; // Assuming the endpoint returns an object with a 'stats' key
                    cacheSetData(cacheKey, namespaceDetails); // Cache the data
                    resolve(namespaceDetails);
                } else {
                    reject(new Error(response.message));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`${textStatus} - ${errorThrown}`));
            }
        });
    });
}

/**
 * Fetches user details for a specific tenant from the API with caching.
 * @param {string} tenant - The identifier for the tenant.
 * @param {number} [limit=null] - Optional limit for the number of users to return.
 * @param {boolean} forcerefresh - If true, forces a fresh API call, otherwise uses cached data if available.
 * @returns {Promise} - A promise that resolves with the user details.
 */
function getApiTenantUsers(tenant, limit, forcerefresh) {
    // Set the cache key based on tenant and an optional limit
    const cacheKey = `dataTenantUsers_${tenant}`;
    const maxAgeInSeconds = 30 * 60; // 10 minutes for caching the response

    return new Promise((resolve, reject) => {
        // Check if the data should be fetched from cache
        if (!forcerefresh) {
            const cachedData = cacheGetData(cacheKey, maxAgeInSeconds);
            if (cachedData !== null) {
                resolve(cachedData);
                return;
            }
        }

        console.log("Fetching user details for:", tenant, "Limit:", limit);
        // Make AJAX call to /api/v1/getTenantUsers endpoint
        $.ajax({
            url: '/api/v1/getTenantUsers',
            method: 'POST',
            data: JSON.stringify({ tenant, limit }),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    const userDetails = response.userDetails; // Assuming the endpoint returns an object with a 'userDetails' key
                    cacheSetData(cacheKey, userDetails); // Cache the data
                    resolve(userDetails);
                } else {
                    reject(new Error(response.message));
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                reject(new Error(`${textStatus} - ${errorThrown}`));
            }
        });
    });
}

/**
 * Initializes and populates the overview section of the application for each tenant.
 * This function fetches necessary data and then renders the tenant overview using the Mustache template system.
 */
// Function to populate the overview of tenants based on inventory data
function populateOverview() {
    getApiInventory(false, true)
        .then(inventory => {
            const tenants = Object.keys(inventory.inventory);
            tenants.sort();

            // Map each tenant to a promise that resolves to its HTML
            const renderPromises = tenants.map(tenantName => populateOverviewTenant(tenantName, inventory));

            // Wait for all promises to resolve and then update the DOM
            Promise.all(renderPromises)
                .then(renderedHtmls => {
                    const overviewHTML = renderedHtmls.join('');  // Join all HTML strings
                    document.getElementById('overview-container').innerHTML = overviewHTML;  // Update the DOM once
                })
                .catch(error => {
                    console.error("Failed to render some tenant overviews:", error);
                });
        })
        .catch(error => {
            console.error("Failed to populate overview:", error);
        });
}


// Function to populate a single tenant's overview using Mustache template
// Function to populate a single tenant's overview using Mustache template
function populateOverviewTenant(tenantName, inventory) {
    const tenantData = inventory.inventory[tenantName]; // Specific tenant's data
    const summaryData = inventory.summary[tenantName]; // Summary data for the tenant

    // Fetch user data and pad it if necessary
    return getApiTenantUsers(tenantName, 5, false)
        .then(data => {
            // Access the users array inside the tenant key
            const users = data[tenantName] || [];
            console.log("Users fetched for tenant:", tenantName, users);

            // Map users data or provide default values if users array is empty
            let preparedUsers = users.map(user => ({
                name: user.fullname || ' ',
                email: ' - (' + user.email + ')' || ' ',
                nbsp: '&nbsp;',
                lastLoginTime: user.lastlogin ? convertDateTime(user.lastlogin) : ' '
            }));

            // Ensure there are always 5 entries for user logins
            while (preparedUsers.length < 5) {
                preparedUsers.push({ name: ' ', email: ' ', nbsp: '&nbsp;', lastLoginTime: ' ' });
            }

            // Prepare data to render in the template
            const templateData = {
                tenantName: tenantName,
                httpLbsCount: summaryData.http_loadbalancers.total,
                httpPublic: summaryData.http_loadbalancers.public_advertisement,
                httpPrivate: summaryData.http_loadbalancers.private_advertisement,
                tcpLbsCount: summaryData.tcp_loadbalancers.total,
                tcpPublic: summaryData.tcp_loadbalancers.public_advertisement,
                tcpPrivate: summaryData.tcp_loadbalancers.private_advertisement,
                httpTotalWaf: summaryData.http_loadbalancers.waf,
                httpTotalBot: summaryData.http_loadbalancers.bot_protection,
                httpTotalAPID: summaryData.http_loadbalancers.api_discovery,
                httpTotalAPIP: summaryData.http_loadbalancers.api_protection,
                httpTotalMUD: summaryData.http_loadbalancers.malicious_user_detection,
                httpTotalMUM: summaryData.http_loadbalancers.malicious_user_mitigation,
                httpTotalCSD: summaryData.http_loadbalancers.client_side_defense,
                loadBalancers: preparedUsers
            };

            // Fetch the tenant template from a remote location
            return fetch('/overview_tenant.mustache')
                .then(response => response.text())
                .then(template => {
                    // Render the template with Mustache
                    return Mustache.render(template, templateData);
                })
                .catch(error => {
                    console.error('Failed to load tenant template:', error);
                    throw new Error('Failed to load template');
                });
        })
        .catch(error => {
            console.error("Error fetching user data for tenant:", tenantName, error);
            throw new Error('Error processing tenant data');
        });
}






/**
 * Placeholder function to populate row elements for each tenant.
 * @param {string} tenantName - The name of the tenant.
 * @param {Object} tenantData - Data specific to the tenant, possibly including detailed load balancer info.
 */
function populateOverviewRow(tenantName, tenantData) {
    console.log('Populating rows for:', tenantName, tenantData);
    // This function would handle populating specific load balancer rows for each tenant.
}



/// Test functions

$(document).on('click', '#populateOverview', function () {
    // Clear previous results
    // $('#results').empty();

    populateOverview();
});


$(document).on('click', '#testButton', function () {
    // Clear previous results
    $('#results').empty();

    // Call the getApiInventory function with forcerefresh parameter
    getApiInventory(false)
        .then(inventory => {
            // Handle the response
            //const data = inventory.inventory;
            $('#results').append('<pre>' + JSON.stringify(inventory.inventory, null, 2) + '</pre>');
        })
        .catch(error => {
            // Handle the error
            $('#results').append('<p>Error: ' + error.message + '</p>');
        });
});



$(document).on('click', '#testButton2', function () {
    // Clear previous results
    $('#results').empty();

    // Call the getApiInventory function with forcerefresh parameter
    getApiInventory(true)
        .then(inventory => {
            // Handle the response
            $('#results').append('<pre>' + JSON.stringify(inventory, null, 2) + '</pre>');
        })
        .catch(error => {
            // Handle the error
            $('#results').append('<p>Error: ' + error.message + '</p>');
        });
});

$(document).on('click', '#testButton3', function () {
    // Clear previous results
    $('#results').empty();

    // Call the getApiInventory function with forcerefresh parameter
    const dataInventory = getApiInventory();
    getApiStats(dataInventory, false, FIVE_MINUTES)
        .then(inventory => {
            // Handle the response
            $('#results').append('<pre>' + JSON.stringify(inventory, null, 2) + '</pre>');
        })
        .catch(error => {
            // Handle the error
            $('#results').append('<p>Error: ' + error.message + '</p>');
        });
});

$(document).on('click', '#testButton4', function () {
    // Clear previous results
    $('#results').empty();

    // Call the getApiInventory function with forcerefresh parameter
    getApiStats(true, ONE_DAY)
        .then(inventory => {
            // Handle the response
            $('#results').append('<pre>' + JSON.stringify(inventory, null, 2) + '</pre>');
        })
        .catch(error => {
            // Handle the error
            $('#results').append('<p>Error: ' + error.message + '</p>');
        });
});


$(document).on('click', '#testButton5', async function () {
    // Clear previous results
    $('#results').empty();

    console.log('testButton5');
    // Call the getApiInventory function with forcerefresh parameter
    try {
        const dataInventory = await getApiInventory(false);
        console.log('dataInventory:', dataInventory);

        const inventory = await getApiTotalSecurityEvents(dataInventory, true, ONE_DAY);
        // Handle the response
        console.log('inventory:', inventory);
        $('#results').append('<pre>' + JSON.stringify(inventory, null, 2) + '</pre>');
    } catch (error) {
        // Handle the error
        $('#results').append('<p>Error: ' + error.message + '</p>');
    }
});

$(document).on('click', '#testButton5b', async function () {
    // Clear previous results
    $('#results').empty();

    console.log('testButton5b');
    // Call the getApiInventory function with forcerefresh parameter
    try {
        const dataInventory = await getApiInventory(false);
        console.log('dataInventory:', dataInventory);

        const inventory = await getApiAllSecurityEvents('f5-amer-ent', 'demo-shop', true, ONE_WEEK);
        // Handle the response
        console.log('inventory:', inventory);
        $('#results').append('<pre>' + JSON.stringify(inventory, null, 2) + '</pre>');
    } catch (error) {
        // Handle the error
        $('#results').append('<p>Error: ' + error.message + '</p>');
    }
});

$(document).on('click', '#testButton6', async function () {
    // Clear previous results
    $('#results').empty();

    console.log('testButton6');
    // Call the getApiInventory function with forcerefresh parameter
    try {

        const nsdetails = await getApiNSDetails('f5-amer-ent', 'j-cianfarani', true);
        // Handle the response
        console.log('NS details:', nsdetails);
        $('#results').append('<pre>' + JSON.stringify(nsdetails, null, 2) + '</pre>');
    } catch (error) {
        // Handle the error
        $('#results').append('<p>Error: ' + error.message + '</p>');
    }
});

$(document).on('click', '#testButton7', async function () {
    // Clear previous results
    $('#results').empty();

    console.log('testButton7');
    // Call the getApiInventory function with forcerefresh parameter
    try {

        const users = await getApiTenantUsers('finastra', 5, true);
        // Handle the response
        console.log('Tenant users:', users);
        $('#results').append('<pre>' + JSON.stringify(users, null, 2) + '</pre>');
    } catch (error) {
        // Handle the error
        $('#results').append('<p>Error: ' + error.message + '</p>');
    }
});

/**
 * Stores the given data in the browser's local storage, under the specified key.
 * Also adds a timestamp to the data.
 * @param {string} key - The key under which the data will be stored in local storage.
 * @param {any} data - The data to be stored in local storage.
 */
function cacheSetData(key, data) {
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
function cacheGetData(key, maxAgeInSeconds) {
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
 * Clears the specified keys from the browser's local storage.
 * Used with variable keysToClear all normally cached data objects, when a major event 
 * requires data to be purged.
 * @param {Array} keys - An array of keys to be cleared from local storage.
 * @throws {Error} Throws an error if the input is not an array.
 */
function cacheClear(keys) {
    // Check if the provided input is an array
    if (!Array.isArray(keys)) {
        // Throw an error if the input is not an array
        throw new Error('Input must be an array');
    }

    // Iterate over the array of keys and remove each item from localStorage
    keys.forEach(key => {
        // Remove the item from localStorage with the specified key
        localStorage.removeItem(key);
    });
}

/**
 * Converts a UTC date/time string to the local time or a specified timezone. Can also return just the date.
 * @param {string} utcDateTime - The UTC date/time string in ISO format.
 * @param {string} [timezone=''] - Optional. The timezone to convert to (e.g., 'America/New_York').
 * @param {boolean} [dateOnly=false] - Optional. If true, returns only the date part.
 * @returns {string} - The converted date/time string in the local or specified timezone.
 * 
 * 
//      'UTC',
//     'Europe/London',
//     'Europe/Berlin',
//     'Europe/Paris',
//     'America/New_York',
//     'America/Chicago',
//     'America/Denver',
//     'America/Los_Angeles',
//     'Asia/Tokyo',
//     'Asia/Hong_Kong',
//     'Asia/Kolkata',
//     'Australia/Sydney',
//     'Pacific/Auckland'
 * 
 */
// // Example usage:
// const utcDateTime = '2024-01-04T15:25:10.171824380Z';
// console.log("Local Date and Time:", convertDateTime(utcDateTime));                      // Converts to local date/time
// console.log("Specific Timezone (e.g., New York) Date and Time:", convertDateTime(utcDateTime, 'America/New_York')); // Converts to New York timezone
// console.log("Local Date Only:", convertDateTime(utcDateTime, '', true));                // Converts to local date only
// console.log("Specific Timezone (e.g., New York) Date Only:", convertDateTime(utcDateTime, 'America/New_York', true)); // Converts to New York date only
function convertDateTime(utcDateTime, timezone = '', dateOnly = false) {
    const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: dateOnly ? undefined : '2-digit',
        minute: dateOnly ? undefined : '2-digit',
        hour12: true, // to get the 12-hour format with am/pm
        timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    const dateTime = new Date(utcDateTime);
    const formattedDate = dateTime.toLocaleString([], options);

    if (dateOnly) {
        // Return only the date part if dateOnly is true
        return formattedDate.split(', ')[0];
    } else {
        // Extract the date and time parts
        const [date, time] = formattedDate.split(', ');

        // Remove seconds from the time
        const [hourMinute, period] = time.split(' ');

        // Return the formatted date and time
        return `${date} ${hourMinute}${period.toLowerCase()}`;
    }
}

/**
 * Formats the given data throughput value in appropriate units.
 * 
 * @param {number} bps - The data throughput value in bits per second.
 * @returns {string} - The formatted data throughput value with appropriate units.
 */
function formatDataThroughput(bps) {
    // If the data throughput is greater than or equal to 1 billion bits per second, format it as gigabits per second.
    if (bps >= 1e9) {
        return `${(bps / 1e9).toFixed(2)} Gbps`; // Return the formatted data throughput value with 'Gbps' units.
    }
    // If the data throughput is greater than or equal to 1 million bits per second, format it as megabits per second.
    else if (bps >= 1e6) {
        return `${(bps / 1e6).toFixed(2)} Mbps`; // Return the formatted data throughput value with 'Mbps' units.
    }
    // If the data throughput is greater than or equal to 1 thousand bits per second, format it as kilobits per second.
    else if (bps >= 1e3) {
        return `${(bps / 1e3).toFixed(2)} kbps`; // Return the formatted data throughput value with 'kbps' units.
    }
    // If the data throughput is less than 1 thousand bits per second, format it as bits per second.
    else {
        return `${bps} bps`; // Return the formatted data throughput value with 'bps' units.
    }
}

/**
 * Formats the given data transfer value in appropriate units.
 * 
 * @param {number} bytes - The data transfer value in bytes.
 * @returns {string} - The formatted data transfer value with appropriate units.
 */
function formatDataTransfer(bytes) {
    // If the data transfer is greater than or equal to 1 terabyte, format it as terabytes.
    if (bytes >= 1e12) {
        return `${(bytes / 1e12).toFixed(2)} TB`; // Return the formatted data transfer value with 'TB' units.
    }
    // If the data transfer is greater than or equal to 1 gigabyte, format it as gigabytes.
    else if (bytes >= 1e9) {
        return `${(bytes / 1e9).toFixed(2)} GB`; // Return the formatted data transfer value with 'GB' units.
    }
    // If the data transfer is greater than or equal to 1 megabyte, format it as megabytes.
    else if (bytes >= 1e6) {
        return `${(bytes / 1e6).toFixed(2)} MB`; // Return the formatted data transfer value with 'MB' units.
    }
    // If the data transfer is greater than or equal to 1 kilobyte, format it as kilobytes.
    else if (bytes >= 1e3) {
        return `${(bytes / 1e3).toFixed(2)} KB`; // Return the formatted data transfer value with 'KB' units.
    }
    // If the data transfer is less than 1 kilobyte, format it as bytes.
    else {
        return `${bytes} bytes`; // Return the formatted data transfer value with 'bytes' units.
    }
}

/**
 * Formats time given in seconds to a more readable format.
 * If the time is less than one second, it converts it to milliseconds.
 * If the time is more than 60 seconds, it converts it to minutes.
 * @param {number} seconds - The time in seconds.
 * @returns {string} - The time formatted in seconds or milliseconds.
 */
function formatTime(seconds) {
    if (seconds < 1) {  // If the time is less than one second, show it in milliseconds
        return `${(seconds * 1000).toFixed(1)} ms`;
    } else if (seconds >= 60) {  // If the time is one minute or more, convert it to minutes
        return `${(seconds / 60).toFixed(2)} min`;
    } else {  // Otherwise, display seconds
        return `${seconds.toFixed(2)} s`;
    }
}


/**
 * Formats a generic number to a more readable format.
 * If the number is more than 1 billion, it converts it to billions.
 * If the number is more than 1 million, it converts it to millions.
 * If the number is more than 1 thousand, it converts it to thousands.
 * Otherwise, it shows the number as is.
 * 
 * @param {number} number - The number to format.
 * @returns {string} - The formatted number with appropriate units.
 */
function formatGenericNumber(number) {
    // If the number is more than 1 billion, convert it to billions.
    if (number >= 1e9) {
        return `${(number / 1e9).toFixed(1)}B`;
    }
    // If the number is more than 1 million, convert it to millions.
    else if (number >= 1e6) {
        return `${(number / 1e6).toFixed(1)}M`;
    }
    // If the number is more than 1 thousand, convert it to thousands.
    else if (number >= 1e3) {
        return `${(number / 1e3).toFixed(1)}K`;
    }
    // If the number is less than 1 thousand, show it as is.
    else {
        return `${number}`;
    }
}


// // Example usage:
const utcDateTime = '2024-01-04T15:25:10.171824380Z';
console.log("Local Date and Time:", convertDateTime(utcDateTime));                      // Converts to local date/time
console.log("Specific Timezone (e.g., New York) Date and Time:", convertDateTime(utcDateTime, 'America/New_York')); // Converts to New York timezone
console.log("Local Date Only:", convertDateTime(utcDateTime, '', true));                // Converts to local date only
console.log("Specific Timezone (e.g., New York) Date Only:", convertDateTime(utcDateTime, 'America/New_York', true)); // Converts to New York date only

