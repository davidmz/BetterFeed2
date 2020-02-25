import {registerModule} from "./../base/modules";

const module = registerModule("show-timestamps", false);

module.watch(".post-lock-icon", t => t.click());
