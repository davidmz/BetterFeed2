export function spyFetch(spy) {
  const oldFetch = window.fetch;

  window.fetch = (...args) => {
    const req = oldFetch(...args);
    req.then((resp) => {
      const oldJson = resp.json;
      resp.json = async () => {
        const data = await oldJson.call(resp);
        spy({ req: args, resp: data });
        return data;
      };
    });
    return req;
  };
}
