import {registerModule} from "./../base/modules";
import LS from "../utils/cross-local-storage";
import h from "../utils/html";
import {html} from "../utils/html-tpl";
import Lightbox from "../utils/lightbox";
import IAm from "../utils/i-am";
import * as api from "../utils/api";
import {defaultPic, getPic} from '../utils/userpics';
import {cookieName, authToken} from '../utils/current-user-id';
import closestParent from "../utils/closest-parent";

const module = registerModule("switch-accounts");

const CSS_PREFIX = "bf2-switch-dlg-";
const ACC_LIST_KEY = `bfAccounts-freefeed.net`;
const clickHandlers = [
    {selector: `.${CSS_PREFIX}del`, handler: removeAccount},
    {selector: `.${CSS_PREFIX}account`, handler: accountClicked},
    {selector: `.${CSS_PREFIX}add-new`, handler: addAccountClicked}
];


let ls = null;

module.init(() => {
    ls = new LS();

    document.body.addEventListener("click", e => {
        clickHandlers.some(h => {
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

module.watch(".logged-in .avatar, .logged-in .userpic", node => {
    node.appendChild(
        h(".bf2-switch-acc", {title: "Switch account"}, h("span.fa.fa-exchange"))
    ).addEventListener("click", showSwitchDialog);

});

let lb = null;

async function showSwitchDialog() {
    lb = new Lightbox("bf2-switch-account-box");
    lb.showContent(`<p>Loading…</p>`);
    lb.showContent(await genHtml());
}

async function genHtml() {
    let {me} = await IAm.ready;

    let form = h(`form.${CSS_PREFIX}new-form`,
        html`
        <p>Please enter username and password of your other account:</p>
        <p><input class="form-control" type="text" name="username" placeholder="Username" required></p>
        <p><input class="form-control" type="password" name="password" placeholder="Password" required></p>
        <p><button type="submit" class="btn btn-default">Add</button></p>
        `
    );
    form.addEventListener("submit", e => {
        e.preventDefault();
        let username = form.elements['username'].value;
        let password = form.elements['password'].value;
        (async() => {
            let d = await api.anonFormPost("/v1/session", `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
            if (d.err) {
                alert(d.err);
                return;
            }
            //noinspection UnnecessaryLocalVariableJS
            let {users:{username: u}, authToken} = d;
            await addAccount(u, authToken);
            lb.showContent(await genHtml());
        })();
    });

    return h("",
        html`<div class="${CSS_PREFIX}header">Switch account to:</div>`,
        h(
            `.${CSS_PREFIX}accounts`,
            (await readAccList()).map(
                ({username}) => {
                    let userPic = h(`img.${CSS_PREFIX}upic`, {src: defaultPic});
                    getPic(username).then(pic => userPic.src = pic);
                    let deleter = h(`.${CSS_PREFIX}del`, {title: "Remove from list"}, h("i.fa.fa-times-circle"));
                    return h(`.${CSS_PREFIX}account${(username == me) ? ".-current" : ""}`, {"data-username": username}, userPic, username, deleter);
                }
            )
        ),
        html`<div class="${CSS_PREFIX}add-new"><a><i class="fa fa-plus"></i> Add new account</a></div>`,
        form
    );
}

function addAccountClicked(el) {
    el.style.display = "none";
    document.body.querySelector(`.${CSS_PREFIX}new-form`).style.display = "block";
}

async function readAccList() {
    let list = await ls.get(ACC_LIST_KEY);
    if (!list) {
        list = [{username: (await IAm.ready).me, token: authToken}];
    }
    return list;
}

async function addAccount(username, token) {
    let list = await readAccList();
    if (list.some(a => a.username === username)) {
        return;
    }
    list.push({username, token});
    await ls.set(ACC_LIST_KEY, list);
}

function removeAccount(el) {
    if (!confirm("Are you sure?")) return Promise.resolve();
    return (async() => {
        let {me} = await IAm.ready;
        let username = closestParent(el, `.${CSS_PREFIX}account`).dataset['username'];
        if (username === me) return;

        let list = (await readAccList()).filter(a => a.username !== username);
        if (list.length == 1 && list[0].username === me) {
            await ls.set(ACC_LIST_KEY, null);
        } else {
            await ls.set(ACC_LIST_KEY, list);
        }
        lb.showContent(await genHtml());
    })();
}

async function accountClicked(el) {
    let username = el.dataset['username'];
    if (username === (await IAm.ready).me) return;
    let token = null;
    (await readAccList()).some(a => {
        if (a.username == username) {
            token = a.token;
            return true;
        }
        return false;
    });

    if (token) {
        lb.hide();
        var d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `${cookieName}=${encodeURIComponent(token)}; path=/; expires=${d.toUTCString()}`;
        location.reload();
    }
}
