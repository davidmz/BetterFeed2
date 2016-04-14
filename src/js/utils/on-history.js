const listeners = [];

export default function (callback) {
    listeners.push(callback);
    callback(location);
}

const oldPushState = history.pushState.bind(history),
    oldReplaceState = history.replaceState.bind(history);

history.pushState = (state, title, url) => {
    oldPushState(state, title, url);
    listeners.forEach(c => c(location));
};

history.replaceState = (state, title, url) => {
    oldReplaceState(state, title, url);
    listeners.forEach(c => c(location));
};

window.addEventListener("popstate", () => listeners.forEach(c => c(location)));



