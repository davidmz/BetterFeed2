import {authToken} from "./current-user-id";
import WS from "./ws";

const apiRoot = "https://davidmz.me/frfrfr/likecomm";
const wsEndpoint = "wss://davidmz.me/frfrfr/likecomm/watch";

export default class {

    constructor(anonymous = false) {
        this.anonymous = anonymous;
        this.listeners = [];
    }

    like(commId, postId) {
        if (this.anonymous) {
            return Promise.reject("Attempt to like in anonymous mode");
        }
        return this.req(`${apiRoot}/like?comm_id=${encodeURIComponent(commId)}&post_id=${encodeURIComponent(postId)}`, {method: "POST"});
    }

    unlike(commId) {
        if (this.anonymous) {
            return Promise.reject("Attempt to unlike in anonymous mode");
        }
        return this.req(`${apiRoot}/unlike?comm_id=${encodeURIComponent(commId)}`, {method: "POST"});
    }

    async allLikes(commIds) {
        const likes = await this.req(`${apiRoot}/all-likes`, {method: "POST", body: JSON.stringify(commIds)});
        likes.forEach(l => this.listeners.forEach(c => c(l)));
        return null;
    }

    likes(commId) {
        return this.req(`${apiRoot}/likes?comm_id=${encodeURIComponent(commId)}`);
    }

    watch() {
        const ws = new WS(wsEndpoint);
        if (!this.anonymous) {
            ws.prepareConnect = async() => {
                const tt = await this.req(`${apiRoot}/auth`, {method: "POST"});
                ws.url = `${wsEndpoint}?auth=${encodeURIComponent(tt)}`;
            };
        }
        ws.onMessage = msg => this.listeners.forEach(c => c(msg));
        ws.connect();
    }

    onLike(callback) {
        this.listeners.push(callback);
    }

    async req(input, opts = {}) {
        opts.mode = "cors";
        if (!this.anonymous) {
            if (!opts.headers) {
                opts.headers = {};
            }
            opts.headers["X-Authentication-Token"] = authToken;
        }
        const resp = await (await fetch(input, opts)).json();
        if (resp.status == "error") {
            const e = new Error(resp.msg);
            e.code = resp.code;
            throw e;
        }

        return resp.data;
    }
}