import "../styles/common.less";
import {startObserver} from "./base/modules";
import {userId} from "./utils/current-user-id";
import IAm from "./utils/i-am";
import docLoaded from "./utils/doc-loaded";
import Settings from "./base/settings";
import Messenger from "./utils/message-rpc";

import "./modules/common";
import "./modules/settings-link";
import "./modules/hide-posts";

if (!/^\/(attachments|files)\//.test(location.pathname)) {
    if (!MutationObserver || !Promise) {
        console.error("Can not start BetterFeed: MutationObserver & Promise not supported");
    } else if (userId === null) {
        console.error("Can not start BetterFeed: user not logged in");
    } else if ("__BetterFeed" in window) {
        console.warn("BetterFeed already started");
    } else {
        window.__BetterFeed = true;
        Promise.all([IAm.ready, docLoaded]).then(([iAm])=> {
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

    msg.on("saveSettings", async(o) => {
        const iAm = await IAm.ready;
        await iAm.saveProps(new Settings(o));
        location.reload(true);
    });
}