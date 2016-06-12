import {registerModule} from "./../base/modules";
import forSelect from "../utils/for-select";
import * as api from "../utils/api";
import {html} from "../utils/html-tpl";
import IAm from "../utils/i-am";

const module = registerModule("posts-via");

module.watch(".timeline-post:not(.bf2-post-via)", async(node) => {
    // включаемся только на френдленте
    if (location.pathname !== "/") return;
    node.classList.add("bf2-post-via");

    const iAm = await IAm.ready,
        postId = node.dataset.postId,
        authorName = node.dataset.postAuthor,
        postRecipients = forSelect(node, ".post-recipient")
            .map(a => a.getAttribute("href").substr(1))
            .filter(u => u !== authorName);

    // пост от меня или от френда?
    if (iAm.whoIs(authorName) & (IAm.ME | IAm.FRIEND)) return;

    // пост в мои группы?
    if (postRecipients.some(u => !!(iAm.whoIs(u) & IAm.FRIEND))) return;

    node.classList.add("bf2-alien-post");

    // пытаемся выяснить, почему мы это видим, сначала только по данным со страницы
    const likesOnPage = forSelect(node, ".likes a");
    const isLikesWrapped = likesOnPage.some(a => !a.hasAttribute("href"));

    let likedUsers = likesOnPage
        .filter(a => a.hasAttribute("href"))
        .map(a => a.getAttribute("href").substr(1))
        .filter(u => u !== null && !!(iAm.whoIs(u) & (IAm.ME | IAm.FRIEND)));

    let commentedUsers = forSelect(node, ".comment-body > .user-name-wrapper a")
        .map(a => a.getAttribute("href").substr(1))
        .filter(u => !!(iAm.whoIs(u) & (IAm.ME | IAm.FRIEND)));

    if (isLikesWrapped && likedUsers.length == 0 && commentedUsers.length == 0) {
        // достаём все лайки
        const {posts: {likes}, users} = await api.get(`/v1/posts/${postId}?maxLikes=all&maxComments=2`);
        likedUsers = likes
            .map(uid => {
                const names = users.filter(u => u.id == uid).map(u => u.username);
                return names.length > 0 ? names[0] : null;
            })
            .filter(u => u !== null && !!(iAm.whoIs(u) & (IAm.ME | IAm.FRIEND)))
            .filter((v, i, a) => a.indexOf(v) === i); // http://stackoverflow.com/questions/1960473/unique-values-in-an-array#answer-14438954
    }

    let meInLikes = false;
    let meInComments = false;
    let users = [];

    const viaUnknown = (likedUsers.length == 0 && commentedUsers.length == 0);
    if (!viaUnknown) {
        meInLikes = likedUsers.some(u => u == iAm.me);
        meInComments = commentedUsers.some(u => u == iAm.me);
        users = likedUsers
            .concat(commentedUsers)
            .filter(u => u !== iAm.me)
            .filter((v, i, a) => a.indexOf(v) === i);
    }

    const viaEls = [];
    if (viaUnknown) {
        viaEls.push("somebody");
    } else {
        if (meInComments) {
            viaEls.push("your comment");
        } else if (meInLikes) {
            viaEls.push("your like");
        }
        users.forEach(u => viaEls.push(html`<a href="/${u}" class="bf2-user-link">${u}</a>`));
    }

    if (viaEls.length > 1) {
        viaEls[viaEls.length - 2] = viaEls[viaEls.length - 2] + " and " + viaEls[viaEls.length - 1];
        viaEls.length--;
    }

    node.querySelector(".post-header").insertAdjacentHTML("beforeend", `<span class="bf2-via-names"> via ${viaEls.join(", ")}</span>`);
});
