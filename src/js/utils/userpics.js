import bfRoot from "../utils/bf-root";
import "file-loader?name=[name].[ext]!../../styles/default-userpic-50.png";
import { spyFetch } from "./fetch-proxy";

export const defaultPic = `${bfRoot}/build/default-userpic-50.png`;
const picRegistry = new Map();
const resolvers = new Map();

spyFetch(({ req, resp }) => {
  if (!resp || !(typeof resp === "object")) {
    return;
  }
  let { users, subscribers } = resp;
  const accounts = new Set();

  if (users) {
    if (!Array.isArray(users)) {
      accounts.add(users);
    } else {
      for (const user of users) {
        accounts.add(user);
      }
    }
  }
  if (subscribers) {
    for (const user of subscribers) {
      accounts.add(user);
    }
  }

  for (const user of accounts) {
    const pic = user.profilePictureMediumUrl || defaultPic;
    const resolve = resolvers.get(user.username);
    if (resolve) {
      resolve(pic);
    } else {
      picRegistry.set(user.username, Promise.resolve(pic));
    }
  }
});

export async function getPic(username) {
  let p = picRegistry.get(username);
  if (!p) {
    p = new Promise((resolve) => resolvers.set(username, resolve));
    picRegistry.set(username, p);
  }
  return p;
}
