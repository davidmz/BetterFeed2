import userInfo from "../utils/user-info";
import default50 from "file?name=[name].[ext]!../../styles/default-userpic-50.png";

export const defaultPic = default50;
const picRegistry = new Map;

async function picLoad(username) {
    let inf = await userInfo(username);
    let p = inf.users.profilePictureMediumUrl;
    return (p && p !== "") ? p : defaultPic;
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
