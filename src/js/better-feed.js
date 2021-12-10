import "../styles/common.less";
import { startObserver } from "./base/modules";
import Settings from "./base/settings";
import "./modules/comment-clouds";
import "./modules/common";
import "./modules/hanging-punct";
import "./modules/hide-arabic";
// import "./modules/ani-gifs";
import "./modules/moon";
import "./modules/no-comment-more";
import "./modules/no-read-more";
import "./modules/previews-in-comments";
import "./modules/settings-link";
import "./modules/show-timestamps";
import "./modules/switch-accounts";
import { getCurrentAuth } from "./utils/current-user-id";
import docLoaded from "./utils/doc-loaded";
import IAm from "./utils/i-am";
import Messenger from "./utils/message-rpc";

const { userId } = getCurrentAuth();

if (!/^\/(attachments\/|files\/|bookmarklet|v\d\/)/.test(location.pathname)) {
  if (!MutationObserver || !Promise) {
    console.error(
      "Can not start BetterFeed: MutationObserver & Promise not supported"
    );
  } else if (userId === null) {
    console.error("Can not start BetterFeed: user not logged in");
  } else if ("__BetterFeed" in window) {
    console.warn("BetterFeed already started");
  } else {
    window.__BetterFeed = true;
    Promise.all([IAm.ready, docLoaded]).then(([iAm]) => {
      start(new Settings(iAm.bf2Props));
    });
  }
}

/**
 * @param {Settings} settings
 */
function start(settings) {
  startObserver(settings);

  const msg = new Messenger();

  msg.on("getSettings", () => settings.toJSON());

  msg.on("saveSettings", async (o) => {
    const iAm = await IAm.ready;
    await iAm.saveProps(new Settings(o));
    location.reload(true);
  });

  msg.on("checkUpdates", checkUpdates);
}

function checkUpdates() {
  const now = Date.now();
  const oldVersion = process.env.BF2_VERSION;
  localStorage["bf2-next-update"] = now + 3600 * 1000;
  const xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    "https://api.github.com/repos/davidmz/BetterFeed2/tags?page=1&per_page=1"
  );
  xhr.responseType = "json";
  xhr.onload = () => {
    try {
      const tags = xhr.response;
      if (tags.length === 1 && "name" in tags[0]) {
        const newVersion = tags[0]["name"];
        localStorage["bf2-version"] = newVersion;
        localStorage["bf2-next-update"] = now + 24 * 3600 * 1000;
        if (newVersion !== oldVersion) {
          if (
            confirm(
              `Доступна новая версия: ${newVersion}. Она будет установлена после перезагрузки страницы.\n\nПерезагрузить страницу сейчас?`
            )
          ) {
            location.reload(true);
          }
        } else {
          alert(`У вас установлена последняя версия (${newVersion})`);
        }
      }
    } catch (e) {
      // Do nothing
    }
  };
  xhr.send();
}
