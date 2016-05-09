import {authToken} from './current-user-id';

const apiRoot = "https://freefeed.net";

export function get(path, token = authToken) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', apiRoot + path);
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', token);
        xhr.onload = function () {
            if (xhr.response && "err" in xhr.response) {
                reject(xhr.response.err);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send();
    });
}

export function put(path, body) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', apiRoot + path);
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', authToken);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.onload = function () {
            if (xhr.response && "err" in xhr.response) {
                reject(xhr.response.err);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send(body);
    });
}

export function del(path, body) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('DELETE', apiRoot + path);
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', authToken);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.onload = function () {
            if (xhr.response && "err" in xhr.response) {
                reject(xhr.response.err);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send(body);
    });
}

export function post(path, body) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', apiRoot + path);
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', authToken);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.onload = function () {
            if (xhr.response && "err" in xhr.response) {
                reject(xhr.response.err);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send(body);
    });
}

export function anonFormPost(path, body) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', apiRoot + path);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.onload = function () {
            if (xhr.response && "err" in xhr.response) {
                reject(xhr.response.err);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send(body);
    });
}