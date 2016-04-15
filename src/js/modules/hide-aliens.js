import {registerModule} from "./../base/modules";
import h from "../utils/html";
import IAm from "../utils/i-am";

const module = registerModule("hide-aliens");
module.required("posts-via");

const chk = h("input", {type: "checkbox"});
const cnt = h("span", "0");
const ui = h("label.bf2-hide-aliens-cont", chk, " hide non-friends posts (", cnt, ")");

module.init(settings => {
    setInterval(() => cnt.innerHTML = document.body.querySelectorAll(".bf2-alien-post").length, 500);

    chk.checked = settings.hideAliens;
    document.body.classList.toggle("bf2-hide-aliens", settings.hideAliens);

    chk.addEventListener("click", () => {
        document.body.classList.toggle("bf2-hide-aliens", chk.checked);
        settings.hideAliens = chk.checked;
        IAm.ready.then(iAm => iAm.saveProps(settings));
    });
});

module.watch(".box-header-timeline", node => node.appendChild(ui));