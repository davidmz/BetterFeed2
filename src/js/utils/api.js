import { getCurrentAuth } from "./current-user-id";

const apiRoot = "https://freefeed.net";

export async function get(path) {
  const resp = await fetch(apiURL(path), {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + getCurrentAuth().authToken,
    },
  }).then((r) => r.json());

  if (resp && "err" in resp) {
    throw new Error(resp.err);
  }
  return resp;
}

export async function put(path, body) {
  const resp = await fetch(apiURL(path), {
    method: "PUT",
    body,
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + getCurrentAuth().authToken,
    },
  }).then((r) => r.json());

  if (resp && "err" in resp) {
    throw new Error(resp.err);
  }
  return resp;
}

export async function anonFormPost(path, body) {
  const resp = await fetch(apiURL(path), {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json",
      Authorization: "Bearer " + getCurrentAuth().authToken,
    },
  }).then((r) => r.json());

  if (resp && "err" in resp) {
    throw new Error(resp.err);
  }
  return resp;
}

function apiURL(path) {
  return (
    apiRoot +
    path +
    (path.indexOf("?") !== -1 ? "&" : "?") +
    "_initiator=betterfeed2"
  );
}
