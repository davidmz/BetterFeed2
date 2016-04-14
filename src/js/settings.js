import Cell      from "./utils/cell";
import Settings  from "./base/settings";
import Messenger from "./utils/message-rpc";
import forSelect from "./utils/for-select";
import escapeHTML from "./utils/escape-html";


/** page elements fix **/
const version = location.pathname.match(/BetterFeed2\/([^\/]+)/);
if (version) {
    document.querySelector(".version").appendChild(document.createTextNode(version[1]));
}
forSelect(document.body, ".local-link", link => link.href += location.search);
/** page elements fix **/

const sPage = document.querySelector(".content.settings");

// мы на странице настроек
if (sPage) {
    const parentWindow = (window.parent === window) ? window.opener : window.parent;

    if (!parentWindow || !/[?&]origin=([^&]+)/.exec(location.search)) {
        alert("Пожалуйста, откройте эту страницу по ссылке из FreeFeed-а");
    }

    const
        parentOrigin = decodeURIComponent(/[?&]origin=([^&]+)/.exec(location.search)[1]),
        saveButton = document.getElementById("save-settings"),
        checkUpdatesButton = document.getElementById("check-updates"),
        checkBoxes = forSelect(sPage, "input[type='checkbox']"),
        hidePostsFromTA = document.getElementById("hide-posts-from-users"),
        msg = new Messenger();

    /** @type {Settings|null} */
    let settings = null;

    const sendMsg = msg.send.bind(msg, parentWindow, parentOrigin);

    document.getElementById("check-updates").addEventListener("click", e => {
        const btn = e.target;
        btn.disabled = true;
        sendMsg("checkUpdates").then(() => btn.disabled = false);
    });

    saveButton.addEventListener("click", () => {
        saveButton.disabled = true;
        saveButton.style.width = saveButton.offsetWidth + "px";
        saveButton.innerHTML = escapeHTML("Сохраняем\u2026");

        checkBoxes.forEach(box => settings.modules.set(box.id, box.checked));
        {
            settings.hidePostsFrom.clear();
            (hidePostsFromTA.value.toLowerCase().match(/\w+/g) || []).forEach(u => settings.hidePostsFrom.add(u));
        }
        sendMsg("saveSettings", settings.toJSON());
    });

    checkUpdatesButton.addEventListener("click", e => {
        const btn = e.target;
        btn.disabled = true;
        sendMsg("checkUpdates").then(() => btn.disabled = false);
    });

    let isChanged = new Cell(false);
    let initialState = new Map;
    let currentState = () => {
        let state = new Map;
        forSelect(sPage, "input, textarea", input => {
            state.set(input.id, (input.type === "checkbox") ? input.checked : input.value);
        });
        return state;
    };
    let updateInputs = () => {
        checkBoxes.forEach(box => box.checked = settings.modules.get(box.id));
        {
            let s = "";
            settings.hidePostsFrom.forEach(u => s += `, ${u}`);
            hidePostsFromTA.value = s.substr(2);
        }
    };

    sendMsg("getSettings").then(sData => {
        settings = new Settings(sData, true);
        updateInputs();

        // Взаимосвязь между флагами
        forSelect(sPage, "[data-disabled-if]", node => {
            let k = node.dataset["disabledIf"],
                c = document.getElementById(k);
            if (c) {
                Cell.fromInput(c).onValue(checked => node.disabled = checked);
            }
        });

        forSelect(sPage, "[data-enabled-if]", node => {
            let k = node.dataset["enabledIf"],
                c = document.getElementById(k);
            if (c) {
                Cell.fromInput(c).onValue(checked => node.disabled = !checked);
            }
        });

        initialState = currentState();

        sPage.classList.remove("hidden");
        sPage.previousElementSibling.classList.add("hidden");
    });

    let changeHandler = () => {
        let st = currentState(), changed = false;
        st.forEach((v, k) => changed = changed || (v !== initialState.get(k)));
        isChanged.value = changed;
    };

    sPage.addEventListener("input", changeHandler);
    sPage.addEventListener("change", changeHandler);

    isChanged.distinct().onValue(s => saveButton.disabled = !s);
}


