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
 * Fetches inventory from the API with caching.
 * @param {boolean} forcerefresh - If true, forces a fresh API call, otherwise uses cached data if available.
 * @returns {Promise} - A promise that resolves with the inventory data.
 */
function getApiInventory(forcerefresh) {
    // Set the cache key and maximum age for the data
    const cacheKey = 'dataInventory';
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

        // Make AJAX call to /api/v1/getInventory endpoint
        $.ajax({
            url: '/api/v1/getInventory',
            method: 'POST',
            success: function (response) {
                if (response.success) {
                    const inventory = response.inventory;
                    cacheSetData(cacheKey, inventory); // Cache the data
                    resolve(inventory);
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
 * Fetches stats from the API with caching.
 * @param {boolean} forcerefresh - If true, forces a fresh API call, otherwise uses cached data if available.
 * @param {number} secondsback - The time range in seconds to fetch stats for.
 * @param {string} [lbname=null] - The load balancer name to filter results (optional).
 * @returns {Promise} - A promise that resolves with the stats data.
 * TODO - cache per time interval
 */
function getApiStats(forcerefresh, secondsback, lbname = null) {
    // Set the cache key and maximum age for the data
    const cacheKey = 'dataStats';
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
            data: JSON.stringify({ secondsback, lbname }),
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
 * @param {boolean} forcerefresh - If true, forces a fresh API call, otherwise uses cached data if available.
 * @param {number} secondsback - The time range in seconds for the security events query.
 * @param {string} sec_event_type - The type of security event to query (or 'all' for all types).
 * @returns {Promise} - A promise that resolves with the security events data.
 */
function getApiSecurityEvents(forcerefresh, secondsback, sec_event_type) {
    // Set the cache key based on the secondsback parameter
    const cacheKey = `dataSecEvents_${secondsback}`;
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

        // Make AJAX call to /api/v1/getSecurityEvents endpoint
        $.ajax({
            url: '/api/v1/getSecurityEvents',
            method: 'POST',
            data: JSON.stringify({ secondsback, sec_event_type }),
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


$(document).on('click', '#testButton', function () {
    // Clear previous results
    $('#results').empty();

    // Call the getApiInventory function with forcerefresh parameter
    getApiInventory(false)
        .then(inventory => {
            // Handle the response
            $('#results').append('<pre>' + JSON.stringify(inventory, null, 2) + '</pre>');
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
    getApiStats(false, FIVE_MINUTES)
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
    getApiStats(true, FIVE_MINUTES)
        .then(inventory => {
            // Handle the response
            $('#results').append('<pre>' + JSON.stringify(inventory, null, 2) + '</pre>');
        })
        .catch(error => {
            // Handle the error
            $('#results').append('<p>Error: ' + error.message + '</p>');
        });
});


$(document).on('click', '#testButton5', function () {
    // Clear previous results
    $('#results').empty();

    // Call the getApiInventory function with forcerefresh parameter
    getApiSecurityEvents(true, ONE_DAY, 'all')
        .then(inventory => {
            // Handle the response
            $('#results').append('<pre>' + JSON.stringify(inventory, null, 2) + '</pre>');
        })
        .catch(error => {
            // Handle the error
            $('#results').append('<p>Error: ' + error.message + '</p>');
        });
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
