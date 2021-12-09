import bfRoot from "../utils/bf-root";
import "file-loader?name=[name].[ext]!../../styles/default-userpic-50.png";

export const defaultPic = `${bfRoot}/build/default-userpic-50.png`;
const picRegistry = new Map;

async function picLoad(username) {
    const resp = await (await fetch(`https://davidmz.me/frfrfr/uinfo/upic?username=${username}`)).json();
    return (resp.status === "ok" && resp.data !== "") ? resp.data : defaultPic;
}

export function getPic(username) {
    if (!picRegistry.has(username)) {
        picRegistry.set(username, picLoad(username));
    }
    return picRegistry.get(username);
}

export function setPic(username, pic) {
    picRegistry.set(username, Promise.resolve((pic && pic !== "") ? pic : defaultPic));
}
