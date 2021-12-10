import { registerModule } from "../base/modules";

const module = registerModule("no-comment-more", false);

module.watch(".comment-tail__actions", (it) => {
  const actions = it.querySelectorAll(".comment-tail__action");
  if (actions.length === 1) {
    it.hidden = true;
  } else {
    actions[actions.length - 1].hidden = true;
  }
});
