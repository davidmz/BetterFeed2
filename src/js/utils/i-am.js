import * as api from './api';
import * as uPics from './userpics';
import h from "./html";

const prefsName = "me.davidmz.BetterFeed2";

export default class IAm {
    constructor() {
        this.me = null;
        this.myID = null;
        this.myScreenName = null;
        this.friends = [];
        this.readers = [];
        this.banIds = [];
        this.bf2Props = {};

        this._savePropsQueue = [];
        this._savingPropsNow = false;
        this._savingIndicator = h(".bf2-saving-settings-indicator", "Saving settings…");
    }

    whoIs(username) {
        let flags = 0;
        if (username === this.me) flags |= IAm.ME;
        if (this.friends.indexOf(username) !== -1) flags |= IAm.FRIEND;
        if (this.readers.indexOf(username) !== -1) flags |= IAm.READER;
        return flags;
    }

    isBanned(userId) {
        return (this.banIds.indexOf(userId) !== -1);
    }

    /**
     * @param {Settings} s
     */
    saveProps(s) {
        this._savePropsQueue.push(s.toJSON());
        return this._saveProps();
    }

    /**
     * Последовательное сохранение настроек по очереди
     * @private
     */
    async _saveProps() {
        if (this._savingPropsNow) return;

        document.body.appendChild(this._savingIndicator);
        this._savingPropsNow = true;
        while (this._savePropsQueue.length > 0) {
            const json = this._savePropsQueue.shift(), nulls = {};
            for (let k in json) if (json.hasOwnProperty(k)) nulls[k] = null;
            await api.put(`/v1/users/${this.myID}`, JSON.stringify({user: {frontendPreferences: {[prefsName]: json}}}));
        }
        this._savingPropsNow = false;
        document.body.removeChild(this._savingIndicator);
    }
}


IAm.ME = 1 << 0;
IAm.FRIEND = 1 << 1;
IAm.READER = 1 << 2;

IAm.ready = null;

IAm.update = () => {
    IAm.ready = api.get('/v2/users/whoami').then(resp => {
        const iAm = new IAm();
        iAm.me = resp.users.username;
        iAm.myID = resp.users.id;
        iAm.myScreenName = resp.users.screenName;
        uPics.setPic(resp.users.username, resp.users.profilePictureMediumUrl);
        iAm.friends = resp.subscribers.map(it => {
            uPics.setPic(it.username, it.profilePictureMediumUrl);
            return it.username;
        });
        iAm.readers = resp.users.subscribers.map(it => {
            uPics.setPic(it.username, it.profilePictureMediumUrl);
            return it.username;
        });
        iAm.banIds = resp.users.banIds;
        iAm.bf2Props = (resp.users.frontendPreferences[prefsName] || {});

        return iAm;
    });
};

IAm.update();

