import {registerModule} from "./../base/modules";
import textWalk from "../utils/text-walk";
import escapeHTML from "../utils/escape-html";

const module = registerModule("hanging-punct");

let helper;

module.init(() => {
    helper = document.createElement("div");
});

const re = /(^|\s)([(«“-]|&quot;)/g;

module.watch(".post-text, .comment-body", node => {
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