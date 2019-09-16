import {registerModule} from "./../base/modules";

const module = registerModule("show-timestamps", false);

module.watch(".post-timestamps-toggle", t => t.click());
