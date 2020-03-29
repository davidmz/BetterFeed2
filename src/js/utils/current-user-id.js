export let userId = null;
export let authToken = null;

const sitesProps = {
    "freefeed.net":       {
        cookies: ["freefeedBETA_authToken", "freefeed_authToken"]
    },
    "gamma.freefeed.net": {
        cookies: ["freefeed_authToken"]
    }
};

export let siteDomain = location.hostname;
export let cookieName = "freefeedBETA_authToken";

if (siteDomain in sitesProps) {
    sitesProps[siteDomain].cookies.some(cName => {
        [userId, authToken] = getUserIdToken(cName);
        cookieName = cName;
        return userId !== null;
    });
}

/**
 *
 * @param {string} cookieName
 * @return {Array.<string>} [userId, token]
 */
function getUserIdToken(cookieName) {
    const cookieValue = localStorage.getItem(cookieName);
    if (cookieValue !== null) {
        const parts = cookieValue.split(".");
        if (parts.length === 3) {
            try {
                let payload = JSON.parse(atob(parts[1]));
                if ("userId" in payload) {
                    return [payload["userId"], cookieValue];
                }
            } catch (e) {
            }
        }
    }
    return [null, null];
}