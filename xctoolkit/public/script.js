// script.js v1.2

// import transitions from "bootstrap";


//// Initial Variables ///

const ONE_MINUTE = 60; // 1 minute
const FIVE_MINUTES = 5 * 60; // 5 minutes
const ONE_HOUR = 60 * 60; // 1 hour
const SIX_HOURS = 6 * 60 * 60; // 6 hours
const ONE_DAY = 24 * 60 * 60; // 1 day
const ONE_WEEK = 7 * 24 * 60 * 60; // 1 week

let countdownTimer;



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
            populateFormFromCookie();

        }
    },
    testapikeys: {
        url: 'testapikeys.html',
        func: function () {
            document.getElementById('testapikey-loading').style.display = 'none';
            document.getElementById('testapikey-loaded').style.display = 'none';
            //populatetestApiKeys();
            console.log('Log testapikeys page specific function executed.');

        }
    },
    overview: {
        url: 'overview.html',
        func: function () {
            console.log('Overview page specific function executed.');
            populateOverview();
            initPopovers();
        }
    },
    apiendpoints: {
        url: 'apiendpoints.html',
        func: function () {
            populateApiEndpoints();
            console.log('ApiEndpoints page specific function executed.');

        }
    },
    logexport: {
        url: 'logexport.html',
        func: function () {
            populateLogExport()
            console.log('Log Export page specific function executed.');

        }
    },
    pathlatency: {
        url: 'pathlatency.html',
        func: function () {
            populatePathLatency()
            console.log('Log pathlatency page specific function executed.');
        }
    },
    wafexclusion: {
        url: 'wafexclusion.html',
        func: function () {
            populateWafExclusion()
            console.log('Log wafexclusion page specific function executed.');

        }
    },
    editsets: {
        url: 'editsets.html',
        func: function () {
            populateEditSets()
            console.log('Log editsets page specific function executed.');

        }
    },
    backup: {
        url: 'backup.html',
        func: function () {
            populateBackup()
            console.log('Log backup page specific function executed.');

        }
    }
};


/// COMMON FUNCTIONS /// 

// Check if the user has visited the page before if not show the default page
// Checks if the apiKeys cookie is present if not shows the API Keys page
// populates the left side tenant select
// Restores the saved theme dark or light
$(document).ready(function () {
    const currentPage = localStorage.getItem('currentPage') || 'default';
    applySavedTheme()
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

    // Init Tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
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
        loadContent('apisetup');

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



// Set Breadcrumbs, not currently needed or used.
function setBreadcrumbs(breadcrumbs) {
    for (let i = 0; i < 5; i++) {
        $("#breadcrumb-" + (i + 1)).html(breadcrumbs[i] || "");
    }
}



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
 * Clears the local storage cache. If a prefix is provided, only items
 * with keys starting with the prefix are cleared.
 *
 * @param {string} [prefix] - Optional. The prefix of the keys to clear.
 * @throws {Error} If the prefix argument is not a string or undefined.
 */
function cacheClear(prefix) {
    // If no argument is passed, clear all local storage
    if (typeof prefix === 'undefined') {
        localStorage.clear();
    }
    // If a prefix string is passed, clear items starting with that prefix
    else if (typeof prefix === 'string') {
        // Loop through all keys in local storage
        Object.keys(localStorage).forEach(key => {
            // If the key starts with the prefix, remove it from local storage
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
    // Throw an error if the argument is not a string or undefined
    else {
        throw new Error('Argument must be a string prefix or undefined');
    }
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

    if (!utcDateTime) {
        return 'N/A'; // Immediately return if the input is null or empty
    }

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
function formatDataThroughput(number) {
    let bps = parseFloat(number);

    if (isNaN(bps)) {
        return '-';
    }

    // If the data throughput is greater than or equal to 1 billion bits per second, format it as gigabits per second.
    if (bps >= 1e9) {
        return `${(bps / 1e9).toFixed(1)} Gbps`; // Return the formatted data throughput value with 'Gbps' units.
    }
    // If the data throughput is greater than or equal to 1 million bits per second, format it as megabits per second.
    else if (bps >= 1e6) {
        return `${(bps / 1e6).toFixed(1)} Mbps`; // Return the formatted data throughput value with 'Mbps' units.
    }
    // If the data throughput is greater than or equal to 1 thousand bits per second, format it as kilobits per second.
    else if (bps >= 1e3) {
        return `${(bps / 1e3).toFixed(1)} kbps`; // Return the formatted data throughput value with 'kbps' units.
    }
    // If the data throughput is less than 1 thousand bits per second, format it as bits per second.
    else {
        return `${bps.toFixed(1)} bps`; // Return the formatted data throughput value with 'bps' units.
    }
}

/**
 * Formats the given data transfer value in appropriate units.
 * 
 * @param {number} bytes - The data transfer value in bytes.
 * @returns {string} - The formatted data transfer value with appropriate units.
 */
function formatDataTransfer(number) {
    let bytes = parseFloat(number);

    if (isNaN(bytes)) {
        return '-';
    }
    // If the data transfer is greater than or equal to 1 terabyte, format it as terabytes.
    if (bytes >= 1e12) {
        return `${(bytes / 1e12).toFixed(1)} TB`; // Return the formatted data transfer value with 'TB' units.
    }
    // If the data transfer is greater than or equal to 1 gigabyte, format it as gigabytes.
    else if (bytes >= 1e9) {
        return `${(bytes / 1e9).toFixed(1)} GB`; // Return the formatted data transfer value with 'GB' units.
    }
    // If the data transfer is greater than or equal to 1 megabyte, format it as megabytes.
    else if (bytes >= 1e6) {
        return `${(bytes / 1e6).toFixed(1)} MB`; // Return the formatted data transfer value with 'MB' units.
    }
    // If the data transfer is greater than or equal to 1 kilobyte, format it as kilobytes.
    else if (bytes >= 1e3) {
        return `${(bytes / 1e3).toFixed(1)} KB`; // Return the formatted data transfer value with 'KB' units.
    }
    // If the data transfer is less than 1 kilobyte, format it as bytes.
    else {
        return `${bytes.toFixed(1)} bytes`; // Return the formatted data transfer value with 'bytes' units.
    }
}

/**
 * Formats time given in seconds to a more readable format.
 * If the time is less than one second, it converts it to milliseconds.
 * If the time is more than 60 seconds, it converts it to minutes.
 * @param {number} seconds - The time in seconds.
 * @returns {string} - The time formatted in seconds or milliseconds.
 */
function formatLatency(number) {
    let seconds = parseFloat(number);

    if (isNaN(seconds)) {
        return '-';
    }

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
    let num = parseFloat(number);

    if (isNaN(num)) {
        return '-';
    }

    // If the number is more than 1 billion, convert it to billions.
    if (num >= 1e9) {
        return `${(num / 1e9).toFixed(1)}B`;
    }
    // If the number is more than 1 million, convert it to millions.
    else if (num >= 1e6) {
        return `${(num / 1e6).toFixed(1)}M`;
    }
    // If the number is more than 1 thousand, convert it to thousands.
    else if (num >= 1e3) {
        return `${(num / 1e3).toFixed(1)}K`;
    }
    // If the number is less than 1 thousand, show it as is.
    else {
        return `${(num).toFixed(0)}`;
    }
}

function formatHealth(number) {
    let num = parseFloat(number);

    if (isNaN(num)) {
        return 'N/A';
    }

    // Round to nearest whole number if very close to 100
    if (num > 99.9) {
        num = 100;
    }

    // Apply toFixed only if the number is not a whole number
    if (num % 1 !== 0) {
        num = num.toFixed(1);
    }

    return `${num}%`;
}




/**
 * Fetches a template from the server and caches it for future use.
 *
 * @param {string} templateName - The name of the template to fetch.
 * @param {boolean} [forcerefresh=false] - Optional. If true, forces a refresh of the template from the server.
 * @return {Promise<string>} A Promise that resolves to the fetched template.
 */
function getTemplate(templateName, forcerefresh = false) {
    // The cache key used to store the template
    const cacheKey = `template_${templateName}`;
    // The maximum age of the cached template in seconds
    const maxAgeInSeconds = 1; // Cache for 60 minutes

    return new Promise((resolve, reject) => {
        // Check if the template should be fetched from cache
        if (!forcerefresh) {
            const cachedTemplate = cacheGetData(cacheKey, maxAgeInSeconds);
            // If the template is found in cache, resolve the promise with the cached template
            if (cachedTemplate !== null) {
                console.log("Using cached template for:", templateName);
                resolve(cachedTemplate);
                return;
            }
        }

        // Fetch the template from the remote location
        console.log("Fetching new template for:", templateName);
        fetch(`/templates/${templateName}.mustache`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch template: ' + response.statusText);
                }
                return response.text();
            })
            .then(template => {
                cacheSetData(cacheKey, template); // Cache the fetched template
                resolve(template);
            })
            .catch(error => {
                console.error('Error fetching template:', templateName, error);
                reject(error);
            });
    });
}

/**
 * Toggles the theme of the website between light and dark mode.
 * Stores the selected theme in the local storage.
 */
function toggleTheme() {
    // Toggle the 'dark-mode' class on the body element.
    // This class is used to apply the dark mode styles.
    const isDarkMode = document.body.classList.toggle('dark-mode');

    // Set the data-bs-theme attribute on the root HTML element to 'dark' or 'light'
    // based on the selected theme. This attribute is used by Bootstrap to apply the
    // appropriate theme styles.
    document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');

    // Store the selected theme in the local storage. This ensures that the theme
    // is preserved across page reloads.
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Update the logo image source based on the theme
    const newImgSrc = isDarkMode ? '/images/xctoolkit_logo_dark.svg' : '/images/xctoolkit_logo.svg';
    document.getElementById('logoimg').src = newImgSrc;
}


$(document).on('click', '#toggleTheme', function () {
    toggleTheme();
});

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme'); // Retrieve the theme from local storage.
    const themeToggleCheckbox = document.getElementById('toggleTheme'); // Get the checkbox element.
    const imageElement = document.getElementById('logoimg'); // Assuming you have an image that needs to change with the theme.

    // Check if a theme has been saved in localStorage.
    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode'); // Add 'dark-mode' class to body.
            document.documentElement.setAttribute('data-bs-theme', 'dark'); // Set data attribute to 'dark'.
            if (themeToggleCheckbox) {
                themeToggleCheckbox.checked = true; // Set the checkbox to checked if dark mode is active.
            }
            // Set image source for dark mode
            if (imageElement) {
                imageElement.src = '/images/xctoolkit_logo_dark.png';
            }
        } else {
            document.body.classList.remove('dark-mode'); // Remove 'dark-mode' class from body.
            document.documentElement.setAttribute('data-bs-theme', 'light'); // Set data attribute to 'light'.
            if (themeToggleCheckbox) {
                themeToggleCheckbox.checked = false; // Ensure the checkbox is not checked if light mode is active.
            }
            // Set image source for light mode
            if (imageElement) {
                imageElement.src = '/images/xctoolkit_logo.png';
            }
        }
    }
}

function startCountdown(duration, displayElement, onFinish) {
    let timer = duration, minutes, seconds;
    countdownTimer = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        displayElement.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(countdownTimer);
            if (typeof onFinish === 'function') onFinish();
        }
    }, 1000);
}

