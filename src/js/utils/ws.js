export default class WS {
    static minReconnectTimeout = 1000;
    static maxReconnectTimeout = 20000;

    constructor(url = "") {
        this.url = url;
        this.ws = null;
        this.onMessage = () => {};
        this.prepareConnect = () => Promise.resolve();
        this.onConnect = () => {};
        this._sendBuf = [];
        this._reconnectTimer = null;
        this._reconnectTimeout = WS.minReconnectTimeout;
    }

    send(m) {
        if (this.ws && this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(m);
        } else {
            this._sendBuf.push(m);
        }
    }

    async connect() {
        this._reconnectTimer = null;
        this._reconnectTimeout *= 1.5;
        if (this._reconnectTimeout > WS.maxReconnectTimeout) {
            this._reconnectTimeout = WS.maxReconnectTimeout;
        }

        try {
            await this.prepareConnect();

            this.ws = new WebSocket(this.url);
            this.ws.onclose = () => this._reconnect();
            this.ws.onerror = () => this._reconnect();
            this.ws.onmessage = e => this.onMessage(JSON.parse(e.data));
            this.ws.onopen = () => this._onopen();
        } catch (e) {
            console.warn(`WS prepare connect error: ${e.message}`);
            this._reconnect();
        }
    }

    _onopen() {
        this._reconnectTimeout = WS.minReconnectTimeout;
        this._sendBuf.forEach(m => this.ws.send(m));
        this._sendBuf = [];
        this.onConnect()
    }

    _reconnect() {
        if (this.ws.readyState == WebSocket.CONNECTING || this.ws.readyState == WebSocket.OPEN) {
            this.ws.close();
        }

        if (this._reconnectTimer === null) {
            this._reconnectTimer = setTimeout(() => this.connect(), this._reconnectTimeout);
        }
    }
}

