import {registerModule} from "./../base/modules";
import h from "../utils/html";
import bfRoot from "../utils/bf-root";
import Lightbox from "../utils/lightbox";
import escapeHTML from "../utils/escape-html";

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

    const someBox = node.querySelector(".box");

    someBox.parentNode.insertBefore(html, null);

    link.addEventListener("click", showSettings)
});

async function showSettings() {
    const url = bfRoot + '/src/html/settings.html';
    const html = (await fetch(url).then(r => r.text()))
        .replace(/\[\[parentOrigin]]/g, escapeHTML(location.origin))
        .replace(/\[\[betterFeedVersion]]/g, escapeHTML(version))
        .replace(/\[\[baseURL]]/g, escapeHTML(bfRoot + '/'));
    const htmlUrl = URL.createObjectURL(new Blob([html], {type: "text/html;charset=utf-8"}));

    if (/iPhone|iPad/.test(navigator.userAgent)) {
        window.open(htmlUrl, "_blank");
        return;
    }

    new Lightbox("bf2-settings-lightbox")
        .showContent(h("iframe", {src: htmlUrl, frameborder: "0"}));
}
