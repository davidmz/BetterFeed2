import Cell from "./utils/cell";
import Settings from "./base/settings";
import Messenger from "./utils/message-rpc";
import forSelect from "./utils/for-select";
import escapeHTML from "./utils/escape-html";

const sPage = document.querySelector(".content.settings");

// мы на странице настроек
if (sPage) {
  const parentWindow = window.parent === window ? window.opener : window.parent;

  if (!parentWindow) {
    alert("Пожалуйста, откройте эту страницу по ссылке из FreeFeed-а");
  }

  const parentOrigin = document.querySelector(
      'meta[name="parentOrigin"]',
    ).content,
    betterFeedVersion = document.querySelector(
      'meta[name="betterFeedVersion"]',
    ).content,
    saveButton = document.getElementById("save-settings"),
    checkUpdatesButton = document.getElementById("check-updates"),
    checkBoxes = forSelect(sPage, "input[type='checkbox']"),
    ccModeInputs = forSelect(sPage, "input[name='comment-clouds-mode']"),
    msg = new Messenger(parentWindow, parentOrigin);

  /** @type {Settings|null} */
  let settings = null;

  document
    .querySelector(".version")
    .appendChild(document.createTextNode(betterFeedVersion));

  saveButton.addEventListener("click", () => {
    saveButton.disabled = true;
    saveButton.style.width = saveButton.offsetWidth + "px";
    saveButton.innerHTML = escapeHTML("Сохраняем\u2026");

    checkBoxes.forEach((box) => settings.modules.set(box.id, box.checked));
    settings.commentCloudsMode = parseInt(getRadioValue(ccModeInputs));
    msg.send("saveSettings", settings.toJSON());
  });

  checkUpdatesButton.addEventListener("click", (e) => {
    const btn = e.target;
    btn.disabled = true;
    msg.send("checkUpdates").then(() => (btn.disabled = false));
  });

  let isChanged = new Cell(false);
  let initialState = new Map();
  let currentState = () => {
    let state = new Map();
    forSelect(sPage, "input, textarea", (input) => {
      if (input.id) {
        state.set(
          input.id,
          input.type === "checkbox" ? input.checked : input.value,
        );
      }
    });
    state.set("comment-clouds-mode", getRadioValue(ccModeInputs));
    return state;
  };
  let updateInputs = () => {
    checkBoxes.forEach((box) => (box.checked = settings.modules.get(box.id)));
    setRadioValue(ccModeInputs, settings.commentCloudsMode);
  };

  msg.send("getSettings").then((sData) => {
    settings = new Settings(sData, true);
    updateInputs();

    // Взаимосвязь между флагами
    forSelect(sPage, "[data-disabled-if]", (node) => {
      let k = node.dataset["disabledIf"],
        c = document.getElementById(k);
      if (c) {
        Cell.fromInput(c).onValue((checked) => (node.disabled = checked));
      }
    });

    forSelect(sPage, "[data-enabled-if]", (node) => {
      let k = node.dataset["enabledIf"],
        c = document.getElementById(k);
      if (c) {
        Cell.fromInput(c).onValue((checked) => (node.disabled = !checked));
      }
    });

    initialState = currentState();

    sPage.classList.remove("hidden");
    sPage.previousElementSibling.classList.add("hidden");
  });

  let changeHandler = () => {
    let st = currentState(),
      changed = false;
    st.forEach((v, k) => (changed = changed || v !== initialState.get(k)));
    isChanged.value = changed;
  };

  sPage.addEventListener("input", changeHandler);
  sPage.addEventListener("change", changeHandler);

  isChanged.distinct().onValue((s) => (saveButton.disabled = !s));
}

function getRadioValue(radioInputs) {
  return radioInputs.reduce(
    (prevValue, r) => (r.checked ? r.value : prevValue),
    null,
  );
}

function setRadioValue(radioInputs, value) {
  radioInputs.forEach((r) => (r.checked = r.value == value));
}
