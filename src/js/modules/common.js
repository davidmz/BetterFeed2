import {registerModule} from "./../base/modules";
import closestParent from "../utils/closest-parent";
import onHistory from "../utils/on-history";
import forSelect from "../utils/for-select";
import IAm from "../utils/i-am";
import {siteDomain} from "../utils/current-user-id";

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

    if (siteDomain === "gamma.freefeed.net") {
        document.body.classList.add("bf2-gamma-frontend");
    }
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
    const commentAuthor = getCommentAuthor(node);
    if (!commentAuthor) {
        // фолд или форма нового коммента
        return;
    }
    const postAuthor = getPostAuthor(closestParent(node, ".post"));
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

function getCommentAuthor(commentNode) {
    let author = commentNode.dataset["author"];
    if (!author) {
        const authorLink = commentNode.querySelector(".comment-body > .user-name-wrapper > a");
        if (authorLink) {
            author = authorLink.getAttribute("href").substr(1);
            commentNode.dataset["author"] = author;
        }
    }
    return author;
}


function getPostAuthor(postNode) {
    let author = postNode.dataset["author"];
    if (!author) {
        const authorLink = postNode.querySelector(".post-header a.post-author");
        if (authorLink) {
            author = authorLink.getAttribute("href").substr(1);
            postNode.dataset["author"] = author;
        }
    }
    return author;
}