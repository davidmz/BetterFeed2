export function JavaScript(path) {
    const e = document.createElement("script");
    e.src = path;
    e.type = "text/javascript";
    e.charset = "utf-8";
    e.async = true;
    document.head.appendChild(e);
    return e;
}

export function CSS(path, media = "all") {
    const e = document.createElement('link');
    e.rel = "stylesheet";
    e.type = "text/css";
    e.charset = "utf-8";
    e.href = path;
    e.media = media;
    document.head.appendChild(e);
    return e;
}