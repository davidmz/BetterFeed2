import {registerModule} from "./../base/modules";
import h from "../utils/html";
import bfRoot from "../utils/bf-root";
import Lightbox from "../utils/lightbox";
import {authToken} from '../utils/current-user-id.js';
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

    node.insertBefore(html, null);

    link.addEventListener("click", () => showSettings())
});

if ("__BetterFeedOnSite" in window) {
    // BF загружен через сайтовый загрузчик
    module.watch(".bf2-settings-description", node => {
        if (!document.body.querySelector(".bf2-green")) {
            greenBarBefore(node);
        }
    });
} else {
    // BF загружен как юзерскрипт
    module.watch(".box-body > form > h3", node => {
        if (document.body.querySelector(".bf2-green") || node.textContent !== "Change password") {
            return;
        }
        const pwdForm = node.parentNode;
        const descNode = h("p.bf2-settings-description",
            "BetterFeed is an add-on that improves or dramatically alters stock interface of FreeFeed (",
            h("a", {href: "https://github.com/davidmz/BetterFeed2", target: "_blank"}, "details"),
            "). "
        );
        const html = h("div",
            h("h3.bf2-settings-header", "Add-ons"),
            descNode,
            h("hr")
        );
        pwdForm.parentNode.insertBefore(html, pwdForm);
        greenBarBefore(descNode);
    });
}

function greenBarBefore(node) {
    const sLink = h("a", "configure settings");
    const showTokenLink = h("a", "show access token");
    node.parentNode.insertBefore(
        h("p.bg-success.bf2-green",
            `BetterFeed enabled (${version}) | `,
            h("i.fa.fa-cog"), " ", sLink,
            ' | ',
            h("i.fa.fa-exclamation-triangle"), " ", showTokenLink
        ),
        node
    );
    sLink.addEventListener("click", () => showSettings());
    showTokenLink.addEventListener("click", () => showAccessToken());
}

function showSettings() {
    const url = bfRoot + '/src/html/settings.html?origin=' + encodeURIComponent(location.origin);

    if (/iPhone|iPad/.test(navigator.userAgent)) {
        window.open(url, "_blank");
        return;
    }

    new Lightbox("bf2-settings-lightbox")
        .showContent(h("iframe", {src: url, frameborder: "0"}));
}

function showAccessToken() {
    const html = `
        <p>
            Your access token is:
        </p>
        <p class="bf2-access-token">
            ${escapeHTML(authToken)}
        </p>
        <p>
            <strong>WARNING:</strong> Keep your token secure at all times and do not share it with services you do not fully trust.
            They will be able to perform ANY operation on your behalf including changing your password and
            <strong>locking you out of your account</strong>.
        </p>
        <p>
            Giving your token to third party services provides them with FULL and UNLIMITED access to your account.
            You can not change the token, you cannot revert access once you give it out.
        </p>
        <p>
            If you suspect your token is being abused, contact <a href="mailto:freefeed.net@gmail.com">freefeed.net@gmail.com</a> <strong>immediately</strong>.
        </p>
        <p style="text-align: center">
            <button>Close</button>
        </p>
    `;
    const lb = new Lightbox("bf2-access-token-lightbox");
    lb.showContent(html);
    lb.contentEl.querySelector("button").addEventListener("click", () => lb.hide());
}
