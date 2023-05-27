import { get } from "./api";
import { spyFetch } from "./fetch-proxy";

const picRegistry = new Map();
const resolvers = new Map();

spyFetch(({ resp }) => {
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

  for (const acc of accounts) {
    setPic(acc.username, acc.profilePictureMediumUrl);
  }
});

const batchTimeout = 1000; // ms
let batchTimer = 0;

export async function getPic(username) {
  let p = picRegistry.get(username);
  if (!p) {
    p = new Promise((resolve) => resolvers.set(username, resolve));
    picRegistry.set(username, p);
    clearTimeout(batchTimer);
    batchTimer = setTimeout(processBatch, batchTimeout);
  }
  return p;
}

function setPic(username, pic) {
  if (!pic) {
    return;
  }
  const resolve = resolvers.get(username);
  if (resolve) {
    resolvers.delete(username);
    resolve(pic);
  } else {
    picRegistry.set(username, Promise.resolve(pic));
  }
}

async function processBatch() {
  batchTimer = 0;
  for (const username of resolvers.keys()) {
    const { users: user } = await get(`/v1/users/${username}`);
    setPic(user.username, user.profilePictureMediumUrl);
  }
}
