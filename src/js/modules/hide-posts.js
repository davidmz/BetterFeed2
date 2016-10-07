import {registerModule} from "./../base/modules";
import h from "../utils/html";
import IAm from "../utils/i-am";
import closestParent from "../utils/closest-parent";
import escapeHTML from "../utils/escape-html";

const module = registerModule("hide-posts");

let style = null;

module.init(settings => {
    style = document.head.appendChild(h("style.bf2-hide-posts")).sheet;
    settings.hidePostsFrom.forEach(userName => {
        style.insertRule(`${selectorFor(userName)} { display: none; }`, 0);
        style.insertRule(`${selectorTo(userName)} { display: none; }`, 0);
    });
});

module.watch(".user-card-actions", (node, settings) => {
    const userName = closestParent(node, ".user-card").dataset.userName;
    let isHidden = settings.hidePostsFrom.has(userName);
    const link = h("a");
    renderLink(link, isHidden);
    node.appendChild(h("span", " - ", link));

    link.addEventListener("click", () => {
        if (isHidden) {
            Array.prototype.slice.call(style.rules).forEach((rule, n) => {
                if (rule.selectorText === selectorFor(userName) || rule.selectorText === selectorTo(userName)) {
                    style.deleteRule(n);
                }
            });
            settings.hidePostsFrom.delete(userName);
        } else {
            style.insertRule(`${selectorFor(userName)} { display: none; }`, 0);
            style.insertRule(`${selectorTo(userName)} { display: none; }`, 0);
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

function selectorFor(name) { return `.bf2-aggregate-page .bf2-post-from-${name}`;}
function selectorTo(name) { return `.bf2-aggregate-page .bf2-post-to-${name}`;}