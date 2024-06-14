/// Deprecated - Moved to script.js

$(document).ready(function () {
    console.log('Document is ready');

    // Function to read cookie
    function getCookie(name) {

        let value = `; ${document.cookie}`;
        console.log(value);
        let parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Create a new observer
    // const observer = new MutationObserver((mutationsList, observer) => {
    //     // Check if any mutations involve adding nodes to the DOM
    //     for (let mutation of mutationsList) {
    //         if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
    //             // Look for the added nodes and perform necessary actions
    //             // For example, if the added nodes contain the elements we're looking for, trigger the script to populate them
    //             populateFormFromCookie();
    //             // Disconnect the observer once the elements are found
    //             observer.disconnect();
    //             break;
    //         }
    //     }
    // });

    // Start observing the document body for changes
    // observer.observe(document.body, { childList: true, subtree: true });
    //This MutationObserver will listen for changes to the document body and trigger the populateFormFromCookie() function once it detects new nodes being added. This can help ensure that the script runs after the elements are dynamically loaded into the DOM.


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

    //  $('#edit-existing-keys').on('click', testfunc);

    // Add API Key Button Click Event
    $(document).on('click', '#add-api-key', function () {
        console.log('Add API Key button clicked');
        var newRow = $(".api-key-row").first().clone(); // Clone the first row
        newRow.find('input, select').val(''); // Clear input values
        newRow.find('.namespace-type').val('all'); // Select default value for Namespace Type
        newRow.find('.apikey-type').val('write'); // Select default value for API Key Type
        newRow.find('.apikey-format').val('clear'); // Select default value for API Key Format
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
                        loadContent('api-keys.html', 'Settings > API Keys');
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
                isValid = /^[a-zA-Z0-9\-]{5,20}$/.test(value);
                console.log('Namespace name validation result:', isValid);
            }
        } else {
            if (value === '') {
                isValid = false;
                console.log('Field value is empty, marking as invalid');
            } else {
                switch (true) {
                    case field.hasClass('tenant-name'):
                        isValid = /^[a-z0-9\-]{5,20}$/.test(value);
                        console.log('Tenant name validation result:', isValid);
                        break;
                    case field.hasClass('apikey'):
                        isValid = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|-]{10,40}$/.test(value);
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
});
