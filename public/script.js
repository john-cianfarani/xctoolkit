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


