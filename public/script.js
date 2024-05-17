// script.js v1.2

$(document).ready(function() {
    $("#api-keys-link").click(function() {
        loadContent('api-keys.html', 'Settings > API Keys');
    });
    checkCookie();
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

function checkCookie() {
    let apiCookie = getCookie("xchelperapi");
    if (!apiCookie || !isValidCookie(apiCookie)) {
        loadContent('api-keys.html', 'Settings > API Keys');
    }
}

function isValidCookie(cookie) {
    // Placeholder function - replace with actual validation logic
    return cookie === "valid";
}

function loadContent(url, breadcrumbsText) {
    $.get(url, function(html) {
        $("#subcontent").html(html);
        setBreadcrumbs(breadcrumbsText.split(" > "));
    }).fail(function(error) {
        console.error('Error loading content:', error);
    });
}

function setBreadcrumbs(breadcrumbs) {
    for (let i = 0; i < 5; i++) {
        $("#breadcrumb-" + (i+1)).html(breadcrumbs[i] || "");
    }
}


//API-Keys

$(document).ready(function() {
    console.log('Document is ready');

    // Event delegation for Add API Key Button Click Event
    $(document).on('click', '#add-api-key', function() {
        console.log('Add API Key button clicked');

        var newRow = $(".api-key-row").first().clone(); // Clone the first row
        newRow.find('input, select').val(''); // Clear input values
        newRow.find('.namespace-type').val('all'); // Select default value for Namespace Type
        newRow.find('.apikey-type').val('write'); // Select default value for API Key Type
        newRow.find('.namespace-name').prop('disabled', true); // Ensure Namespace Name is disabled
        newRow.find('.remove-api-key').prop('disabled', false); // Enable remove button for new row
        $("#api-keys-container").append(newRow); // Append the new row to the container
        console.log('Row appended'); // Confirm row append
    });

    // Remove API Key Button Click Event
    $(document).on('click', '.remove-api-key', function() {
        var row = $(this).closest('.api-key-row');
        if (!row.is(':first-child')) { // Check if it's not the first row
            row.remove(); // Remove the row
            console.log('Row removed');
        }
    });

    // Namespace Type Change Event
    $(document).on('change', '.namespace-type', function() {
        var namespaceType = $(this).val();
        var namespaceNameInput = $(this).closest('.api-key-row').find('.namespace-name');
        if (namespaceType === 'all') {
            namespaceNameInput.prop('disabled', true).val('');
        } else {
            namespaceNameInput.prop('disabled', false);
        }
        console.log('Namespace type changed to:', namespaceType);
    });

    // Event delegation for Form Field Blur Event for Validation
    $(document).on('blur', '.namespace-name', function() {
        validateField($(this)); // Validate the blurred field
    });

    // Event delegation for Form Field Blur Event for Validation
    $(document).on('blur', '.api-key-row input, .api-key-row select', function() {
        validateField($(this)); // Validate the blurred field
    });

    // Form Submission
    $(document).on('click', '#submit-api-keys', function(event) {
        event.preventDefault(); // Prevent default form submission
        console.log('Submit button clicked');

        // Validate all fields
        var isValidForm = true;
        $(".api-key-row input, .api-key-row select").each(function() {
            if (!validateField($(this))) {
                isValidForm = false;
            }
        });

        if (isValidForm) {
            // Construct JSON object from form data
            var apiKeys = [];
            $(".api-key-row").each(function() {
                var apiKey = {
                    "apikey-type": $(this).find(".apikey-type").val(),
                    "tenant-name": $(this).find(".tenant-name").val(),
                    "namespace-type": $(this).find(".namespace-type").val(),
                    "namespace-name": $(this).find(".namespace-name").val(),
                    "apikey": $(this).find(".apikey").val()
                };
                apiKeys.push(apiKey);
            });

            console.log('API Keys:', apiKeys); // Log the constructed JSON object

            // Send JSON object to server via POST request
            $.ajax({
                type: "POST",
                url: "/setapikey",
                contentType: "application/json",
                data: JSON.stringify(apiKeys),
                success: function(response) {
                    if (response.success) {
                        alert("API keys set successfully!");
                    } else {
                        alert("Failed to set API keys.");
                    }
                },
                error: function() {
                    alert("An error occurred while setting API keys.");
                }
            });
        }
    });

    // Function to validate a field
    function validateField(field) {
        var isValid = true;
        var value = field.val();
    
        console.log('Field:', field, 'value:', value);

        if (value === '') {
            isValid = false;
        } else {
            switch (true) {
                case field.hasClass('tenant-name'):
                    isValid = /^[a-zA-Z0-9\-]{5,20}$/.test(value);
                    break;
                case field.hasClass('namespace-name'):
                    console.log('Namespace test entered');
                    var namespaceType = field.closest('.api-key-row').find('.namespace-type').val();
                    console.log('Namespace Type:', namespaceType);
                    if (namespaceType !== 'all') {
                        isValid = /^[a-zA-Z0-9\-]{5,20}$/.test(value);
                    } else {
                        isValid = true; // Skip validation for namespace-name when namespace-type is 'all'
                    }
                    break;
                case field.hasClass('apikey'):
                    isValid = value.length === 30;
                    break;
                default:
                    isValid = true;
            }
        }
    
        if (isValid) {
            field.removeClass('is-invalid');
            console.log('isValid is true');
        } else if (isValid === false) {
            field.addClass('is-invalid');
            console.log('isValid is false');
        } else {
            // Fallback logic and logging
            console.log('Fallback logic triggered');
        }
    
        console.log('Field validated:', field.attr('class'), 'ValidState:', isValid);
    
        return isValid;
    }
    
    
});
