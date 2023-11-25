import { registerModule } from "./../base/modules";

registerModule("nonprivate-warn", false).init(() =>
  document.body.classList.add("bf2-non-private-warn"),
);
