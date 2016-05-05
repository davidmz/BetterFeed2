import {registerModule} from "./../base/modules";
import LS from "../utils/cross-local-storage";
import h from "../utils/html";
import {html, isSafeHTML} from "../utils/html-tpl";
import Lightbox from "../utils/lightbox";
import IAm from "../utils/i-am";
import {defaultPic, getPic} from '../utils/userpics';
import {siteDomain, cookieName, authToken} from '../utils/current-user-id';

const module = registerModule("switch-accounts");

const ACC_LIST_KEY = `bfAccounts-freefeed.net`;

let ls = null;

module.init(() => {
    ls = new LS();
});

module.watch(".logged-in .avatar", node => {
    node.appendChild(
        h(".bf2-switch-acc", {title: "Switch account"}, h("span.fa.fa-exchange"))
    ).addEventListener("click", showSwitchDialog);

});

let lb = null;

async function showSwitchDialog() {
    lb = new Lightbox("bf2-switch-account-box");
    lb.showContent(`<p>Loading…</p>`);
    lb.contentEl.innerHTML = await genHtml();
}

async function genHtml() {
    const CSS_PREFIX = "bf2-switch-dlg-";
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
            let d = await fetch("/v1/session", {
                method: "post",
                headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            }).then(j => j.json());

            if (d.err) {
                alert(d.err);
                return;
            }
            //noinspection UnnecessaryLocalVariableJS
            let {users:{username: u}, authToken} = d;
            // await addAccount(u, authToken);
            lb.contentEl.innerHTML = await genHtml();
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

async function readAccList() {
    let list = await ls.get(ACC_LIST_KEY);
    if (!list) {
        list = [{username: (await IAm.ready).me, token: authToken}];
    }
    return list;
}
