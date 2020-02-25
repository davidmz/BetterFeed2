import {registerModule} from "./../base/modules";

const module = registerModule("show-timestamps", false);

module.watch(".post-lock-icon", t => {
    const event = document.createEvent("MouseEvents");
    event.initEvent("click", true, true);
    t.dispatchEvent(event);
});
