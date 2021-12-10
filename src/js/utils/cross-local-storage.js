import Messenger from "./message-rpc";

const frameSrc =
  "https://davidmz.github.io/BetterFeed2/storage.html?_=" + Math.random();
const frameOrigin = "https://davidmz.github.io";

export default class {
  constructor() {
    this.iframe = document.createElement("iframe");
    this.iframe.src = frameSrc;
    this.iframe.style.cssText = `visibility: hidden;
            position: absolute;
            left: 0; top: 0;
            height:0; width:0;
            border: none;`;
    // this.iframe.addEventListener("load", e => console.log(e));
    document.body.appendChild(this.iframe);
    this.msg = new Messenger(this.iframe.contentWindow, frameOrigin);
  }

  get(key) {
    return this.msg.send("get", key);
  }

  set(key, value) {
    return this.msg.send("set", { key, value });
  }
}
