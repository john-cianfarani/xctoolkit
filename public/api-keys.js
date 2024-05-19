$(document).ready(function() {
    console.log('Document is ready');

    // Add API Key Button Click Event
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
            namespaceNameInput.removeClass('is-invalid');
        } else {
            namespaceNameInput.prop('disabled', false);
        }
        console.log('Namespace type changed to:', namespaceType);
    });

    // Form Field Blur Event for Validation
    $(document).on('blur', '.tenant-name, .namespace-name, .apikey', function() {
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
                    console.log('Server response:', response);
                    if (response.success) {
                        alert("API keys set successfully!");
                    } else {
                        alert("Failed to set API keys.");
                    }
                },
                error: function() {
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
                        isValid = /^[a-zA-Z0-9\-]{5,20}$/.test(value);
                        console.log('Tenant name validation result:', isValid);
                        break;
                    case field.hasClass('apikey'):
                        isValid = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|-]{10,30}$/.test(value);
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
