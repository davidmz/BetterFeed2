import docLoaded from "./utils/doc-loaded";
import h from "./utils/html";
import forSelect from "./utils/for-select";
import * as inject from "./utils/inject";

const lsKey = "bf2-enabled",
  actions = [];

if (MutationObserver && Promise) {
  docLoaded.then(() => {
    let observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (let i = 0, l = mutation.addedNodes.length; i < l; i++) {
          let node = mutation.addedNodes[i];
          if (node.nodeType === Node.ELEMENT_NODE) {
            actions.forEach((act) => act(node));
          }
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    actions.forEach((act) => act());

    if (localStorage[lsKey] === "1") {
      window.__BetterFeedOnSite = true;
      inject.JavaScript(
        "https://cdn.jsdelivr.net/gh/davidmz/BetterFeed2@v2.18.5/build/better-feed.user.js"
      );
    }
  });
}

actions.push((node = document.body) => {
  let pwdForm = null;
  forSelect(node, ".box-body > form > h3", (node) => {
    if (node.textContent === "Change password") {
      pwdForm = node.parentNode;
    }
  });

  if (!pwdForm || node.querySelector(".bf2-settings-header")) {
    return;
  }

  let check = h("input", { type: "checkbox" }),
    button = h("button.btn.btn-default", "Apply"),
    html = h(
      "div",
      h("h3.bf2-settings-header", "Add-ons"),
      h("p", h("label", check, " Enable BetterFeed")),
      h(
        "p.bf2-settings-description",
        "BetterFeed is an add-on that improves or dramatically alters stock interface of FreeFeed (",
        h(
          "a",
          { href: "https://github.com/davidmz/BetterFeed2", target: "_blank" },
          "details"
        ),
        "). "
      ),
      h("p", button),
      h("hr")
    );

  pwdForm.parentNode.insertBefore(html, pwdForm);

  check.checked = localStorage[lsKey] === "1";

  button.addEventListener("click", () => {
    localStorage[lsKey] = check.checked ? "1" : "";
    location.reload();
  });
});
