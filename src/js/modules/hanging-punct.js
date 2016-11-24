import {registerModule} from "./../base/modules";
import textWalk from "../utils/text-walk";
import escapeHTML from "../utils/escape-html";
import matches from "../utils/matches";

const module = registerModule("hanging-punct");

let helper;

module.init(() => {
    helper = document.createElement("div");
});

const re = /(^|\s)([(«“-]|&quot;)/g;

module.watch(".post-text, .comment-body", node => {
    if (matches(node, ".comment-body")) {
        const userNames = node.querySelectorAll(".user-name-wrapper");
        const lastUserName = userNames[userNames.length - 1];
        if (lastUserName && lastUserName.nextElementSibling) {
            const actions = lastUserName.nextElementSibling;
            textWalk(actions, node => {
                if (node.nodeValue === "(") {
                    node.nodeValue = " (";
                }
            });
        }
    }
    textWalk(node, node => {
        let html = escapeHTML(node.nodeValue);
        if (!re.test(html)) {
            return;
        }
        html = html.replace(re, '<span class="bf2-hp-pre bf2-hp-pre-$2">$1</span><span class="bf2-hp-$2">$2</span>');
        helper.innerHTML = html;
        while (helper.firstChild) {
            node.parentNode.insertBefore(helper.firstChild, node);
        }
        node.parentNode.removeChild(node);
    });
});