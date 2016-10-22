import {registerModule} from "./../base/modules";
import {stemmer as stemmerEn} from "porter-stemmer";
import stemmerRu from "../utils/stemmer-ru";
import onHistory from "../utils/on-history";
import textWalk from "../utils/text-walk";
import escapeRe from "escape-string-regexp";

const module = registerModule("search-highlight");

const enLetters = "a-z";
const ruLetters = "\u0400-\u04ff";

const partRE = /"(.+?)"|(\S+)/g;
const enWordRE = new RegExp(`^[${enLetters}]+$`, "i");
const ruWordRE = new RegExp(`^[${ruLetters}]+$`, "i");
const hlClass = "bf2-search-highlight";

const terms = [];

module.init(() => {
    onHistory(location => {
        if (location.pathname !== "/search") return;

        terms.length = 0;

        let m = /[?&]qs=([^&]+)/.exec(location.search);
        if (!m) {
            return;
        }
        const q = decodeURIComponent(m[1]);

        while ((m = partRE.exec(q)) !== null) {
            if (m[2] && m[2].indexOf(":") !== -1) {
                continue;
            }
            if (m[1] !== undefined) {
                terms.push(new RegExp(`(^|[^${enLetters}${ruLetters}])(${escapeRe(m[1])})(?:$|[^${enLetters}${ruLetters}])`));
            } else if (enWordRE.test(m[2])) {
                terms.push(new RegExp(`(^|[^${enLetters}])(${escapeRe(stemmerEn(m[2]))}[${enLetters}]*)`, "i"));
            } else if (ruWordRE.test(m[2])) {
                terms.push(new RegExp(`(^|[^${ruLetters}])(${escapeRe(stemmerRu(m[2]))}[${ruLetters}]*)`, "i"));
            } else {
                terms.push(new RegExp(`(^|[^${enLetters}${ruLetters}])(${escapeRe(m[2])})(?:$|[^${enLetters}${ruLetters}])`));
            }
        }
        console.log(terms);
    });
});

module.watch(".post-text, .comment-body", node => {
    if (location.pathname !== "/search" || terms.length === 0) {
        return;
    }

    textWalk(node, node => {
        let text = node.nodeValue;
        let start = 0;
        const fr = document.createDocumentFragment();

        while (text !== "") {
            let match = "", minPos = 0;
            terms.forEach(re => {
                const m = re.exec(text);
                if (m && (match === "" || m.index < minPos)) {
                    minPos = m.index + (m[1] || "").length;
                    match = m[2];
                }
            });

            if (match !== "") {
                fr.appendChild(document.createTextNode(text.substring(start, minPos)));
                const span = fr.appendChild(document.createElement("span"));
                span.className = hlClass;
                span.appendChild(document.createTextNode(match));
                text = text.substring(minPos + match.length);
            } else {
                fr.appendChild(document.createTextNode(text));
                break;
            }
        }
        node.parentNode.insertBefore(fr, node);
        node.parentNode.removeChild(node);
    });

});