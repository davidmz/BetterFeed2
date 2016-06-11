import {registerModule} from "./../base/modules";
import closestParent from "../utils/closest-parent";
import onHistory from "../utils/on-history";
import forSelect from "../utils/for-select";
import IAm from "../utils/i-am";

const module = registerModule("common", true, true);

module.init(() => {
    // Homepage
    onHistory(location => document.body.classList.toggle("bf2-homepage", location.pathname === "/"));

    document.addEventListener("click", e => {
        if (e.button == 0 && e.target.classList.contains("bf2-user-link")) {
            //noinspection JSUnresolvedVariable
            const reactLink = document.querySelector(`a:not(.bf2-user-link)[href="${CSS.escape(e.target.getAttribute("href"))}"]`);
            if (reactLink) {
                e.preventDefault();
                e.target.blur();
                reactLink.click();
            }
        }
    });
});


// Свойства постов
module.watch(".timeline-post, .single-post", node => {
    // ID поста
    const postId = node.querySelector(".post-timestamp").getAttribute("href").match(/^\/.+?\/([\w-]+)/)[1];
    node.id = `post-${postId}`;
    node.dataset.postId = postId;

    // Автор поста
    const postAuthor = node.querySelector(".post-author").getAttribute("href").substr(1);
    node.dataset.postAuthor = postAuthor;
    node.classList.add(`bf2-post-from-${postAuthor}`);

    // Адресаты поста
    forSelect(node, ".post-recipient")
        .map(a => a.getAttribute("href").substr(1))
        .filter(u => u !== postAuthor)
        .forEach(u => node.classList.add(`bf2-post-to-${u}`));
});

// User cards
module.watch(".user-card .display-name", node => {
    closestParent(node, ".user-card").dataset.userName = node.getAttribute("href").substr(1);
});

// Свойства комментариев
module.watch(".comment", async(node) => {
    const commentAuthor = node.dataset["author"];
    if (!commentAuthor) {
        // фолд или форма нового коммента
        return;
    }
    const postAuthor = closestParent(node, ".post").dataset["author"];
    if (!postAuthor) {
        return;
    }

    const commProps = [];

    commProps.push("from");

    if (postAuthor === commentAuthor) {
        commProps.push("from-post-author");
    }

    const type = (await IAm.ready).whoIs(commentAuthor);
    if (type & IAm.ME) {
        commProps.push("from-me");
    } else if (type & IAm.FRIEND) {
        commProps.push("from-friend");
    } else if (type & IAm.READER) {
        commProps.push("from-reader");
    }

    node.dataset.commProps = commProps.join(" ");
});