function stopTimer() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        console.log('Timer stopped');
    }
}

function processTenantAge(tenantAges, tenantName) {
    // Extract the creation timestamp
    const creationTimestamp = tenantAges[tenantName]?.creation_timestamp;

    if (!creationTimestamp) {
        console.log("No creation timestamp found for", tenantName);
        return;
    }

    // Convert the timestamp to a Date object
    const creationDate = new Date(creationTimestamp);

    // Format the creation date to local timezone
    const localDate = creationDate.toLocaleDateString();

    // Calculate the difference in days since creation
    const currentDate = new Date();
    const timeDiff = currentDate - creationDate; // difference in milliseconds
    const daysSinceCreation = Math.floor(timeDiff / (1000 * 60 * 60 * 24)); // convert milliseconds to days

    return { localDate, daysSinceCreation };
}



function getApiInventory(forcerefresh = false, checkselection = false, tenantFilter = null) {
    const cacheKey = 'dataInventory';
    const summaryCacheKey = 'dataInventorySummary';
    const maxAgeInSeconds = 60 * 60 * 6; // 6 Hours for caching the response

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
                    cacheSetData(summaryCacheKey, summary); // Cache the summarized stats data

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
    const maxAgeInSeconds = 60 * 60; // 60 minutes

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

function getTenantAge(inventory) {
    // Define a cache key specific to the tenant age data
    const cacheKey = 'dataTenantAge';
    const maxAgeInSeconds = 60 * 60; // 60 minutes, adjust as needed

    return new Promise((resolve, reject) => {
        // Check if the data should be fetched from cache
        const cachedData = cacheGetData(cacheKey, maxAgeInSeconds);
        if (cachedData !== null) {
            resolve(cachedData);
            return;
        }

        // Make AJAX call to /api/v1/getTenantAge endpoint
        $.ajax({
            url: '/api/v1/getTenantAge',
            method: 'POST',
            data: JSON.stringify({ inventory }),
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    const tenantAges = response.tenantAges;
                    cacheSetData(cacheKey, tenantAges); // Cache the data
                    resolve(tenantAges);
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



/// COMMON FUNCTIONS END ///






// $(document).ready(function () {
//     // Event delegation for all current and future collapse elements of a specific type/class
//     $('body').on('show.bs.collapse', '.collapse .collapse-row', function () {
//         console.log('1. show.bs.collapse triggered for ' + this.id);
//         var tenant = $(this).data('tenant');
//         var namespace = $(this).data('namespace');
//         var lbname = $(this).data('lbname');
//         console.log('1. Data:', tenant, namespace, lbname);
//         // populateRowDetails(this.id, tenant, namespace, lbname);
//     });

// });


// // Define the populateRowDetails function to update the details section
// function populateRowDetails(collapseId, tenant, namespace, lbname) {
//     // Placeholder text incorporating data attributes
//     var placeholderText = "Loading details for Tenant: " + tenant + ", Namespace: " + namespace + ", LB Name: " + lbname + "...";

//     // Find the collapse element and update its content
//     $('#' + collapseId + ' .tableDetails').html(placeholderText);

//     console.log('Populating details for: ' + collapseId + " with Tenant: " + tenant + ", Namespace: " + namespace + ", LB Name: " + lbname);
// }









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
                console.log('delegated Name:', key['delegated-name']);
                console.log('delegated State:', key['delegated-state']);
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
                let delegatedStateElement = row.find('.delegated-state');
                let delegatedNameElement = row.find('.delegated-name');
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
                delegatedStateElement.val(key['delegated-state']);
                delegatedNameElement.val(key['delegated-name']);
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

                if (key['delegated-state'] === 'enabled') {
                    delegatedNameElement.prop('disabled', false);
                } else {
                    delegatedNameElement.prop('disabled', true);
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
    newRow.find('.delegated-state').val('disabled'); // Select default value for delegated state Format    
    newRow.find('.namespace-name').prop('disabled', true); // Ensure Namespace Name is disabled
    newRow.find('.delegated-name').prop('disabled', true); // Ensure delegated Name is disabled
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

//delegated State Change Event
$(document).on('change', '.delegated-state', function () {
    var delegatedState = $(this).val();
    var delegatedNameInput = $(this).closest('.api-key-row').find('.delegated-name');
    if (delegatedState === 'disabled') {
        delegatedNameInput.prop('disabled', true).val('');
        delegatedNameInput.removeClass('is-invalid');
    } else {
        delegatedNameInput.prop('disabled', false);
    }
    console.log('delegated type changed to:', delegatedState);
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
                "delegated-state": $(this).find(".delegated-state").val(),
                "delegated-name": $(this).find(".delegated-name").val(),
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
// function validateField(field) {
//     var isValid = true;
//     var value = field.val();
//     console.log('Validating field:', field, 'value:', value);

//     if (field.hasClass('namespace-name')) {
//         var namespaceType = field.closest('.api-key-row').find('.namespace-type').val();
//         console.log('Namespace Type:', namespaceType);
//         if (namespaceType === 'all') {
//             isValid = true; // Skip validation for namespace-name when namespace-type is 'all'
//             console.log('Namespace type is all, skipping validation for namespace-name');
//         } else {
//             isValid = /^[a-z0-9\-]{3,20}$/.test(value);
//             console.log('Namespace name validation result:', isValid);
//         }
//     } else if (field.hasClass('delegated-name')) {
//         var state = field.closest('.api-key-row').find('.delegated-state').val();
//         console.log('Delegated State:', state);
//         if (state === 'disabled') {
//             field.prop('disabled', true);
//             isValid = true; // If state is disabled, skip validation and disable input
//             console.log('Delegated state is disabled, skipping validation for delegated-name');
//         } else {
//             field.prop('disabled', false);
//             isValid = /^[a-z0-9\-]{4,16}$/.test(value); // Use same regex as tenant-name
//             console.log('Delegated name validation result:', isValid);
//         }
//     } else if (field.hasClass('tenant-name')) {
//         isValid = /^[a-z0-9\-]{4,16}$/.test(value);
//         console.log('Tenant name validation result:', isValid);
//     } else if (field.hasClass('apikey')) {
//         isValid = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|-]{10,80}$/.test(value);
//         console.log('API key validation result:', isValid);
//     } else {
//         isValid = true; // For any other fields not explicitly checked
//         console.log('Default validation passed');
//     }

//     if (isValid) {
//         field.removeClass('is-invalid');
//         console.log('Field marked as valid');
//     } else {
//         field.addClass('is-invalid');
//         console.log('Field marked as invalid');
//     }

//     console.log('Field validation complete:', field.attr('class'), 'ValidState:', isValid);
//     return isValid;
// }


function validateField(field) {
    var isValid = true;
    var value = field.val();
    console.log('Validating field:', field, 'value:', value);

    if (field.hasClass('namespace-type')) {
        var apikeyRights = field.closest('.api-key-row').find('.apikey-rights').val();
        if (value === 'all' && apikeyRights !== 'allns') {
            isValid = false; // If namespace-type is 'all', apikey-rights must be 'allns'
            console.log('Namespace type is all but apikey-rights is not allns, invalid combination');
        } else {
            console.log('Namespace type and apikey-rights validation passed');
        }
    } else if (field.hasClass('namespace-name')) {
        var namespaceType = field.closest('.api-key-row').find('.namespace-type').val();
        console.log('Namespace Type:', namespaceType);
        if (namespaceType === 'all') {
            isValid = true; // Skip validation for namespace-name when namespace-type is 'all'
            console.log('Namespace type is all, skipping validation for namespace-name');
        } else {
            isValid = /^[a-z0-9\-]{3,20}$/.test(value);
            console.log('Namespace name validation result:', isValid);
        }
    } else if (field.hasClass('delegated-name')) {
        var state = field.closest('.api-key-row').find('.delegated-state').val();
        console.log('Delegated State:', state);
        if (state === 'disabled') {
            field.prop('disabled', true);
            isValid = true; // If state is disabled, skip validation and disable input
            console.log('Delegated state is disabled, skipping validation for delegated-name');
        } else {
            field.prop('disabled', false);
            isValid = /^[a-z0-9\-]{4,16}$/.test(value);
            console.log('Delegated name validation result:', isValid);
        }
    } else if (field.hasClass('tenant-name')) {
        isValid = /^[a-z0-9\-]{4,16}$/.test(value);
        console.log('Tenant name validation result:', isValid);
    } else if (field.hasClass('apikey')) {
        isValid = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|-]{10,80}$/.test(value);
        console.log('API key validation result:', isValid);
    } else {
        isValid = true; // For any other fields not explicitly checked
        console.log('Default validation passed');
    }

    if (isValid) {
        field.removeClass('is-invalid');
        console.log('Field marked as valid');
    } else {
        field.addClass('is-invalid');
        console.log('Field marked as invalid');
    }

    console.log('Field validation complete:', field.attr('class'), 'ValidState:', isValid);
    return isValid;
}



/// API KEYS PAGE CODE BELOW  END ///

/// Overview  PAGE CODE BELOW  START ///
function populateOverview() {
    const secondsback = document.getElementById('overviewSecondsBack').value || '86400'; // Default to last 24 hours if no value selected

    document.getElementById('inventory-loading').style.display = 'block';
    document.getElementById('inventory-loaded').style.display = 'none';
    document.getElementById('stats-loading').style.display = 'block';
    document.getElementById('stats-loaded').style.display = 'none';

    // First, fetch the inventory
    getApiInventory(false, true).then(inventory => {
        // After inventory is fetched, fetch the tenant ages
        getTenantAge(inventory).then(tenantages => {

            document.getElementById('inventory-loading').style.display = 'none';
            document.getElementById('inventory-loaded').style.display = 'block';

            // After tenant ages are fetched, fetch the stats
            getApiStats(inventory, false, secondsback).then(stats => {

                document.getElementById('stats-loading').style.display = 'none';
                document.getElementById('stats-loaded').style.display = 'block';

                const tenants = Object.keys(inventory.inventory);
                tenants.sort();

                // Map each tenant to a promise that resolves to its HTML, now including tenantAges
                const renderPromises = tenants.map(tenantName => {
                    return populateOverviewTenant(tenantName, inventory, stats, tenantages);
                });

                // Wait for all promises to resolve and then update the DOM
                Promise.all(renderPromises)
                    .then(renderedHtmls => {
                        const overviewHTML = renderedHtmls.join(''); // Join all HTML strings
                        document.getElementById('overview-container').innerHTML = overviewHTML; // Update the DOM once
                        initPopovers(); // Initialize popovers after HTML is inserted
                    })
                    .catch(error => {
                        console.error("Failed to render some tenant overviews:", error);
                    });

            }).catch(error => {
                console.error("Failed to fetch stats:", error);
            });
        }).catch(error => {
            console.error("Failed to fetch tenant ages:", error);
        });
    }).catch(error => {
        console.error("Failed to fetch inventory:", error);
    });
}




function populateOverviewTenant(tenantName, inventory, stats, tenantages) {
    const tenantData = inventory.inventory[tenantName]; // Specific tenant's data
    const summaryData = inventory.summary[tenantName]; // Summary data for the tenant
    const ageData = processTenantAge(tenantages, tenantName);


    // Fetch API keys from cookies
    const apiKeys = JSON.parse(decodeURIComponent(getCookie('apiKeys')) || '[]');
    // Determine the relevant API key for the current row
    const apiKeyDetails = apiKeys.find(key => key['tenant-name'] === tenantName);
    console.log("Relevant API Key Details:", apiKeyDetails);

    // Check for delegated state and name
    let delegatedState = false;
    let delegatedName = '';
    let userUrl = '';  // For building the url link for the user list either default or managed

    if (apiKeyDetails && apiKeyDetails['delegated-state'] === 'enabled') {
        delegatedState = true;
        delegatedName = apiKeyDetails['delegated-name'];
        userUrl = `https://${delegatedName}.console.ves.volterra.io/managed_tenant/${tenantName}`; // Set URL for delegated state
    } else {
        userUrl = `https://${tenantName}.console.ves.volterra.io`; // Set URL for non-delegated state
    }

    // Fetch user data and pad it if necessary
    return getApiTenantUsers(tenantName, 5, false)
        .then(data => {
            const users = data[tenantName] || [];
            console.log("Users fetched for tenant:", tenantName, users);

            let preparedUsers = users.map(user => ({
                name: user.fullname || ' ',
                email: '(' + user.email + ')' || ' ',
                lastLoginTime: user.lastlogin ? convertDateTime(user.lastlogin) : ' '
            }));

            while (preparedUsers.length < 5) {
                preparedUsers.push({ name: ' ', email: ' ', lastLoginTime: ' ' });
            }

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
                loadBalancers: preparedUsers,
                userUrl: userUrl,
                creationTimestamp: ageData.localDate,
                daysSinceCreation: ageData.daysSinceCreation
            };

            // Use the getTemplate function to fetch the tenant template
            return getTemplate('overview_tenant', false)
                .then(template => {
                    let renderedHTML = Mustache.render(template, templateData);

                    // Prepare to add load balancer rows by iterating through namespaces and load balancers
                    // const rowsPromises = Object.entries(tenantData).flatMap(([namespace, lbDetails]) => {
                    //     return Object.keys(lbDetails.http_loadbalancers).map(lbName => {
                    //         return populateOverviewRow(inventory, stats, tenantName, namespace, lbName);
                    //     });
                    // });

                    // Sort the rows based on namespace A-Z and then load balancer total requests in descending order
                    const rowsPromises = Object.keys(tenantData).sort().flatMap(namespace => {
                        const lbDetails = tenantData[namespace].http_loadbalancers || {};
                        return Object.entries(lbDetails)
                            .sort((a, b) => {
                                // Use optional chaining to safely access deeply nested properties and provide a default value
                                const totalRequestsA = stats[tenantName]?.[namespace]?.[a[0]]?.TOTAL_REQUESTS ?? 0;
                                const totalRequestsB = stats[tenantName]?.[namespace]?.[b[0]]?.TOTAL_REQUESTS ?? 0;
                                return totalRequestsB - totalRequestsA;  // Sort descending by total requests
                            })
                            .map(([lbName]) => populateOverviewRow(inventory, stats, tenantName, namespace, lbName));
                    });


                    // Wait for all load balancer rows to be generated and concatenated
                    return Promise.all(rowsPromises).then(rowsHTML => {
                        // Concatenate all rows HTML and replace the placeholder
                        const allRowsHTML = rowsHTML.join('');
                        renderedHTML = renderedHTML.replace('<!-- OVERVIEW_ROW -->', allRowsHTML);
                        return renderedHTML;
                    });
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



function populateOverviewRow(inventory, stats, tenantName, namespace, lbName) {
    console.log("Start processing LB Row for:", tenantName, namespace, lbName);

    // Fetch API keys from cookies
    const apiKeys = JSON.parse(decodeURIComponent(getCookie('apiKeys')) || '[]');
    console.log("API Keys:", apiKeys);

    // Determine the relevant API key for the current row
    const apiKeyDetails = apiKeys.find(key => key['tenant-name'] === tenantName && (key['namespace-name'] === namespace || key['namespace-type'] === 'all'));
    console.log("Relevant API Key Details:", apiKeyDetails);

    // Check for delegated state and name
    let delegatedState = false;
    let delegatedName = '';
    if (apiKeyDetails && apiKeyDetails['delegated-state'] === 'enabled') {
        delegatedState = true;
        delegatedName = apiKeyDetails['delegated-name'];
    }

    const lbStats = ((stats[tenantName] || {})[namespace] || {})[lbName] || {};
    console.log("Stats fetched for LB Row:", lbStats);

    const lbData = (((inventory.inventory[tenantName] || {})[namespace] || {}).http_loadbalancers || {})[lbName];
    if (!lbData) {
        console.error('Load balancer data not found', tenantName, namespace, lbName);
        throw new Error('Load balancer data not found');
    }

    const domains = lbData.config.domains || [];

    // Prepare row data
    const rowData = {
        tenantName: tenantName,
        namespace: namespace,
        name: lbName,
        delegatedState: delegatedState,
        delegatedName: delegatedName,
        statusClass: determineStatusClass(lbStats.HEALTHSCORE_OVERALL),
        statusPercentage: formatHealth(lbStats.HEALTHSCORE_OVERALL),
        domainsDisplay: domains.length > 0 ? domains[0] : 'N/A',
        additionalDomains: formatAdditionalDomains(domains),
        totalRequests: formatGenericNumber(lbStats.TOTAL_REQUESTS),
        requestThroughput: formatDataThroughput(lbStats.REQUEST_THROUGHPUT),
        responseThroughput: formatDataThroughput(lbStats.RESPONSE_THROUGHPUT),
        errorRate: lbStats.HTTP_ERROR_RATE ? parseFloat(lbStats.HTTP_ERROR_RATE).toFixed(2) + '%' : '-',
        totalTransfer: formatDataTransfer(lbStats.TOTAL_DATA_TRANSFERRED),
        totalLatency: formatLatency(lbStats.HTTP_RESPONSE_LATENCY)
    };

    console.log("Processed LB Row Data:", rowData);

    // Fetch the row template
    return getTemplate('overview_row', false)
        .then(template => {
            const renderedHtml = Mustache.render(template, { loadBalancers: [rowData] });
            return renderedHtml;
        })
        .catch(error => {
            console.error('Failed to load LB row template:', error);
            throw new Error('Failed to load LB row template');
        });
}



function determineStatusClass(healthScore) {
    if (healthScore >= 95) return 'bg-success';
    else if (healthScore >= 75) return 'bg-warning';
    else if (healthScore > 0) return 'bg-danger';
    return 'bg-secondary'; // Default case
}

/**
 * Formats the additional domains into a string for display.
 *
 * @param {Array} domains - An array of additional domains.
 * @return {string} The formatted string for the additional domains, or an empty string if there are no additional domains.
 * Build domain list for popover in overview rows
 */
function formatAdditionalDomains(domains) {
    // If there are more than one domain, format them as a popover with a link to display all domains.
    if (domains.length > 1) {
        return `<br><span class="selecthover" ` +
            `title="All Domains" ` +
            `data-bs-toggle="popover" ` +
            `data-bs-placement="auto" ` +
            `data-bs-content="${domains.join(', ')}">+ All Domains</span>`;
    }
    // Otherwise, return an empty string.
    return '';
}



function populateOverviewRowDetails(tenant, namespace, lbname, secondsback) {
    console.log('Expanding details for:', tenant, namespace, lbname);

    // First, fetch the inventory
    getApiInventory(false, true).then(inventory => {
        // Use inventory to fetch stats and other details concurrently
        Promise.all([
            Promise.resolve(inventory),
            getApiStats(inventory, false, secondsback),
            getApiAllSecurityEvents(tenant, namespace, false, secondsback),
            getApiNSDetails(tenant, namespace, false)
        ]).then(([inventory, stats, secevents, nsdetails]) => {
            const lbConfig = inventory.inventory[tenant]?.[namespace]?.http_loadbalancers?.[lbname]?.config ?? {};
            const lbStats = stats[tenant]?.[namespace]?.[lbname] ?? {};
            const lbSecurity = secevents[tenant]?.[namespace]?.[lbname] ?? {};
            const lbDetails = nsdetails[tenant]?.[namespace]?.[lbname] ?? {};

            console.log('LB Stats:', lbStats);

            // Classes based on conditions
            const detailsData = {
                name: lbname,
                httpsClass: lbConfig.http === false ? 'bg-success' : 'bg-secondary',
                httpClass: lbConfig.http ? 'bg-success' : 'bg-secondary',
                autoCertClass: lbConfig.certification_status === 'DnsDomainVerification' ? 'bg-success' : 'bg-secondary',
                routesClass: lbConfig.routes ? 'bg-success' : 'bg-secondary',
                subsetRoutingClass: lbConfig.origin_server_subset ? 'bg-success' : 'bg-secondary',
                corsPolicyClass: lbConfig.cors_policy ? 'bg-success' : 'bg-secondary',
                dataGuardClass: lbConfig.data_guard ? 'bg-success' : 'bg-secondary',
                wafClass: lbConfig.waf ? 'bg-success' : 'bg-secondary',
                botDefenseClass: lbConfig.bot_protection ? 'bg-success' : 'bg-secondary',
                ipReputationClass: lbConfig.ip_reputation ? 'bg-success' : 'bg-secondary',
                clientSideDefenseClass: lbConfig.client_side_defense ? 'bg-success' : 'bg-secondary',
                nsServicePolicyClass: lbConfig.namespace_service_policy ? 'bg-success' : 'bg-secondary',
                lbServicePolicyClass: lbConfig.service_policy ? 'bg-success' : 'bg-secondary',
                cookieProtectionClass: lbConfig.cookie_protection ? 'bg-success' : 'bg-secondary',
                apiDiscoveryClass: lbConfig.api_discovery ? 'bg-success' : 'bg-secondary',
                apiDefinitionClass: lbConfig.api_definition ? 'bg-success' : 'bg-secondary',
                apiValidationClass: lbConfig.api_schema_validation ? 'bg-success' : 'bg-secondary',
                apiProtectionClass: lbConfig.api_protection ? 'bg-success' : 'bg-secondary',
                maliciousUserDetectionClass: lbConfig.malicious_user_detection ? 'bg-success' : 'bg-secondary',
                maliciousUserMitigationClass: lbConfig.malicious_user_mitigation ? 'bg-success' : 'bg-secondary',
                //Network
                errorRate: lbStats.HTTP_ERROR_RATE ? parseFloat(lbStats.HTTP_ERROR_RATE).toFixed(2) + '%' : '-',
                txTransfer: formatDataTransfer(lbStats.RESPONSE_DATA_TRANSFERRED),
                rxTransfer: formatDataTransfer(lbStats.REQUEST_DATA_TRANSFERRED),
                vip: lbConfig.vip_type || 'N/A',
                //Security
                totalEvents: formatGenericNumber(lbSecurity.total_events) || 0,
                wafEvents: formatGenericNumber(lbSecurity.waf_sec_event) || 0,
                botEvents: formatGenericNumber(lbSecurity.bot_defense_sec_event) || 0,
                spEvents: formatGenericNumber(lbSecurity.svc_policy_sec_event) || 0,
                apiEvents: formatGenericNumber(lbSecurity.api_sec_event) || 0,
                //Other
                lbCreation: convertDateTime(lbDetails.creationTimestamp) || 'N/A',
                lbLastModified: convertDateTime(lbDetails.modificationTimestamp) || 'N/A',
                certState: lbDetails.certState || 'N/A',
                certExpiry: convertDateTime(lbDetails.certExpiration[0]) || 'N/A',
                allDomains: lbConfig.domains.join(', ') || 'N/A',
                //Latency
                clientLatency: formatLatency(lbStats.CLIENT_RTT) || '- ms',
                serverLatency: formatLatency(lbStats.SERVER_RTT) || '- ms',
                appLatency: formatLatency(lbStats.HTTP_APP_LATENCY) || '- ms',
                clientArrowSrc: formatLatencyArrowSrc(lbStats.CLIENT_RTT),
                serverArrowSrc: formatLatencyArrowSrc(lbStats.SERVER_RTT),
                appArrowSrc: formatLatencyArrowSrc(lbStats.APP_RTT)
                // appArrowSrc:

            };

            console.log("Configuration Data:", detailsData);

            return getTemplate('overview_rowdetails', false).then(template => {
                const renderedHtml = Mustache.render(template, { ...detailsData, secevents, nsdetails });
                document.getElementById(`details-${lbname}`).innerHTML = renderedHtml;
                console.log('Details template rendered successfully for:', lbname);
            });
        }).catch(error => {
            console.error('Error processing details for:', lbname, error);
        });
    }).catch(error => {
        console.error("Failed to fetch inventory:", error);
    });
}

function formatLatencyArrowSrc(clientRtt) {
    if (clientRtt === undefined || clientRtt === null) {
        return '/images/dbl_arrow_black.png';  // Return black arrow if RTT is unknown
    }

    const rtt = parseFloat(clientRtt);  // Ensure the RTT is treated as a number

    if (isNaN(rtt)) {
        return '/images/dbl_arrow_black.png';  // Return black arrow if RTT is not a number
    }

    if (rtt < 0.200) {
        return '/images/dbl_arrow_green.png';  // Green arrow for RTT less than 0.200
    } else if (rtt < 0.400) {
        return '/images/dbl_arrow_orange.png';  // Orange arrow for RTT between 0.200 and 0.400
    } else {
        return '/images/dbl_arrow_red.png';  // Red arrow for RTT greater than 0.400
    }
}


// Event listener setup for Overview row details
$(document).ready(function () {
    $(document).on('show.bs.collapse', '.details-collapse-trigger', function () {
        const tenant = $(this).data('tenant');
        const namespace = $(this).data('namespace');
        const lbname = $(this).data('lbname');
        const secondsback = document.getElementById('overviewSecondsBack').value || '86400'; // Default to last 24 hours if no value selected

        populateOverviewRowDetails(tenant, namespace, lbname, secondsback);
    });
});




function populateLogExport() {

    document.getElementById('inventory-loading').style.display = 'block';
    document.getElementById('inventory-loaded').style.display = 'none';

    updateTenantSelect('logexport-tenant', 'logexport-namespace', 'logexport-loadbalancer', 'downloadLogs', '', () => {
        // After updating the tenant select, show the loaded element and hide the loading
        document.getElementById('inventory-loaded').style.display = 'block';
        document.getElementById('inventory-loading').style.display = 'none';
    });
}


$(document).on('click', '#downloadLogs', function () {
    downloadLogs();
});


function downloadLogs() {
    const tenant = document.getElementById('logexport-tenant').value;
    const namespace = document.getElementById('logexport-namespace').value;
    const lbname = document.getElementById('logexport-loadbalancer').value;
    const secondsback = document.getElementById('logSecondsBack').value;
    const maxlogs = document.getElementById('logMax').value;
    const logtype = document.getElementById('logType').value;
    const filetype = 'json';  // Hardcoded as we are dealing with JSON only now

    // Validate required fields
    if (!tenant || !namespace || !lbname || !secondsback || !maxlogs || !logtype) {
        alert('All fields are required.');
        return;
    }

    // Collect filters
    let additionalfilters = [];
    const src_ip = document.getElementById('src_ip').value.trim();
    const req_path = document.getElementById('req_path').value.trim();
    const req_id = document.getElementById('req_id').value.trim();

    if (src_ip) {
        additionalfilters.push({ key: "src_ip", op: "=", value: src_ip });
    }
    if (req_path) {
        additionalfilters.push({ key: "req_path", op: "=", value: req_path });
    }

    if (req_id) {
        additionalfilters.push({ key: "req_id", op: "=", value: req_id });
    }

    // Response codes

    if (logtype === 'access') {
        const rspCodes = ['1xx', '2xx', '3xx', '4xx', '5xx'].filter(code => document.getElementById(`rsp_code_${code}`).checked).join('|');
        if (!rspCodes) {
            alert('At least one response code must be selected.');
            return;
        }
        additionalfilters.push({ key: "rsp_code_class", op: "=~", value: rspCodes })

    }

    ;

    // Prepare the request data
    const requestData = {
        tenant,
        namespace,
        lbname,
        secondsback,
        logtype,
        additionalfilters: JSON.stringify(additionalfilters),
        maxlogs
    };

    console.log("Sending request data:", JSON.stringify(requestData));

    // Fetch logs from the server
    fetch('/api/v1/getLogs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error('Failed to fetch logs: ' + data.message);
            }
            //console.log("Logs received (check format):", JSON.stringify(data.logs));
            const blob = new Blob([JSON.stringify(data.logs)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tenant}_${namespace}_${lbname}_${logtype}_${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Error downloading the logs:', error);
            alert('Failed to download logs: ' + error.message);
        });
}






$(document).on('click', '#downloadAPIEndpoints', function () {
    downloadApiEndpoints();
});


// API Endpoints //



function populateApiEndpoints() {

    document.getElementById('inventory-loading').style.display = 'block';
    document.getElementById('inventory-loaded').style.display = 'none';

    updateTenantSelect('apiendpoint-tenant', 'apiendpoint-namespace', 'apiendpoint-loadbalancer', 'downloadAPIEndpoints', 'api_discovery', () => {
        // After updating the tenant select, show the loaded element and hide the loading
        document.getElementById('inventory-loaded').style.display = 'block';
        document.getElementById('inventory-loading').style.display = 'none';
    });
}

// Update tenant select dropdown
function updateTenantSelect(tenantSelectId, namespaceSelectId, lbSelectId, buttonId, filterType = null, callback) {
    const tenantSelect = document.getElementById(tenantSelectId);
    document.getElementById(buttonId).disabled = true;
    getApiInventory(false, true).then(inventory => {
        const tenantOptions = ['<option value="" selected>-- Select Tenant --</option>'];
        Object.keys(inventory.inventory).forEach(tenant => {
            tenantOptions.push(`<option value="${tenant}">${tenant}</option>`);
        });
        tenantSelect.innerHTML = tenantOptions.join('');

        tenantSelect.onchange = () => updateNamespaceSelect(tenantSelectId, namespaceSelectId, lbSelectId, buttonId, filterType);

        if (callback) callback(); // Call the callback function when done

    }).catch(error => {
        console.error("Failed to fetch tenants:", error);
    });
}

// Update namespace select dropdown
function updateNamespaceSelect(tenantSelectId, namespaceSelectId, lbSelectId, buttonId, filterType = null) {
    const tenantSelect = document.getElementById(tenantSelectId);
    const namespaceSelect = document.getElementById(namespaceSelectId);
    const selectedTenant = tenantSelect.value;
    document.getElementById(buttonId).disabled = true;
    if (selectedTenant) {
        getApiInventory(false, true).then(inventory => {
            const namespaces = inventory.inventory[selectedTenant] || {};
            const namespaceOptions = ['<option value="" selected>-- Select Namespace --</option>'];
            Object.keys(namespaces).forEach(namespace => {
                namespaceOptions.push(`<option value="${namespace}">${namespace}</option>`);
            });
            namespaceSelect.innerHTML = namespaceOptions.join('');

            namespaceSelect.onchange = () => updateLBSelect(tenantSelectId, namespaceSelectId, lbSelectId, buttonId, filterType);
        }).catch(error => {
            console.error("Failed to fetch namespaces:", error);
        });
    } else {
        namespaceSelect.innerHTML = '<option value="" selected>-- Select Namespace --</option>';
    }
}

// Update load balancer select dropdown
function updateLBSelect(tenantSelectId, namespaceSelectId, lbSelectId, buttonId, filterType = null) {
    const tenantSelect = document.getElementById(tenantSelectId);
    const namespaceSelect = document.getElementById(namespaceSelectId);
    const lbSelect = document.getElementById(lbSelectId);
    const button = document.getElementById(buttonId);
    button.disabled = true; // Disable button initially

    const selectedTenant = tenantSelect.value;
    const selectedNamespace = namespaceSelect.value;

    if (selectedTenant && selectedNamespace) {
        getApiInventory(false, true).then(inventory => {
            const lbs = (inventory.inventory[selectedTenant][selectedNamespace] || {}).http_loadbalancers || {};
            const lbOptions = ['<option value="" selected>-- Select Load Balancer --</option>'];

            Object.keys(lbs).forEach(lbName => {
                const lb = lbs[lbName];
                const wafEnabled = lb.config.waf;
                const hasWriteApiKey = hasWriteAccess(selectedTenant, selectedNamespace);

                switch (filterType) {
                    case 'waf':
                        if (wafEnabled) {
                            lbOptions.push(`<option value="${lbName}">${lbName}</option>`);
                        }
                        break;
                    case 'waf_write':
                        if (wafEnabled && hasWriteApiKey) {
                            lbOptions.push(`<option value="${lbName}">${lbName}</option>`);
                        }
                        break;
                    case 'api_discovery':
                        if (lb.config.api_discovery) {
                            lbOptions.push(`<option value="${lbName}">${lbName}</option>`);
                        }
                        break;
                    default:
                        lbOptions.push(`<option value="${lbName}">${lbName}</option>`);
                        break;
                }
            });

            lbSelect.innerHTML = lbOptions.join('');
            button.disabled = false; // Re-enable button after updating options
        }).catch(error => {
            console.error("Failed to fetch load balancers:", error);
            button.disabled = false; // Ensure button is enabled even on error
        });
    } else {
        lbSelect.innerHTML = '<option value="" selected>-- Select Load Balancer --</option>';
    }
}

// Helper function to check if there is a write API key for a tenant and namespace
function hasWriteAccess(tenant, namespace) {
    const apiKeys = JSON.parse(decodeURIComponent(getCookie('apiKeys')) || '[]');
    // First try to find an API key that matches both tenant and namespace
    const specificKey = apiKeys.find(apiKey =>
        apiKey['tenant-name'] === tenant &&
        apiKey['namespace-name'] === namespace &&
        apiKey['apikey-type'] === 'write'
    );

    // If no specific key found, check for a tenant-level key where namespace might not matter
    if (!specificKey) {
        const tenantLevelKey = apiKeys.find(apiKey =>
            apiKey['tenant-name'] === tenant &&
            (apiKey['namespace-name'] === '' || apiKey['namespace-type'] === 'all') &&
            apiKey['apikey-type'] === 'write'
        );
        return Boolean(tenantLevelKey);
    }

    return Boolean(specificKey);
}




function enableButtonBasedOnSelection(selectId, buttonId) {
    const selectElement = document.getElementById(selectId);
    const buttonElement = document.getElementById(buttonId);

    selectElement.addEventListener('change', function () {
        // Check if the selected option's value is not blank
        if (this.value !== "") {
            buttonElement.disabled = false; // Enable the button
        } else {
            buttonElement.disabled = true; // Disable the button
        }
    });

    // Initial check in case there's already a selected option when the page loads
    buttonElement.disabled = selectElement.value === "";
}

function downloadApiEndpoints() {
    const tenant = document.getElementById('apiendpoint-tenant').value;
    const namespace = document.getElementById('apiendpoint-namespace').value;
    const lbname = document.getElementById('apiendpoint-loadbalancer').value;
    const secondsback = document.getElementById('apiSecondsBack').value;

    if (!tenant || !namespace || !lbname || !secondsback) {
        alert('All fields are required.');
        return;
    }

    const requestData = {
        tenant,
        namespace,
        lbname,
        secondsback
    };

    fetch('/api/v1/getApiDiscEndpoints', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())  // First, parse the JSON from the response
        .then(data => {
            if (!data.success) {
                throw new Error('Failed to fetch API endpoints: ' + data.message);
            }
            const apiendpoints = data.apiendpoints;
            // Assuming `apiendpoints` is already in CSV format
            const blob = new Blob([apiendpoints], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tenant}_${namespace}_${lbname}_apiEndpoints.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error('Error downloading the API Endpoints:', error);
            alert('Failed to download API endpoints: ' + error.message);
        });
}



$(document).on('click', '#downloadAPIEndpoints', function () {
    downloadApiEndpoints();
});



// Path Latency

function populatePathLatency() {

    document.getElementById('inventory-loading').style.display = 'block';
    document.getElementById('inventory-loaded').style.display = 'none';

    updateTenantSelect('pathlatency-tenant', 'pathlatency-namespace', 'pathlatency-loadbalancer', 'pathlatencySubmit', '', () => {
        // After updating the tenant select, show the loaded element and hide the loading
        document.getElementById('inventory-loaded').style.display = 'block';
        document.getElementById('inventory-loading').style.display = 'none';
    });
}

$(document).on('click', '#pathlatencySubmit', function () {
    populateLatencyLogsRequest();
});

// function populateLatencyLogsRequest(forcerefresh = false) {
//     const tenant = document.getElementById('pathlatency-tenant').value;
//     const namespace = document.getElementById('pathlatency-namespace').value;
//     const lbname = document.getElementById('pathlatency-loadbalancer').value;
//     const secondsback = document.getElementById('pathlatency-secondsback').value;
//     const maxlogs = document.getElementById('pathlatency-maxlogs').value;
//     const topx = document.getElementById('pathlatency-topx').value;

//     if (!tenant || !namespace || !lbname || !secondsback || !maxlogs || !topx) {
//         alert('All fields are required.');
//         return;
//     }

//     const cacheKey = `latencyLogs_${tenant}_${namespace}_${lbname}_${secondsback}_${maxlogs}_${topx}`;
//     const maxAgeInSeconds = 60 * 60; // Cache for 60 minutes

//     // Check cache first if not force refresh
//     if (!forcerefresh) {
//         const cachedLogs = cacheGetData(cacheKey, maxAgeInSeconds);
//         if (cachedLogs !== null) {
//             console.log("Using cached data for latency logs");
//             //document.getElementById('pathlatency-results').innerHTML = `<pre>${JSON.stringify(cachedLogs, null, 2)}</pre>`;
//             $('#pathlatency-results').append('<pre>' + JSON.stringify(cachedLogs, null, 2) + '</pre>');
//             return;
//         }
//     }

//     const requestData = {
//         tenant,
//         namespace,
//         lbname,
//         secondsback: parseInt(secondsback),
//         maxlogs: parseInt(maxlogs),
//         topx: parseInt(topx)
//     };

//     console.log("Sending request data:", JSON.stringify(requestData));

//     fetch('/api/v1/getLatencyLogs', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(requestData)
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (!data.success) {
//                 throw new Error('Failed to fetch latency logs: ' + data.message);
//             }
//             console.log("Latency logs received:", data.logs);
//             cacheSetData(cacheKey, data.logs); // Cache the new data
//             //document.getElementById('pathlatency-results').innerHTML = `<pre>${JSON.stringify(data.logs, null, 2)}</pre>`;
//             $('#pathlatency-results').append('<pre>' + JSON.stringify(data.logs, null, 2) + '</pre>');
//         })
//         .catch(error => {
//             console.error('Error fetching latency logs:', error);
//             alert('Failed to fetch latency logs: ' + error.message);
//         });
// }



async function populateLatencyLogsRequest(forcerefresh = false) {
    const tenant = document.getElementById('pathlatency-tenant').value;
    const namespace = document.getElementById('pathlatency-namespace').value;
    const lbname = document.getElementById('pathlatency-loadbalancer').value;
    const secondsback = document.getElementById('pathlatency-secondsback').value;
    const maxlogs = document.getElementById('pathlatency-maxlogs').value;
    const topx = document.getElementById('pathlatency-topx').value;

    if (!tenant || !namespace || !lbname || !secondsback || !maxlogs || !topx) {
        alert('All fields are required.');
        return;
    }

    const requestData = {
        tenant,
        namespace,
        lbname,
        secondsback: parseInt(secondsback),
        maxlogs: parseInt(maxlogs),
        topx: parseInt(topx)
    };

    const cacheKey = `latencyLogs_${tenant}_${namespace}_${lbname}_${secondsback}_${maxlogs}_${topx}`;
    const maxAgeInSeconds = 60 * 60; // Cache for 60 minutes

    let logsData = cacheGetData(cacheKey, maxAgeInSeconds);
    if (!forcerefresh && logsData) {
        console.log("Using cached data for latency logs");
    } else {
        try {
            const response = await fetch('/api/v1/getLatencyLogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (!data.success) throw new Error('Failed to fetch latency logs: ' + data.message);

            logsData = data.logs;
            cacheSetData(cacheKey, logsData); // Cache the new data
        } catch (error) {
            console.error('Error fetching latency logs:', error);
            alert('Failed to fetch latency logs: ' + error.message);
            return;
        }
    }

    // Format data and render template
    const formattedLogs = logsData.map(log => ({
        req_path: log.req_path,
        transactions: formatGenericNumber(log.transactions),
        avgRspSize: formatGenericNumber(log.avgRspSize),
        totalRspSize: formatGenericNumber(log.totalRspSize),
        avgRttDownstream: formatLatency(log.avgRttDownstream),
        avgRttUpstream: formatLatency(log.avgRttUpstream),
        avgOriginLatency: formatLatency(log.avgOriginLatency),
        avgLastDownstreamTxByte: formatLatency(log.avgLastDownstreamTxByte),
        avgDurationWithDataTxDelay: formatLatency(log.avgDurationWithDataTxDelay)
    }));

    try {
        const template = await getTemplate('pathlatency_row', false);
        const renderedHTML = Mustache.render(template, { loadBalancers: formattedLogs });
        document.getElementById('pathlatency-table-body').innerHTML = renderedHTML;
        // $('#pathlatency-results').append('<pre>' + JSON.stringify(logsData, null, 2) + '</pre>');
    } catch (error) {
        console.error('Failed to load template or render HTML:', error);
        alert('Failed to process template: ' + error.message);
    }
}





// Copy WAF Exclusions

function populateWafExclusion() {

    document.getElementById('inventory-loading').style.display = 'block';
    document.getElementById('inventory-loaded').style.display = 'none';
    // Source only needs LBs with WAF enabled
    updateTenantSelect('wafexclusion-src-tenant', 'wafexclusion-src-namespace', 'wafexclusion-src-loadbalancer', 'copywafexclusions', 'waf', () => {
        // After updating the tenant select, show the loaded element and hide the loading
        document.getElementById('inventory-loaded').style.display = 'block';
        document.getElementById('inventory-loading').style.display = 'none';
    });
    // Destination  needs LBs with WAF enabled + Write APIKEY
    updateTenantSelect('wafexclusion-dst-tenant', 'wafexclusion-dst-namespace', 'wafexclusion-dst-loadbalancer', 'copywafexclusions', 'waf_write', () => {
        // After updating the tenant select, show the loaded element and hide the loading
        document.getElementById('inventory-loaded').style.display = 'block';
        document.getElementById('inventory-loading').style.display = 'none';
    });
}

$(document).on('click', '#copywafexclusions', function () {
    execCopyWafExclusions();
});

function execCopyWafExclusions() {
    const srcTenant = document.getElementById('wafexclusion-src-tenant').value;
    const srcNamespace = document.getElementById('wafexclusion-src-namespace').value;
    const srcLoadBalancer = document.getElementById('wafexclusion-src-loadbalancer').value;
    const dstTenant = document.getElementById('wafexclusion-dst-tenant').value;
    const dstNamespace = document.getElementById('wafexclusion-dst-namespace').value;
    const dstLoadBalancer = document.getElementById('wafexclusion-dst-loadbalancer').value;
    const wafExclusionAgree = document.getElementById('wafexclusionAgree').checked;
    const resultsDiv = document.getElementById('wafexclusion-results');

    // Helper function to format timestamp
    const formatTimestamp = () => {
        const now = new Date();
        return now.toLocaleString();
    };

    // Check if all fields are filled and the checkbox is checked
    if (!srcTenant || !srcNamespace || !srcLoadBalancer || !dstTenant || !dstNamespace || !dstLoadBalancer || !wafExclusionAgree) {
        alert("Please fill in all fields and agree to the terms.");
        return;
    }

    // Prepare the request data
    const requestData = {
        sourceTenant: srcTenant,
        sourceNamespace: srcNamespace,
        sourceLbName: srcLoadBalancer,
        destinationTenant: dstTenant,
        destinationNamespace: dstNamespace,
        destinationLbName: dstLoadBalancer
    };

    // Make the API call
    fetch('/api/v1/execCopyWafExclusion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to execute copy operation.');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log("Copy successful:", data);
                resultsDiv.innerHTML += `<p>${formatTimestamp()} - Success - WAF exclusions copied successfully! SRC: ${srcTenant} - ${srcNamespace} - ${srcLoadBalancer} DST: ${dstTenant} - ${dstNamespace} - ${dstLoadBalancer}</p>`;

            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error("Error copying WAF exclusions:", error);
            resultsDiv.innerHTML += `<p>${formatTimestamp()} - Failure - ${error.message}</p>`;
        });
}


// Edit Sets


$(document).on('click', '#getSetsConfig', function () {
    getConfigOnClick();
});

$(document).on('click', '#cancelEditSets', function () {
    editsetsCancel();
});

$(document).on('click', '#submitEditSets', function () {
    editsetsSubmit();
    //sendConfigUpdate();
});

function populateEditSets() {

    document.getElementById('inventory-loading').style.display = 'block';
    document.getElementById('inventory-loaded').style.display = 'none';
    // Source only needs LBs with WAF enabled
    updateSetsTenantSelect('editsets-tenant', 'editsets-namespace', 'getSetsConfig', () => {
        // After updating the tenant select, show the loaded element and hide the loading
        document.getElementById('inventory-loaded').style.display = 'block';
        document.getElementById('inventory-loading').style.display = 'none';
    });

}

// Update tenant select dropdown
function updateSetsTenantSelect(tenantSelectId, namespaceSelectId, buttonId, callback) {
    const tenantSelect = document.getElementById(tenantSelectId);
    document.getElementById(buttonId).disabled = true;


    getApiInventory(false, true).then(inventory => {
        const tenantOptions = ['<option value="" selected>-- Select Tenant --</option>'];
        Object.keys(inventory.inventory).forEach(tenant => {
            tenantOptions.push(`<option value="${tenant}">${tenant}</option>`);
        });
        tenantSelect.innerHTML = tenantOptions.join('');

        tenantSelect.onchange = () => updateSetsNamespaceSelect(tenantSelectId, namespaceSelectId, buttonId);

        if (callback) callback(); // Call the callback function when done

    }).catch(error => {
        console.error("Failed to fetch tenants:", error);
    });
}

// Update namespace select dropdown
function updateSetsNamespaceSelect(tenantSelectId, namespaceSelectId, buttonId) {
    const tenantSelect = document.getElementById(tenantSelectId);
    const namespaceSelect = document.getElementById(namespaceSelectId);
    const setTypeSelect = document.getElementById('editsets-setstype');
    const selectedTenant = tenantSelect.value;
    document.getElementById(buttonId).disabled = true;
    if (selectedTenant) {
        getApiInventory(false, true).then(inventory => {
            const namespaces = inventory.inventory[selectedTenant] || {};
            const namespaceOptions = ['<option value="" selected>-- Select Namespace --</option> <option value="shared" >shared</option>'];
            Object.keys(namespaces).forEach(namespace => {
                namespaceOptions.push(`<option value="${namespace}">${namespace}</option>`);
            });
            namespaceSelect.innerHTML = namespaceOptions.join('');

            namespaceSelect.onchange = () => updateSetsSelectionList(tenantSelectId, namespaceSelectId, 'editsets-setstype', buttonId);
            setTypeSelect.onchange = () => updateSetsSelectionList(tenantSelectId, namespaceSelectId, 'editsets-setstype', buttonId);

        }).catch(error => {
            console.error("Failed to fetch namespaces:", error);
        });
    } else {
        namespaceSelect.innerHTML = '<option value="" selected>-- Select Namespace --</option>';
    }
}

async function updateSetsSelectionList(tenantSelectId, namespaceSelectId, setTypeSelectId, buttonId) {
    const tenantSelect = document.getElementById(tenantSelectId);
    const namespaceSelect = document.getElementById(namespaceSelectId);
    const setTypeSelect = document.getElementById(setTypeSelectId);
    const button = document.getElementById(buttonId);

    setTypeSelect.disabled = false;
    // Check if any of the required fields are empty
    // if (!tenantSelect.value || !namespaceSelect.value || !setTypeSelect.value) {
    //     alert('Please fill out all fields');
    //     return;
    // }

    try {
        const sets = await getSetsList(tenantSelect.value, namespaceSelect.value);

        console.log('Sets:', sets);

        const setType = setTypeSelect.value; // Could be 'ip_prefix_sets' or 'bgp_asn_sets'

        console.log('Sets Type:', setType);

        if (!sets || !setType) {
            return;
        }

        const setOptions = sets.sets[setType];

        // Populate the select element for object names
        const objNameSelect = document.getElementById('editsets-objname');
        // Start with the default option
        let optionsHTML = '<option value="" selected>-- Select Object --</option>';
        optionsHTML += setOptions.map(option => `<option value="${option.name}">${option.name}</option>`).join('');
        objNameSelect.innerHTML = optionsHTML;

        // Attach onchange event to the objName select element
        objNameSelect.onchange = () => updateSetsObjSelect(tenantSelectId, namespaceSelectId, buttonId);

        // Initially disable the button until an object is selected
        button.disabled = true;
    } catch (error) {
        console.error('Failed to fetch sets:', error);
        alert('Failed to load data: ' + error.message);
    }
}

function updateSetsObjSelect(tenantSelectId, namespaceSelectId, buttonId) {
    const objNameSelect = document.getElementById('editsets-objname');
    const button = document.getElementById(buttonId);

    // Enable or disable the button based on the objName select value
    if (objNameSelect.value) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}


/**
 * Asynchronously fetches sets list for a given tenant and namespace.
 *
 * @param {string} tenantname - The name of the tenant.
 * @param {string} namespacename - The name of the namespace.
 * @return {Promise<Object>} A promise that resolves to the JSON response containing the sets list.
 * @throws {Error} Throws an error if the response was not successful.
 * 
 */
// Return example
// sets is returned out of this function
// {
//     "success": true,
//     "sets": {
//       "ip_prefix_sets": [
//         {
//           "name": "ip-list",
//           "description": "",
//           "namespace": "namespace123",
//           "tenant": "tenant1"
//         }
//       ],
//       "bgp_asn_sets": [
//         {
//           "name": "test-asn",
//           "description": "",
//           "namespace": "namespace123",
//           "tenant": "tenant1"
//         }
//       ]
//     }
//   }

async function getSetsList(tenantname, namespacename) {
    // Construct a unique cache key using tenant and namespace
    const cacheKey = `sets_${tenantname}_${namespacename}`;

    // Try to get data from the cache
    let cachedData = cacheGetData(cacheKey);
    if (cachedData) {
        console.log("Using cached data for:", cacheKey);
        return cachedData;
    }

    // Prepare the request payload
    const requestData = {
        tenant: tenantname,
        namespace: namespacename
    };

    if (!requestData.tenant || !requestData.namespace) {
        return;
        throw new Error('Tenant and namespace are required.');
    }

    try {
        // Make the POST request to the /api/v1/getSets endpoint
        const response = await fetch('/api/v1/getSetsList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        // Parse the response JSON
        const data = await response.json();

        // Check if the response was successful
        if (data.success) {
            // Cache the fetched data
            cacheSetData(cacheKey, data);
            return data;
        } else {
            throw new Error(data.message || 'Failed to fetch sets.');
        }
    } catch (error) {
        console.error('Error fetching sets:', error);
        throw error;
    }
}


// Function to handle "Get Configuration" click event
function getConfigOnClick() {
    const tenantSelect = document.getElementById('editsets-tenant');
    const namespaceSelect = document.getElementById('editsets-namespace');
    const setTypeSelect = document.getElementById('editsets-setstype');
    const objNameSelect = document.getElementById('editsets-objname');
    const getButton = document.getElementById('getSetsConfig');
    const resultsDiv = document.getElementById('editsets-configuration');
    const originalConfigTextarea = document.getElementById('editsets-configuration-original');
    const changeConfigTextarea = document.getElementById('editsets-configuration-change');
    const timerDisplay = document.getElementById('editsets-configuration-timeremaining');

    // Check if any of the required fields are empty
    if (!tenantSelect.value || !namespaceSelect.value || !setTypeSelect.value || !objNameSelect.value) {
        alert('Please fill out all fields.');
        return;
    }

    // Disable form elements
    [tenantSelect, namespaceSelect, setTypeSelect, objNameSelect, getButton].forEach(elem => elem.disabled = true);

    // Fetch configuration
    fetch('/api/v1/getConfig', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tenant: tenantSelect.value,
            namespace: namespaceSelect.value,
            type: setTypeSelect.value,
            objname: objNameSelect.value
        })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message);
            }
            // Display configuration
            originalConfigTextarea.value = JSON.stringify(data.config, null, 2);

            // Conditionally format data for editing
            let formattedData = '';
            if (setTypeSelect.value === 'ip_prefix_sets') {
                formattedData = data.config.spec.prefix.join('\n');
            } else if (setTypeSelect.value === 'bgp_asn_sets') {
                formattedData = data.config.spec.as_numbers.join('\n');
            }
            changeConfigTextarea.value = formattedData;

            resultsDiv.style.display = 'block'; // Show the configuration div
            getButton.disabled = true; // Disable the "Get Configuration" button

            // Start the 5-minute countdown
            startCountdown(2 * 60, timerDisplay, () => {
                // Cancel operation after countdown
                editsetsCancel()
            });
        })
        .catch(error => {
            alert('Failed to fetch configuration: ' + error.message);
            [tenantSelect, namespaceSelect, setTypeSelect, objNameSelect, getButton].forEach(elem => elem.disabled = false);
        });
}

function sendConfigUpdate() {
    const tenant = document.getElementById('editsets-tenant').value;
    const namespace = document.getElementById('editsets-namespace').value;
    const type = document.getElementById('editsets-setstype').value;
    const objname = document.getElementById('editsets-objname').value;
    const originalConfigTextarea = document.getElementById('editsets-configuration-original').value
    const newData = {}; // Ensure this is collected and structured properly

    console.log('tenant:', tenant, 'namespace:', namespace, 'type:', type, 'objname:', objname, 'newData:', newData, 'originalConfigTextarea:', originalConfigTextarea);

    fetch('/api/v1/putConfig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant, namespace, type, objname, originalConfigTextarea })
    })
        .then(response => response.json())
        .then(data => console.log('API Response:', data))
        .catch(error => console.error('Error in API call:', error));
}


async function editsetsSubmit() {
    const tenantSelect = document.getElementById('editsets-tenant');
    const namespaceSelect = document.getElementById('editsets-namespace');
    const setTypeSelect = document.getElementById('editsets-setstype');
    const objNameSelect = document.getElementById('editsets-objname');
    const getButton = document.getElementById('getSetsConfig');
    const resultsDiv = document.getElementById('editsets-results');
    const originalConfigTextarea = document.getElementById('editsets-configuration-original');
    const changeConfigTextarea = document.getElementById('editsets-configuration-change');

    if (!tenantSelect.value || !namespaceSelect.value || !setTypeSelect.value || !objNameSelect.value || !changeConfigTextarea.value.trim()) {
        alert('All fields are required and cannot be blank.');
        return;
    }

    tenantSelect.disabled = true;
    namespaceSelect.disabled = true;
    setTypeSelect.disabled = true;
    objNameSelect.disabled = true;
    getButton.disabled = true;

    try {
        let newConfigData = changeConfigTextarea.value.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => line.replace(/['",]/g, ''));

        newConfigData = [...new Set(newConfigData)]; // Remove duplicates
        const updatedConfig = JSON.parse(originalConfigTextarea.value);

        if (setTypeSelect.value === 'ip_prefix_sets') {
            newConfigData = newConfigData.filter(line => isValidCIDR(line));
            updatedConfig.spec.prefix = newConfigData; // Use cleaned CIDR lines
        } else if (setTypeSelect.value === 'bgp_asn_sets') {
            newConfigData = newConfigData.filter(num => isValidASN(num)).map(Number);
            updatedConfig.spec.as_numbers = newConfigData; // Use cleaned AS numbers
        }

        console.log('Sending update:', tenantSelect.value, namespaceSelect.value, setTypeSelect.value, objNameSelect.value, updatedConfig);

        const response = await fetch(`/api/v1/putConfig`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tenant: tenantSelect.value,
                namespace: namespaceSelect.value,
                type: setTypeSelect.value,
                objname: objNameSelect.value,
                newData: updatedConfig
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        alert('Configuration updated successfully!');
        resultsDiv.innerHTML += `<p>${new Date().toLocaleTimeString()} - Success - Configuration updated successfully! ${tenantSelect.value} - ${namespaceSelect.value} - ${setTypeSelect.value} - ${objNameSelect.value}</p>`;
        editsetsCancel();
    } catch (error) {
        alert(`Error updating configuration: ${error.message}`);
        resultsDiv.innerHTML += `<p>${new Date().toLocaleTimeString()} - Failure - ${error.message} - ${tenantSelect.value} - ${namespaceSelect.value} - ${setTypeSelect.value} - ${objNameSelect.value}</p>`;
        startCountdown();
    } finally {
        tenantSelect.disabled = false;
        namespaceSelect.disabled = false;
        setTypeSelect.disabled = false;
        objNameSelect.disabled = false;
        getButton.disabled = false;
    }
}

// Helper functions to validate CIDR and ASN
function isValidCIDR(cidr) {
    const regex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    return regex.test(cidr);
}

function isValidASN(asn) {
    const num = Number(asn);
    return num >= 1 && num <= 4294967296;
}



function editsetsCancel() {

    const timerDisplay = document.getElementById('editsets-configuration-timeremaining')

    // Clear the textarea contents
    document.getElementById('editsets-configuration-change').value = '';
    document.getElementById('editsets-configuration-original').value = '';

    // Hide the configuration div
    document.getElementById('editsets-configuration').style.display = 'none';

    // Enable the Get Configuration button
    document.getElementById('getSetsConfig').disabled = false;

    // Enable the select inputs
    document.getElementById('editsets-tenant').disabled = false;
    document.getElementById('editsets-namespace').disabled = false;
    document.getElementById('editsets-setstype').disabled = false;
    document.getElementById('editsets-objname').disabled = false;

    // Optionally, you could also reset the selected options to their default state
    // Reset select elements to default option or clear selections
    document.getElementById('editsets-tenant').selectedIndex = 0;
    document.getElementById('editsets-namespace').selectedIndex = 0;
    document.getElementById('editsets-setstype').selectedIndex = 0;
    document.getElementById('editsets-objname').selectedIndex = 0;

    stopTimer();
    timerDisplay.textContent = '';
}

// Backup

function populateBackup() {

    document.getElementById('inventory-loading').style.display = 'block';
    document.getElementById('inventory-loaded').style.display = 'none';
    // Source only needs LBs with WAF enabled
    updateBackupTenantSelect('backup-tenant', 'backup-namespace', 'downloadBackup', () => {
        // After updating the tenant select, show the loaded element and hide the loading
        document.getElementById('inventory-loaded').style.display = 'block';
        document.getElementById('inventory-loading').style.display = 'none';
    });

}

// Update tenant select dropdown
function updateBackupTenantSelect(tenantSelectId, namespaceSelectId, buttonId, callback) {
    const tenantSelect = document.getElementById(tenantSelectId);
    document.getElementById(buttonId).disabled = true;


    getApiInventory(false, true).then(inventory => {
        const tenantOptions = ['<option value="" selected>-- Select Tenant --</option>'];
        Object.keys(inventory.inventory).forEach(tenant => {
            tenantOptions.push(`<option value="${tenant}">${tenant}</option>`);
        });
        tenantSelect.innerHTML = tenantOptions.join('');

        tenantSelect.onchange = () => updateBackupNamespaceSelect(tenantSelectId, namespaceSelectId, buttonId);

        if (callback) callback(); // Call the callback function when done

    }).catch(error => {
        console.error("Failed to fetch tenants:", error);
    });
}

// Update namespace select dropdown
function updateBackupNamespaceSelect(tenantSelectId, namespaceSelectId, buttonId) {
    const tenantSelect = document.getElementById(tenantSelectId);
    const namespaceSelect = document.getElementById(namespaceSelectId);
    const setTypeSelect = document.getElementById('editsets-setstype');
    const selectedTenant = tenantSelect.value;
    document.getElementById(buttonId).disabled = true;
    if (selectedTenant) {
        getApiInventory(false, true).then(inventory => {
            const namespaces = inventory.inventory[selectedTenant] || {};
            const namespaceOptions = ['<option value="" selected>-- Select Namespace --'];
            Object.keys(namespaces).forEach(namespace => {
                namespaceOptions.push(`<option value="${namespace}">${namespace}</option>`);
            });
            namespaceSelect.innerHTML = namespaceOptions.join('');

            namespaceSelect.onchange = () => document.getElementById(buttonId).disabled = false;


        }).catch(error => {
            console.error("Failed to fetch namespaces:", error);
        });
    } else {
        namespaceSelect.innerHTML = '<option value="" selected>-- Select Namespace --</option>';
    }
}

$(document).on('click', '#downloadBackup', function () {
    downloadBackup();
});

function downloadBackup() {
    var tenant = document.getElementById('backup-tenant').value;
    var namespace = document.getElementById('backup-namespace').value;
    var backupShared = document.getElementById('backupshared').value;
    var backupSharedSuffix = backupShared === 'true' ? '_shared' : '';
    const resultsDiv = document.getElementById('backup-results');

    const formatTimestamp = () => {
        const now = new Date();
        return now.toLocaleString();
    };

    if (!tenant || !namespace) {
        alert('Please select both a tenant and a namespace.');
        return;
    }

    var postData = {
        tenant: tenant,
        namespace: namespace,
        backupShared: backupShared === 'true'
    };

    fetch('/api/v1/getBackup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            resultsDiv.innerHTML += `<p>${formatTimestamp()} - Success - Backup Executed for: ${tenant} - ${namespace} Shared Included: ${backupShared}</p>`;
            return response.blob();
        })
        .then(blob => {
            // Generate a filename based on tenant, namespace, shared status, and current UTC time
            const utcNow = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
            const filename = `${tenant}_${namespace}${backupSharedSuffix}_${utcNow}_backup.zip`;

            // Create a URL and trigger the download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error during fetch operation:', error);
            alert('Failed to download backup. Please try again.');
        });
}

// Test API Keys

$(document).on('click', '#testapikeySubmit', function () {
    populatetestApiKeys();
});

// Function to make a POST request to test the API key
async function testApiKey(apiKey, tenant) {
    try {
        const response = await fetch('/api/v1/testApikey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tenant: tenant,
                encryptedKey: apiKey
            })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Failed to test API key:', error);
        return false;
    }
}

async function populatetestApiKeys() {
    document.getElementById('testapikey-loading').style.display = 'block';
    document.getElementById('testapikey-loaded').style.display = 'none';

    const apiKeys = JSON.parse(decodeURIComponent(getCookie('apiKeys')) || '[]');
    for (const key of apiKeys) {
        if (key['apikey-state'] === 'disabled') {
            document.getElementById('testapikey-results').innerHTML += `<p>API Key for tenant ${key['tenant-name']} is disabled and was not tested.</p>`;
            continue;
        }
        const result = await testApiKey(key['apikey'], key['tenant-name']);
        document.getElementById('testapikey-results').innerHTML += `<p>API Key for tenant ${key['tenant-name']} tested: ${result ? 'Success' : 'Failed'}.</p>`;
    }
    document.getElementById('testapikey-loading').style.display = 'none';
    document.getElementById('testapikey-loaded').style.display = 'block';
}



// Refresh

$(document).on('click', '#refreshOverviewStats', function () {
    cacheClear('dataStats_');
    cacheClear('dataTenantUsers_');
    cacheClear('dataAllSecEvents_');
    cacheClear('dataNSDetails_');
    populateOverview();
});
$(document).on('click', '#refreshOverview', function () {
    cacheClear();
    populateOverview();
});
$(document).on('change', '#overviewSecondsBack', function () {
    populateOverview();
});

$(document).on('click', '#refreshPathLatency', function () {
    cacheClear('dataInventory');
    populatePathLatency();
});

$(document).on('click', '#refreshLogExport', function () {
    cacheClear('dataInventory');
    populateLogExport();
});

$(document).on('click', '#refreshAPIEndpoints', function () {
    cacheClear('dataInventory');
    populateApiEndpoints();
});

$(document).on('click', '#refreshwafexclusions', function () {
    cacheClear('dataInventory');
    populateWafExclusion();
});

$(document).on('click', '#refreshEditSets', function () {
    cacheClear('dataInventory');
    populateEditSets();
});

$(document).on('click', '#refreshBackup', function () {
    cacheClear('dataInventory');
    populateBackup();
});

/// Test functions

$(document).on('click', '#populateOverview', function () {
    populateOverview();
});



$(document).on('click', '#populatePathLatency', function () {
    // Clear previous results
    $('#pathlatency-results').empty();

    // Call the getApiInventory function with forcerefresh parameter
    getPathLatency(false)
        .then(latencydata => {
            // Handle the response
            //const data = inventory.inventory;
            $('#pathlatency-results').append('<pre>' + JSON.stringify(latencydata, null, 2) + '</pre>');
        })
        .catch(error => {
            // Handle the error
            $('#pathlatency-results').append('<p>Error: ' + error.message + '</p>');
        });
});

////// Test Console Buttons /////

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
    getApiInventory(false)
        .then(inventory => {
            // Handle the response
            $('#results').append('<pre>' + JSON.stringify(inventory.summary, null, 2) + '</pre>');
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
    getApiStats(dataInventory, false, ONE_DAY)
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
    getApiStats(false, ONE_DAY)
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

        const inventory = await getApiTotalSecurityEvents(dataInventory, false, ONE_DAY);
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

        const inventory = await getApiAllSecurityEvents('f5-amer-ent', 'demo-shop', false, ONE_WEEK);
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

        const nsdetails = await getApiNSDetails('f5-amer-ent', 'j-cianfarani', false);
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

        const users = await getApiTenantUsers('f5-amer-ent', 5, false);
        // Handle the response
        console.log('Tenant users:', users);
        $('#results').append('<pre>' + JSON.stringify(users, null, 2) + '</pre>');
    } catch (error) {
        // Handle the error
        $('#results').append('<p>Error: ' + error.message + '</p>');
    }
});

$(document).on('click', '#testButton8', async function () {
    // Clear previous results
    $('#results').empty();

    console.log('testButton7');
    // Call the getApiInventory function with forcerefresh parameter
    try {

        const sets = await getSetsList('f5-amer-ent', 'j-cianfarani');
        // Handle the response
        console.log('getSetsList users:', sets);
        $('#results').append('<pre>' + JSON.stringify(sets, null, 2) + '</pre>');
    } catch (error) {
        // Handle the error
        $('#results').append('<p>Error: ' + error.message + '</p>');
    }
});

$(document).on('click', '#testButton9', async function () {
    // Clear previous results
    $('#results').empty();

    console.log('testButton9');
    // Call the getApiInventory function with forcerefresh parameter
    try {
        const dataInventory = await getApiInventory(false);

        const age = await getTenantAge(dataInventory);
        // Handle the response
        console.log('Tenant Age:', age);
        $('#results').append('<pre>' + JSON.stringify(age, null, 2) + '</pre>');
    } catch (error) {
        // Handle the error
        $('#results').append('<p>Error: ' + error.message + '</p>');
    }
});