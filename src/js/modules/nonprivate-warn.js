import h from "../utils/html";
import { registerModule } from "./../base/modules";

registerModule("nonprivate-warn", false).watch(".comment-textarea", (node) => {
  /** @type {HTMLElement} */
  const commentNode = node.closest(".comment");
  if (commentNode.nextElementSibling) {
    return;
  }

  const postIcon = commentNode
    .closest(".post-body")
    .querySelector(".post-footer-icon svg");
  if (!postIcon || postIcon.classList.contains("post-private-icon")) {
    return;
  }

  commentNode.appendChild(
    h(".bf2-nonprivate-warning", "Note: this post is not private"),
  );
});
