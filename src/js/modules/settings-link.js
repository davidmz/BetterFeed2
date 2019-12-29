import {registerModule} from "./../base/modules";
import h from "../utils/html";
import bfRoot from "../utils/bf-root";
import Lightbox from "../utils/lightbox";

const version = process.env.BF2_VERSION;

const module = registerModule("settings-link", true, true);

module.watch(".sidebar", node => {
    if (node.querySelector(".bf2-sidebar-box")) {
        return;
    }

    const link = h("a", "BetterFeed settings");
    const html = h(".bf2-sidebar-box.box",
        h(".box-header-groups", "Add-ons"),
        h(".box-body",
            h("ul",
                h("li", link)
            )
        ),
        h(".box-footer", version),
    );

    node.insertBefore(html, null);

    link.addEventListener("click", showSettings)
});

function showSettings() {
    const url = bfRoot + '/src/html/settings.html?origin=' + encodeURIComponent(location.origin);

    if (/iPhone|iPad/.test(navigator.userAgent)) {
        window.open(url, "_blank");
        return;
    }

    new Lightbox("bf2-settings-lightbox")
        .showContent(h("iframe", {src: url, frameborder: "0"}));
}
