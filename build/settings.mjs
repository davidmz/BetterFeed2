class c {
  constructor(e) {
    this._value = e, this._listeners = /* @__PURE__ */ new Set();
  }
  get value() {
    return this._value;
  }
  set value(e) {
    this._value = e, this.poke();
  }
  poke() {
    this._listeners.forEach((e) => e(this._value));
  }
  onValue(e) {
    return this._listeners.add(e), e(this.value), this;
  }
  unListen(e) {
    return this._listeners.delete(e), this;
  }
  /**
   * @param {function(Cell, *)} foo
   * @param {*} [initial]
   * @return {Cell}
   */
  derive(e, t) {
    var s = new c(t);
    return this.onValue((n) => e(s, n)), s;
  }
  /**
   * @param {Array.<Cell>} cells
   * @return {Cell}
   */
  static combine(...e) {
    const t = new c(e.map((s) => s.value));
    return e.forEach(
      (s, n) => s.onValue((a) => {
        let l = t.value;
        l[n] = a, t.value = l;
      })
    ), t;
  }
  map(e) {
    return this.derive((t, s) => t.value = e(s));
  }
  filter(e) {
    return this.derive((t, s) => e(s) && (t.value = s));
  }
  throttle(e) {
    let t, s = null;
    return this.derive((n, a) => {
      t = a, s || (s = setTimeout(() => {
        t !== void 0 && (n.value = this.value, t = void 0), s = null;
      }, e));
    }, this.value);
  }
  /**
   * For cell with Promise's values
   * @param {*} [initial]
   * @return {Cell}
   */
  latestPromise(e) {
    var t = null;
    return this.derive((s, n) => {
      let a = n;
      t = a, a.then((l) => {
        a === t && (s.value = l);
      });
    }, e);
  }
  distinct() {
    var e;
    return this.derive((t, s) => {
      s !== e && (e = s, t.value = s);
    });
  }
  static fromInput(e, t, s) {
    if (!e || !(e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLSelectElement))
      return new c(null);
    var n = "value";
    e instanceof HTMLInputElement && (e.type === "checkbox" || e.type === "radio") && (n = "checked");
    var a = t ? t.split(" ") : ["input", "change"];
    s = s || n;
    var l = () => s === "self" ? e : e[s], h = new c(l());
    return a.forEach(
      (o) => e.addEventListener(o, () => h.value = l())
    ), h;
  }
  static ticker(e) {
    let t = new c(!0);
    return setInterval(() => t.value = !0, e), t;
  }
}
const I = "matches" in HTMLElement.prototype ? "matches" : "msMatchesSelector";
function L(d, e) {
  return d[I](e);
}
const v = (d, e, t) => {
  if (d === null)
    return [];
  var s = d.querySelectorAll(e), n = s ? Array.prototype.slice.call(s) : [];
  if (L(d, e) && n.unshift(d), t)
    for (var a = 0, l = n.length; a < l; a++)
      t(n[a]);
  return n;
}, b = /* @__PURE__ */ new Map();
class S {
  constructor(e = null, t = !1) {
    this.modules = /* @__PURE__ */ new Map(), b.forEach((s) => {
      s.alwaysEnabled || this.modules.set(s.name, s.enabledByDefault);
    }), this.hideAliens = !1, this.commentCloudsMode = 2, e && ((e.modules || []).forEach(([s, n]) => {
      (t || this.modules.has(s)) && this.modules.set(s, !!n);
    }), this.hideAliens = !!e.hideAliens, (e.commentCloudsMode === 1 || e.commentCloudsMode === 2) && (this.commentCloudsMode = e.commentCloudsMode));
  }
  toJSON() {
    const e = { modules: [] };
    return this.modules.forEach((t, s) => e.modules.push([s, t])), e.hideAliens = this.hideAliens, e.commentCloudsMode = this.commentCloudsMode, e;
  }
  /**
   * @param {Module} m
   * @return {boolean}
   */
  isModuleEnabled(e) {
    return e && (e.alwaysEnabled || !this.modules.has(e.name) && e.enabledByDefault || this.modules.get(e.name)) && !e.requiredModules.map((t) => b.get(t)).some((t) => !this.isModuleEnabled(t));
  }
}
let V = 1;
const _ = "@response";
class q {
  constructor(e = null, t = "") {
    this.__responders = /* @__PURE__ */ new Map(), this.__listeners = /* @__PURE__ */ new Map(), this.defaultWindow = e, this.defaultOrigin = t, window.addEventListener("message", (s) => {
      if (typeof s.data != "object")
        return;
      const {
        data: { action: n, requestId: a, value: l },
        source: h,
        origin: o
      } = s;
      if (n === _ && this.__responders.has(a))
        this.__responders.get(a)(l), this.__responders.delete(a);
      else if (this.__listeners.has(n)) {
        let p = this.__listeners.get(n)(l);
        h.postMessage(
          { action: _, requestId: a, value: p },
          o
        );
      }
    });
  }
  /**
   *
   * @param {String} action
   * @param {*} value
   * @return {Promise}
   */
  send(e, t = null) {
    return this.sendEx(this.defaultWindow, this.defaultOrigin, e, t);
  }
  /**
   *
   * @param {Window} window
   * @param {String} origin
   * @param {String} action
   * @param {*} value
   * @return {Promise}
   */
  sendEx(e, t, s, n = null) {
    return new Promise((a) => {
      const l = V++;
      this.__responders.set(l, a), e.postMessage({ action: s, requestId: l, value: n }, t);
    });
  }
  /**
   *
   * @param {String} action
   * @param {function} callback
   */
  on(e, t) {
    this.__listeners.set(e, t);
  }
}
function x(d = "") {
  return d.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
const u = document.querySelector(".content.settings");
if (u) {
  const d = window.parent === window ? window.opener : window.parent;
  d || alert("Пожалуйста, откройте эту страницу по ссылке из FreeFeed-а");
  const e = document.querySelector(
    'meta[name="parentOrigin"]'
  ).content, t = document.querySelector(
    'meta[name="betterFeedVersion"]'
  ).content, s = document.getElementById("save-settings"), n = document.getElementById("check-updates"), a = v(u, "input[type='checkbox']"), l = v(u, "input[name='comment-clouds-mode']"), h = new q(d, e);
  let o = null;
  document.querySelector(".version").appendChild(document.createTextNode(t)), s.addEventListener("click", () => {
    s.disabled = !0, s.style.width = s.offsetWidth + "px", s.innerHTML = x("Сохраняем…"), a.forEach((r) => o.modules.set(r.id, r.checked)), o.commentCloudsMode = parseInt(k(l)), h.send("saveSettings", o.toJSON());
  }), n.addEventListener("click", (r) => {
    const i = r.target;
    i.disabled = !0, h.send("checkUpdates").then(() => i.disabled = !1);
  });
  let p = new c(!1), w = /* @__PURE__ */ new Map(), E = () => {
    let r = /* @__PURE__ */ new Map();
    return v(u, "input, textarea", (i) => {
      i.id && r.set(
        i.id,
        i.type === "checkbox" ? i.checked : i.value
      );
    }), r.set("comment-clouds-mode", k(l)), r;
  }, y = () => {
    a.forEach((r) => r.checked = o.modules.get(r.id)), T(l, o.commentCloudsMode);
  };
  h.send("getSettings").then((r) => {
    o = new S(r, !0), y(), v(u, "[data-disabled-if]", (i) => {
      let f = i.dataset.disabledIf, m = document.getElementById(f);
      m && c.fromInput(m).onValue((g) => i.disabled = g);
    }), v(u, "[data-enabled-if]", (i) => {
      let f = i.dataset.enabledIf, m = document.getElementById(f);
      m && c.fromInput(m).onValue((g) => i.disabled = !g);
    }), w = E(), u.classList.remove("hidden"), u.previousElementSibling.classList.add("hidden");
  });
  let M = () => {
    let r = E(), i = !1;
    r.forEach((f, m) => i = i || f !== w.get(m)), p.value = i;
  };
  u.addEventListener("input", M), u.addEventListener("change", M), p.distinct().onValue((r) => s.disabled = !r);
}
function k(d) {
  return d.reduce(
    (e, t) => t.checked ? t.value : e,
    null
  );
}
function T(d, e) {
  d.forEach((t) => t.checked = t.value == e);
}
