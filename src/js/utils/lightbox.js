import h from "../utils/html";

export default class Lightbox {
    /**
     * @param {string} className
     * @param {boolean} modal
     */
    constructor(className = "", modal = false) {
        this._container = h(".bf2-lightbox-container");
        if (className !== "") {
            this._container.classList.add(className)
        }
        let shadow = this._container.appendChild(h(".bf2-lightbox-shadow"));
        /** @var {HTMLElement} */
        this.contentEl = shadow.appendChild(h(".bf2-lightbox-content"));
        shadow.addEventListener("click", e => {
            if (e.target === shadow && !modal) {
                this.hide();
            }
        });
    }

    /**
     * @param {HTMLElement|string} el
     */
    showContent(el) {
        if (typeof el === "string") {
            this.contentEl.innerHTML = el;
        } else {
            this.contentEl.innerHTML = "";
            this.contentEl.appendChild(el);
        }
        document.body.appendChild(this._container);
    }

    hide() {
        this.contentEl.innerHTML = "";
        this._container.parentNode.removeChild(this._container);
    }
}
