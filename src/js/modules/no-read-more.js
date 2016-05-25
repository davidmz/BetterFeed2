import {registerModule} from "./../base/modules";

const module = registerModule("no-read-more", false);

module.watch("a.read-more", a => a.click());
