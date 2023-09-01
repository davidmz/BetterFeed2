const verName = "bf2-version",
  updName = "bf2-next-update",
  now = Date.now();

let version = null,
  nextUpdate = 0;

if (verName in localStorage) {
  version = localStorage[verName];
  nextUpdate = parseInt(localStorage[updName]);
  if (isNaN(nextUpdate)) {
    nextUpdate = 0;
  }
}

if (now > nextUpdate) {
  localStorage[updName] = now + 3600 * 1000;
  var xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    "https://api.github.com/repos/davidmz/BetterFeed2/tags?page=1&per_page=1",
  );
  xhr.responseType = "json";
  xhr.onload = function () {
    var tags = xhr.response;
    if (tags.length === 1 && "name" in tags[0]) {
      localStorage[verName] = tags[0]["name"];
      localStorage[updName] = now + 24 * 3600 * 1000;
      // первый запуск
      if (version === null) inject(tags[0]["name"]);
    }
  };
  xhr.send();
}

if (version !== null) inject(version);

function inject(version) {
  window.__BetterFeedRoot =
    "https://cdn.jsdelivr.net/gh/davidmz/BetterFeed2@" + version;
  var e = document.createElement("script");
  e.src = window.__BetterFeedRoot + "/build/better-feed.min.js";
  e.type = "text/javascript";
  e.charset = "utf-8";
  e.async = true;
  document.head.appendChild(e);
}
