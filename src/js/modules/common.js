import {registerModule} from "./../base/modules";
import closestParent from "../utils/closest-parent";
import onHistory from "../utils/on-history";
import forSelect from "../utils/for-select";

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