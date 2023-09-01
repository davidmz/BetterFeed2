import defaultPic from "../../styles/default-userpic-50.png?url";
import { registerModule } from "../base/modules";
import * as api from "../utils/api";
import closestParent from "../utils/closest-parent";
import LS from "../utils/cross-local-storage";
import { cookieName, getCurrentAuth } from "../utils/current-user-id";
import h from "../utils/html";
import { html } from "../utils/html-tpl";
import IAm from "../utils/i-am";
import Lightbox from "../utils/lightbox";
import { getPic } from "../utils/userpics";

const module = registerModule("switch-accounts");

const CSS_PREFIX = "bf2-switch-dlg-";
const ACC_LIST_KEY = `bfAccounts-freefeed.net`;
const clickHandlers = [
  { selector: `.${CSS_PREFIX}del`, handler: removeAccount },
  { selector: `.${CSS_PREFIX}account`, handler: accountClicked },
  { selector: `.${CSS_PREFIX}add-new`, handler: addAccountClicked },
];

let ls = null;

module.init(() => {
  ls = new LS();

  document.body.addEventListener("click", (e) => {
    clickHandlers.some((h) => {
      let t = closestParent(e.target, h.selector, true);
      if (t) {
        e.preventDefault();
        h.handler(t);
        return true;
      }
      return false;
    });
  });
});

module.watch(".logged-in > .avatar, .logged-in > .userpic", (node) => {
  node
    .appendChild(
      h(
        ".bf2-switch-acc",
        { title: "Switch account" },
        h("span.bf2-switch-acc__icon"),
      ),
    )
    .addEventListener("click", showSwitchDialog);
});

let lb = null;

async function showSwitchDialog() {
  lb = new Lightbox("bf2-switch-account-box");
  lb.showContent(`<p>Loading…</p>`);
  lb.showContent(await genHtml());
}

async function genHtml() {
  let { me } = await IAm.ready;

  let form = h(
    `form.${CSS_PREFIX}new-form`,
    html`
      <p>Please enter username and password of your other account:</p>
      <p>
        <input
          class="form-control"
          type="text"
          name="username"
          placeholder="Username"
          required
        />
      </p>
      <p>
        <input
          class="form-control"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
      </p>
      <p>
        <button type="submit" class="btn btn-default">Add</button>
      </p>
    `,
  );
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let username = form.elements["username"].value;
    let password = form.elements["password"].value;
    (async () => {
      let resp = await api.anonFormPost(
        "/v1/session",
        `username=${encodeURIComponent(username)}&password=${encodeURIComponent(
          password,
        )}`,
      );
      if (resp.err) {
        alert(resp.err);
        return;
      }
      //noinspection UnnecessaryLocalVariableJS
      let {
        users: { username: u },
        authToken,
      } = resp;
      await addAccount(u, authToken);
      lb.showContent(await genHtml());
    })();
  });

  return h(
    "",
    html` <div class="${CSS_PREFIX}header">Switch account to:</div>`,
    h(
      `.${CSS_PREFIX}accounts`,
      (await readAccList()).map(({ username }) => {
        let userPic = h(`img.${CSS_PREFIX}upic`, { src: defaultPic });
        getPic(username).then((pic) => (userPic.src = pic));
        let deleter = h(
          `.${CSS_PREFIX}del`,
          { title: "Remove from list" },
          h("i.fa.fa-times-circle"),
        );
        return h(
          `.${CSS_PREFIX}account${username === me ? ".-current" : ""}`,
          { "data-username": username },
          userPic,
          username,
          deleter,
        );
      }),
    ),
    html` <div class="${CSS_PREFIX}add-new">
      <a><i class="fa fa-plus"></i> Add new account</a>
    </div>`,
    form,
  );
}

function addAccountClicked(el) {
  el.style.display = "none";
  document.body.querySelector(`.${CSS_PREFIX}new-form`).style.display = "block";
}

async function readAccList() {
  let list = await ls.get(ACC_LIST_KEY);
  if (!list) {
    list = [
      { username: (await IAm.ready).me, token: getCurrentAuth().authToken },
    ];
  }
  return list;
}

async function addAccount(username, token) {
  let list = await readAccList();
  const found = list.find((a) => a.username === username);
  if (found) {
    found.token = token;
  } else {
    list.push({ username, token });
  }
  await ls.set(ACC_LIST_KEY, list);
}

function removeAccount(el) {
  if (!confirm("Are you sure?")) return Promise.resolve();
  return (async () => {
    let { me } = await IAm.ready;
    let username = closestParent(el, `.${CSS_PREFIX}account`).dataset[
      "username"
    ];
    if (username === me) return;

    let list = (await readAccList()).filter((a) => a.username !== username);
    if (list.length === 1 && list[0].username === me) {
      await ls.set(ACC_LIST_KEY, null);
    } else {
      await ls.set(ACC_LIST_KEY, list);
    }
    lb.showContent(await genHtml());
  })();
}

async function accountClicked(el) {
  const currentUsername = (await IAm.ready).me;
  let username = el.dataset["username"];
  if (username === currentUsername) return;
  let token = null;
  (await readAccList()).some((a) => {
    if (a.username === username) {
      token = a.token;
      return true;
    }
    return false;
  });

  if (token) {
    lb.showContent("Please wait\u2026");
    // Save the current token of current account
    await addAccount(currentUsername, getCurrentAuth().authToken);

    // Set the new token
    localStorage.setItem(cookieName, token);
    location.reload();
  }
}
