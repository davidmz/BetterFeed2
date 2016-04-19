import {registerModule} from "./../base/modules";
import closestParent from "../utils/closest-parent";
import forSelect from "../utils/for-select";

const module = registerModule("cloud-clicks");

module.init(() => {
    document.addEventListener("click", e => {
        const commIcon = closestParent(e.target, ".comment-icon", true),
            commNode = closestParent(commIcon, ".comment");

        if (
            !(commIcon && commNode)
            || e.button != 0
            || !commIcon.id // ссылка "Add comment"
            || commNode.querySelector("textarea") // Форма создания нового коммента
        ) return;

        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        let caps = "";
        if (e.metaKey || e.ctrlKey) {
            let comm = commNode.nextSibling,
                n = 1;
            while (comm) {
                const moreLink = comm.querySelector(".more-comments-link");
                if (moreLink) {
                    const m = parseInt(moreLink.textContent);
                    if (!isNaN(m)) {
                        n += m;
                    }
                } else if (commNode.querySelector("textarea") || commNode.querySelector(".add-comment-link")) {
                    // the end
                    break;
                } else {
                    n++;
                }
                comm = comm.nextSibling;
            }
            if (n < 2) n = 2;
            caps = new Array(n).join("^");
        }

        const usersInComment = commNode.querySelectorAll(".user-name-wrapper");
        const commAuthor = usersInComment[usersInComment.length - 1].querySelector("a").getAttribute("href").substr(1);

        const postNode = closestParent(commNode, ".post");
        (async() => {
            let ta = postNode.querySelector(".comment-textarea");
            if (!ta) {
                forSelect(postNode, ".post-footer a").filter(a => a.textContent == "Comment").forEach(a => a.click());
                await new Promise(yes => setTimeout(yes, 100));
                ta = postNode.querySelector(".comment-textarea");
            }
            if (ta) {
                if (caps !== "") {
                    ta.value += caps + " " + (e.shiftKey ? "this" : "");
                } else if (commAuthor) {
                    ta.value += "@" + commAuthor + " ";
                }
                ta.focus();
                ta.selectionStart = ta.selectionEnd = ta.value.length;
            }
        })();
    }, true);
});
