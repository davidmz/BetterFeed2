import {registerModule} from "./../base/modules";
import h from "../utils/html";
import IAm from "../utils/i-am";
import closestParent from "../utils/closest-parent";
import onHistory from "../utils/on-history";
import escapeHTML from "../utils/escape-html";

const module = registerModule("hide-posts");

const homePageClass = "bf2-homepage";
let style = null;

module.init(settings => {
    onHistory(location => document.body.classList.toggle(homePageClass, location.pathname === "/"));

    style = document.head.appendChild(h("style.bf2-hide-posts")).sheet;
    settings.hidePostsFrom.forEach(userName => style.insertRule(`.${homePageClass} .bf2-post-from-${userName} { display: none; }`, 0));
});

module.watch(".user-card-actions", (node, settings) => {
    const userName = closestParent(node, ".user-card").dataset.userName;
    let isHidden = settings.hidePostsFrom.has(userName);
    const link = h("a");
    renderLink(link, isHidden);
    node.appendChild(h("span", " - ", link));

    link.addEventListener("click", () => {
        if (isHidden) {
            const selector = `.${homePageClass} .bf2-post-from-${userName}`;
            Array.prototype.slice.call(style.rules).forEach((rule, n) => {
                if (rule.selectorText === selector) {
                    style.deleteRule(n);
                }
            });
            settings.hidePostsFrom.delete(userName);
        } else {
            style.insertRule(`.${homePageClass} .bf2-post-from-${userName} { display: none; }`, 0);
            settings.hidePostsFrom.add(userName);
        }
        isHidden = !isHidden;
        renderLink(link, isHidden);
        IAm.ready.then(iAm => iAm.saveProps(settings));
    });
});

function renderLink(link, isHidden) {
    link.title = `${isHidden ? "Show" : "Hide"} user\u2019s posts ${isHidden ? "in" : "from"} home feed`;
    link.innerHTML = escapeHTML(`${isHidden ? "Show" : "Hide"} posts`);
}