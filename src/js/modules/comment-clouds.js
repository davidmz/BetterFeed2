import "../../styles/comment-clouds.less";
import h from "../utils/html";
import IAm from "../utils/i-am";
import { getPic } from "../utils/userpics";
import { registerModule } from "./../base/modules";

const module = registerModule("comment-clouds");

let withAvatars = false;

module.init((settings) => {
  withAvatars = settings.commentCloudsMode === 2;
  if (withAvatars) {
    document.body.classList.add("bf2-comments-with-avatars");
  }
});

module.watch(".comment[data-author]", async (node) => {
  if (
    node.querySelector(".bf2-comment-ex") ||
    node.classList.contains("comment-is-hidden")
  ) {
    return;
  }
  if (withAvatars) {
    const author = node.dataset["author"];
    const ava = node.appendChild(h(".bf2-comment-avatar.bf2-comment-ex"));
    const pic = await getPic(author || (await IAm.ready).me);
    ava.style.backgroundImage = "url(" + pic + ")";
  } else {
    node.appendChild(h("i.fa.fa-comment.icon.bf2-ico-bg.bf2-comment-ex"));
  }
});
