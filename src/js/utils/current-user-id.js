export var userId = null;
export var authToken = null;
export var siteDomain = 'freefeed.net';
export var cookieName = 'freefeedBETA_authToken';

if (location.hostname === 'george.freefeed.net') {
    cookieName = 'micropeppaBETA_authToken';
    siteDomain = 'george.freefeed.net';
}


let matches = document.cookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`));
let cookieValue = matches ? matches[1] : null;

if (cookieValue) {
    let parts = cookieValue.split(".");
    if (parts.length === 3) {
        try {
            let payload = JSON.parse(atob(parts[1]));
            if ("userId" in payload) {
                userId = payload["userId"];
                authToken = cookieValue;
            }
        } catch (e) {
        }
    }
}

