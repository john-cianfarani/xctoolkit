// api-keys.js

$(document).ready(function() {
    $('#api-keys-form').on('submit', function(event) {
        event.preventDefault();
        submitForm();
    });

    $('#add-api-key').click(function() {
        addApiKeyRow();
    });

    // Validate fields on focus out
    $('#api-keys-form input, #api-keys-form select').on('blur', function() {
        validateField($(this));
    });
});

function addApiKeyRow() {
    let newRow = $('.api-key-entry').first().clone();
    newRow.find('input, select').val('');
    newRow.appendTo('#api-keys-container');
}

function submitForm() {
    let formData = [];
    $('.api-key-entry').each(function() {
        let entry = {
            type: $(this).find('#apikey-type').val(),
            tenant: $(this).find('#apikey-tenant').val(),
            namespace: $(this).find('#apikey-namespace').val(),
            key: $(this).find('#apikey-key').val()
        };
        formData.push(entry);
    });

    $.ajax({
        url: '/setapikey',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            $('#api-keys-message').html('API keys set successfully').addClass('success');
        },
        error: function(xhr, status, error) {
            $('#api-keys-message').html('Error setting API keys').addClass('error');
        }
    });
}

function validateField(field) {
    let value = field.val().trim();
    let invalidFeedback = field.next('.invalid-feedback');
    if (field.prop('required') && !value) {
        field.addClass('is-invalid');
        invalidFeedback.text('This field is required').show();
    } else {
        field.removeClass('is-invalid');
        invalidFeedback.hide().text('');
    }
}
