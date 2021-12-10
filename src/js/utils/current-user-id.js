const sitesProps = {
  "freefeed.net": {
    cookies: ["freefeedBETA_authToken", "freefeed_authToken"],
  },
  "gamma.freefeed.net": {
    cookies: ["freefeed_authToken"],
  },
};

export const siteDomain = location.hostname;
export const cookieName = "freefeedBETA_authToken";

export function getCurrentAuth() {
  if (siteDomain in sitesProps) {
    for (const cName of sitesProps[siteDomain].cookies) {
      const { userId, authToken } = extractFromJWT(localStorage.getItem(cName));
      if (userId) {
        return { userId, authToken };
      }
    }
  }
  return { userId: null, authToken: null };
}

function extractFromJWT(jwtString) {
  if (jwtString !== null) {
    const parts = jwtString.split(".");
    if (parts.length === 3) {
      try {
        let payload = JSON.parse(atob(parts[1]));
        if ("userId" in payload) {
          return { authToken: jwtString, userId: payload["userId"] };
        }
      } catch (e) {
        // Do nothing
      }
    }
  }
  return { authToken: null, userId: null };
}
