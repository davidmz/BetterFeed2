import { registerModule } from "./../base/modules";
import h from "../utils/html";

const module = registerModule("hide-arabic", false);

let style = null;

module.init(() => {
  style = document.head.appendChild(h("style.bf2-hide-posts")).sheet;
  style.insertRule(
    ".bf2-aggregate-page .bf2-lang-arabic { display: none; }",
    0
  );
});
