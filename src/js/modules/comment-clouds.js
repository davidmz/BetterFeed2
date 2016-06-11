import {registerModule} from "./../base/modules";
import h from "../utils/html";
import {getPic} from "../utils/userpics";
import IAm from "../utils/i-am";
import {siteDomain} from "../utils/current-user-id";
import "../../styles/comment-clouds.less";

const module = registerModule("comment-clouds");
module.active = (siteDomain !== "gamma.freefeed.net");

const usersWithAvatars = new Map();
let withAvatars = false;
let style = null;

module.init(settings => {
    style = document.head.appendChild(h("style.bf2-comments-avatars")).sheet;
    withAvatars = (settings.commentCloudsMode === 2);
    if (withAvatars) {
        document.body.classList.add("bf2-comments-with-avatars");
    }
});

module.watch(".comment[data-author]", async(node) => {
    if (node.querySelector(".bf2-comment-ex")) {
        return;
    }
    if (withAvatars) {
        const author = node.dataset["author"];
        node.appendChild(h(".bf2-comment-avatar.bf2-comment-ex"));

        if (!usersWithAvatars.has(author)) {
            usersWithAvatars.set(author, true);
            const pic = await getPic(author || (await IAm.ready).me);
            style.insertRule(`.comment[data-author="${author}"] .bf2-comment-avatar { background-image: url(${pic}); }`, 0);
        }
    } else {
        node.appendChild(h("i.fa.fa-comment.icon.bf2-ico-bg.bf2-comment-ex"));
    }
});
