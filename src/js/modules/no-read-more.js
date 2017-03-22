import {registerModule} from "./../base/modules";

const module = registerModule("no-read-more", false);

module.watch("a.read-more", a => a.click());

module.watch(".expand-button > i", a => a.click());
