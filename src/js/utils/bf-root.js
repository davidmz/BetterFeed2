let myRoot = "https://davidmz.me/betterfeed-cdn/" + localStorage['bf2-version'];
if (document.currentScript) {
    let pr = document.currentScript.src.split("/");
    myRoot = pr.slice(0, pr.length - 2).join("/");
}

export default myRoot;
