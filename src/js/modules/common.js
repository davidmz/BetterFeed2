import {registerModule} from "./../base/modules";
import closestParent from "../utils/closest-parent";
import onHistory from "../utils/on-history";

const module = registerModule("common", true, true);

// Homepage
module.init(settings => {
    onHistory(location => document.body.classList.toggle("bf2-homepage", location.pathname === "/"));
});


// Свойства постов
module.watch(".timeline-post, .single-post", node => {
    { // ID поста
        const postId = node.querySelector(".post-timestamp").getAttribute("href").match(/^\/.+?\/([\w-]+)/)[1];
        node.id = `post-${postId}`;
        node.dataset.postId = postId;
    }
    { // Автор поста
        const postAuthor = node.querySelector(".post-author").getAttribute("href").substr(1);
        node.dataset.postAuthor = postAuthor;
        node.classList.add(`bf2-post-from-${postAuthor}`);
    }
});

// User cards
module.watch(".user-card .display-name", node => {
    {
        closestParent(node, ".user-card").dataset.userName = node.getAttribute("href").substr(1);
    }
});