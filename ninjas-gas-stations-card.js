/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const U = globalThis, F = U.ShadowRoot && (U.ShadyCSS === void 0 || U.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, q = Symbol(), X = /* @__PURE__ */ new WeakMap();
let ht = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== q) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (F && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = X.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && X.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const vt = (s) => new ht(typeof s == "string" ? s : s + "", void 0, q), dt = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, o) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[o + 1], s[0]);
  return new ht(e, s, q);
}, bt = (s, t) => {
  if (F) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), r = U.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, tt = F ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return vt(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: yt, defineProperty: wt, getOwnPropertyDescriptor: At, getOwnPropertyNames: xt, getOwnPropertySymbols: Et, getPrototypeOf: St } = Object, R = globalThis, et = R.trustedTypes, Ct = et ? et.emptyScript : "", Pt = R.reactiveElementPolyfillSupport, M = (s, t) => s, H = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? Ct : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, t) {
  let e = s;
  switch (t) {
    case Boolean:
      e = s !== null;
      break;
    case Number:
      e = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(s);
      } catch {
        e = null;
      }
  }
  return e;
} }, Z = (s, t) => !yt(s, t), st = { attribute: !0, type: String, converter: H, reflect: !1, useDefault: !1, hasChanged: Z };
Symbol.metadata ??= Symbol("metadata"), R.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let A = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = st) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && wt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: o } = At(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: r, set(n) {
      const l = r?.call(this);
      o?.call(this, n), this.requestUpdate(t, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? st;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const t = St(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const e = this.properties, i = [...xt(e), ...Et(e)];
      for (const r of i) this.createProperty(r, e[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, r] of e) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const r = this._$Eu(e, i);
      r !== void 0 && this._$Eh.set(r, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const r of i) e.unshift(tt(r));
    } else t !== void 0 && e.push(tt(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return bt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, i);
    if (r !== void 0 && i.reflect === !0) {
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : H).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : H;
      this._$Em = r;
      const l = n.fromAttribute(e, o.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, r = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (o = this[t]), i ??= n.getPropertyOptions(t), !((i.hasChanged ?? Z)(o, e) || i.useDefault && i.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: r, wrapped: o }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), o !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, o] of i) {
        const { wrapped: n } = o, l = this[r];
        n !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, o, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
A.elementStyles = [], A.shadowRootOptions = { mode: "open" }, A[M("elementProperties")] = /* @__PURE__ */ new Map(), A[M("finalized")] = /* @__PURE__ */ new Map(), Pt?.({ ReactiveElement: A }), (R.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis, it = (s) => s, D = K.trustedTypes, rt = D ? D.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, pt = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, ut = "?" + $, Mt = `<${ut}>`, w = document, z = () => w.createComment(""), k = (s) => s === null || typeof s != "object" && typeof s != "function", Y = Array.isArray, zt = (s) => Y(s) || typeof s?.[Symbol.iterator] == "function", W = `[ 	
\f\r]`, C = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ot = /-->/g, nt = />/g, b = RegExp(`>|${W}(?:([^\\s"'>=/]+)(${W}*=${W}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), at = /'/g, lt = /"/g, mt = /^(?:script|style|textarea|title)$/i, kt = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), p = kt(1), E = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), ct = /* @__PURE__ */ new WeakMap(), y = w.createTreeWalker(w, 129);
function gt(s, t) {
  if (!Y(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return rt !== void 0 ? rt.createHTML(t) : t;
}
const Nt = (s, t) => {
  const e = s.length - 1, i = [];
  let r, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = C;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let d, u, h = -1, f = 0;
    for (; f < a.length && (n.lastIndex = f, u = n.exec(a), u !== null); ) f = n.lastIndex, n === C ? u[1] === "!--" ? n = ot : u[1] !== void 0 ? n = nt : u[2] !== void 0 ? (mt.test(u[2]) && (r = RegExp("</" + u[2], "g")), n = b) : u[3] !== void 0 && (n = b) : n === b ? u[0] === ">" ? (n = r ?? C, h = -1) : u[1] === void 0 ? h = -2 : (h = n.lastIndex - u[2].length, d = u[1], n = u[3] === void 0 ? b : u[3] === '"' ? lt : at) : n === lt || n === at ? n = b : n === ot || n === nt ? n = C : (n = b, r = void 0);
    const _ = n === b && s[l + 1].startsWith("/>") ? " " : "";
    o += n === C ? a + Mt : h >= 0 ? (i.push(d), a.slice(0, h) + pt + a.slice(h) + $ + _) : a + $ + (h === -2 ? l : _);
  }
  return [gt(s, o + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class N {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let o = 0, n = 0;
    const l = t.length - 1, a = this.parts, [d, u] = Nt(t, e);
    if (this.el = N.createElement(d, i), y.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = y.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const h of r.getAttributeNames()) if (h.endsWith(pt)) {
          const f = u[n++], _ = r.getAttribute(h).split($), T = /([.?@])?(.*)/.exec(f);
          a.push({ type: 1, index: o, name: T[2], strings: _, ctor: T[1] === "." ? Lt : T[1] === "?" ? Tt : T[1] === "@" ? Ut : j }), r.removeAttribute(h);
        } else h.startsWith($) && (a.push({ type: 6, index: o }), r.removeAttribute(h));
        if (mt.test(r.tagName)) {
          const h = r.textContent.split($), f = h.length - 1;
          if (f > 0) {
            r.textContent = D ? D.emptyScript : "";
            for (let _ = 0; _ < f; _++) r.append(h[_], z()), y.nextNode(), a.push({ type: 2, index: ++o });
            r.append(h[f], z());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ut) a.push({ type: 2, index: o });
      else {
        let h = -1;
        for (; (h = r.data.indexOf($, h + 1)) !== -1; ) a.push({ type: 7, index: o }), h += $.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const i = w.createElement("template");
    return i.innerHTML = t, i;
  }
}
function S(s, t, e = s, i) {
  if (t === E) return t;
  let r = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const o = k(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(s), r._$AT(s, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = r : e._$Cl = r), r !== void 0 && (t = S(s, r._$AS(s, t.values), r, i)), t;
}
class Ot {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, r = (t?.creationScope ?? w).importNode(e, !0);
    y.currentNode = r;
    let o = y.nextNode(), n = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let d;
        a.type === 2 ? d = new L(o, o.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(o, a.name, a.strings, this, t) : a.type === 6 && (d = new Ht(o, this, t)), this._$AV.push(d), a = i[++l];
      }
      n !== a?.index && (o = y.nextNode(), n++);
    }
    return y.currentNode = w, r;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class L {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, r) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = S(this, t, e), k(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== E && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : zt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && k(this._$AH) ? this._$AA.nextSibling.data = t : this.T(w.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = N.createElement(gt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const o = new Ot(r, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = ct.get(t.strings);
    return e === void 0 && ct.set(t.strings, e = new N(t)), e;
  }
  k(t) {
    Y(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const o of t) r === e.length ? e.push(i = new L(this.O(z()), this.O(z()), this, this.options)) : i = e[r], i._$AI(o), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = it(t).nextSibling;
      it(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class j {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, r, o) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = c;
  }
  _$AI(t, e = this, i, r) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = S(this, t, e, 0), n = !k(t) || t !== this._$AH && t !== E, n && (this._$AH = t);
    else {
      const l = t;
      let a, d;
      for (t = o[0], a = 0; a < o.length - 1; a++) d = S(this, l[i + a], e, a), d === E && (d = this._$AH[a]), n ||= !k(d) || d !== this._$AH[a], d === c ? t = c : t !== c && (t += (d ?? "") + o[a + 1]), this._$AH[a] = d;
    }
    n && !r && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Lt extends j {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class Tt extends j {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class Ut extends j {
  constructor(t, e, i, r, o) {
    super(t, e, i, r, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = S(this, t, e, 0) ?? c) === E) return;
    const i = this._$AH, r = t === c && i !== c || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, o = t !== c && (i === c || r);
    r && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ht {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    S(this, t);
  }
}
const Dt = K.litHtmlPolyfillSupport;
Dt?.(N, L), (K.litHtmlVersions ??= []).push("3.3.3");
const Rt = (s, t, e) => {
  const i = e?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const o = e?.renderBefore ?? null;
    i._$litPart$ = r = new L(t.insertBefore(z(), o), o, void 0, e ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis;
class x extends A {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Rt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return E;
  }
}
x._$litElement$ = !0, x.finalized = !0, J.litElementHydrateSupport?.({ LitElement: x });
const jt = J.litElementPolyfillSupport;
jt?.({ LitElement: x });
(J.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ft = (s) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(s, t);
  }) : customElements.define(s, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const It = { attribute: !0, type: String, converter: H, reflect: !1, hasChanged: Z }, Gt = (s = It, t, e) => {
  const { kind: i, metadata: r } = e;
  let o = globalThis.litPropertyMetadata.get(r);
  if (o === void 0 && globalThis.litPropertyMetadata.set(r, o = /* @__PURE__ */ new Map()), i === "setter" && ((s = Object.create(s)).wrapped = !0), o.set(e.name, s), i === "accessor") {
    const { name: n } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(n, a, s, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(n, void 0, s, l), l;
    } };
  }
  if (i === "setter") {
    const { name: n } = e;
    return function(l) {
      const a = this[n];
      t.call(this, l), this.requestUpdate(n, a, s, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function I(s) {
  return (t, e) => typeof e == "object" ? Gt(s, t, e) : ((i, r, o) => {
    const n = r.hasOwnProperty(o);
    return r.constructor.createProperty(o, i), n ? Object.getOwnPropertyDescriptor(r, o) : void 0;
  })(s, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function v(s) {
  return I({ ...s, state: !0, attribute: !1 });
}
var Bt = Object.defineProperty, Vt = Object.getOwnPropertyDescriptor, Q = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? Vt(t, e) : t, o = s.length - 1, n; o >= 0; o--)
    (n = s[o]) && (r = (i ? n(t, e, r) : n(r)) || r);
  return i && r && Bt(t, e, r), r;
};
let O = class extends x {
  get schema() {
    return [
      { name: "title", selector: { text: {} } },
      { name: "entity", selector: { entity: { filter: [{ domain: ["device_tracker", "person"] }] } } },
      { name: "api_url", selector: { text: { type: "url" } } },
      { name: "api_token", selector: { text: { type: "password" } } },
      { name: "radius_km", selector: { number: { min: 1, max: 500, step: 1, mode: "box", unit_of_measurement: "km" } } },
      { name: "limit", selector: { number: { min: 1, max: 20, step: 1, mode: "box" } } },
      { name: "fuels", selector: { select: { multiple: !0, options: [{ value: "diesel", label: "Gasóleo simples" }, { value: "gasoline95", label: "Gasolina simples 95" }, { value: "dieselprime", label: "Gasóleo especial" }, { value: "gasolineprime", label: "Lowest: Gasolina 98 / especial 95 / especial 98" }, { value: "gplauto", label: "GPL Auto" }] } } },
      { name: "sort_by", selector: { select: { options: [{ value: "diesel", label: "Cheapest diesel" }, { value: "gasoline95", label: "Cheapest gasoline 95" }, { value: "dieselprime", label: "Cheapest premium diesel" }, { value: "gasolineprime", label: "Cheapest premium gasoline" }, { value: "gplauto", label: "Cheapest GPL Auto" }, { value: "distance", label: "Nearest" }] } } },
      { name: "navigation_app", selector: { select: { options: [{ value: "waze", label: "Waze" }, { value: "google", label: "Google Maps" }, { value: "apple", label: "Apple Maps" }] } } },
      { name: "show_brand_logo", selector: { boolean: {} } }
    ];
  }
  changed(s) {
    s.stopPropagation(), this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: { ...this.config, ...s.detail.value } },
      bubbles: !0,
      composed: !0
    }));
  }
  render() {
    return p`<ha-form .hass=${this.hass} .data=${this.config ?? {}} .schema=${this.schema}
      .computeLabel=${(s) => s.name.replaceAll("_", " ")}
      @value-changed=${this.changed}></ha-form>`;
  }
};
O.styles = dt`
    ha-form { display: block; }
  `;
Q([
  I({ attribute: !1 })
], O.prototype, "hass", 2);
Q([
  I({ attribute: !1 })
], O.prototype, "config", 2);
O = Q([
  ft("ninjas-gas-stations-card-editor")
], O);
const G = '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>', B = '</title><path d="', V = '"/></svg>', Wt = { title: "Auchan", slug: "auchan", get svg() {
  return G + "Auchan" + B + this.path + V;
}, path: "m14.467 18.7529 1.6518 4.6358h1.2185l-1.7447-4.8583a7.9586 7.9586 0 0 1-1.1256.2217M0 23.3888h5.5057l1.7822-5.6112H1.9158A107.284 107.284 0 0 0 0 23.3879m7.2547-12.6334L10.4337 8.1c.5205-1.4086 1.0642-2.8197 1.6295-4.0216.2822.6408.5495 1.2816.83 1.9639 1.2268-1.0077 2.0328-1.5555 2.0735-1.582l.0164-.0117a5.6618 5.6618 0 0 1 1.632-.7064 112.7775 112.7775 0 0 0-1.4817-3.131h-6.169c-.5146.9903-2.4329 4.9521-4.6765 10.399h2.2694c.3693 0 .5544-.1362.6972-.2557m12.9073 4.4076a7.4539 7.4539 0 0 1-3.473 2.9658l1.8702 5.2609H24c-1.0874-3.3012-2.2536-6.2786-3.3484-9.0684-.1527.303-.3155.5603-.4898.8409M18.549 6.2946c.157 0 .303.0365.4358.1005-.0264-.0042-.054-.0092-.0813-.0092a.5844.5844 0 0 0-.5844.581.581.581 0 0 0 .5844.5803.581.581 0 0 0 .5827-.5794c0-.02-.0025-.0374-.004-.0548a.9987.9987 0 0 1 .0772.3843c0 .5528-.4524 1.0027-1.0102 1.0027-.5556.0014-1.0074-.4471-1.0102-1.0027 0-.5561.4532-1.0027 1.0102-1.0027zm-5.6393 11.3178c1.3297 0 4.503-.3378 6.2204-3.096 1.7198-2.76 2.3191-7.1386 2.3191-7.1386l1.8826-.8923c.1179-.0589.0872-.2623-.0565-.2623H21.246c-.318-.4955-1.4194-1.5497-3.0422-1.5497-.9628 0-1.8062.2715-2.5615.7637 0 0-1.1015.7503-2.7035 2.1282l-4.904 4.0797c-.3776.3155-.84.5205-1.4791.5205H.3858c-.1743 0-.1162.146-.088.2307.435 1.3256 1.5962 2.5085 3.6232 2.5085l-1.4476 1.4916c-.0573.0564-.0573.2258.0863.2258h5.5049c3.9784 0 6.4246-1.7415 8.0324-4.1545.1378-.2067.2673-.4266.3901-.6391.0606.0282.0664.0863.0381.1428-.4059.9794-1.4194 2.965-3.2737 4.1452-.6392.3736-.8417.489-1.7398.8334-.0614.0266-.0863.1245-.0581.2092l2.2279 6.2295h1.216l-2.042-5.7771h.0557z", source: "https://www.auchan.fr", hex: "D6180B" }, Ft = { title: "E.Leclerc", slug: "edotleclerc", get svg() {
  return G + "E.Leclerc" + B + this.path + V;
}, path: "M12.0006 0C5.4304 0 .104 5.373.104 12.0006.1041 18.628 5.4304 24 12.0006 24c6.57 0 11.8953-5.372 11.8953-11.9994C23.8959 5.373 18.5705 0 12.0006 0zm0 2.491c5.2064 0 9.4266 4.2576 9.4266 9.5096 0 5.2518-4.2202 9.5085-9.4266 9.5085-5.2065 0-9.4278-4.2567-9.4278-9.5085 0-5.252 4.2213-9.5097 9.4278-9.5097zm1.1477 1.9912c-1.4425 0-2.7735.4696-3.8562 1.266h3.1929V8.982c-.556.0284-1.0156.4782-1.0156 1.0436v5.4499h.9442c1.2058 0 1.5093-1.4532 1.5093-1.4532h2.836l.001 2.5939c1.7738-1.1835 2.9437-3.215 2.9437-5.5212 0-3.6525-2.9346-6.6128-6.5554-6.6128zM6.49 6.7322v1.6204c.5462.1418 1.018.6113 1.018 1.3817v5.4592c0 .6162-.4365 1.1693-1.018 1.315v2.0943h9.3003V15.004l-1.2344.007c-.348.8466-1.1771 1.4415-2.1422 1.4415h-1.913V9.691c0-.6981.4543-1.1824 1.0156-1.335V6.7322z", source: "https://www.e.leclerc/assets/images/sue-logo.svg", hex: "0066CC" }, qt = { title: "Intermarche", slug: "intermarche", get svg() {
  return G + "Intermarche" + B + this.path + V;
}, path: "m9.948 13.05.677 1.18h12.782l.15-1.18zm1.961-2.556a3.209 3.209 0 0 0-.694.071 1.72 1.72 0 0 0-.537-.07 2.699 2.699 0 0 0-1.007.168l-.215 1.53.317.552h.384l.254-1.834a.648.648 0 0 1 .2-.03c.17 0 .229.086.23.192l-.234 1.672h.782l.215-1.525a1 1 0 0 0 .008-.093l.03-.214a.646.646 0 0 1 .201-.029c.197 0 .246.115.227.25l-.22 1.608h.778l.215-1.524c.062-.442-.185-.72-.93-.72M8.88 11.88a.725.725 0 0 0 .438-.593l.012-.078h-.004c.062-.442-.185-.72-.93-.72a2.699 2.699 0 0 0-1.007.17v.003L7.1 12.741h.778l.104-.74h.2l1.466 2c.097.13.219.23.375.23h.208l-1.355-2.352zm-.32-.755-.01.084-.025.165a.27.27 0 0 1-.3.247h-.19l.01-.078.09-.638a.64.64 0 0 1 .202-.03c.197 0 .247.114.227.25zm-3.84 1.503c.014-.102-.023-.174-.145-.174h-.09c-.197 0-.247-.114-.228-.25l.165-1.178v-.015l.01-.078h.21a.058.058 0 0 1 .02 0c.113 0 .207-.115.231-.289H4.47l.122-.871c-.558.061-.815.32-.871.705l-.066.434-.006.042-.004.03-.14 1.04c-.061.432.17.707.876.72h.322l.016-.114m1.416-2.14a2.699 2.699 0 0 0-1.007.17l-.119.846-.068.509c-.06.43.175.705.877.718h.853l.015-.102c.015-.103-.021-.186-.143-.186H5.92c-.197 0-.246-.114-.227-.25l.025-.186h.244c.714-.01 1.03-.283 1.092-.713l.012-.079h-.004c.06-.44-.187-.719-.931-.719zm.166.642-.011.085-.027.155a.27.27 0 0 1-.3.247h-.191l.01-.078.09-.638a.642.642 0 0 1 .202-.029c.196 0 .245.115.226.25zm16.764-.642a2.696 2.696 0 0 0-1.005.17l-.12.846-.068.509c-.06.43.175.705.876.718h.854l.015-.103c.015-.103-.022-.185-.144-.185h-.625c-.196 0-.246-.114-.226-.25l.025-.186h.244c.713-.01 1.03-.283 1.092-.713l.012-.079h-.004c.061-.44-.186-.719-.93-.719zm.163.642-.01.085-.025.164a.271.271 0 0 1-.3.247h-.191l.01-.077.09-.639a.643.643 0 0 1 .202-.028c.196-.01.246.105.226.24zm-9.025-.632h-.665c-.116 0-.208.115-.233.29h.794c.197 0 .246.121.227.253l-.034.247h-.258c-.703.013-1.017.284-1.078.713l-.012.078h.007c-.06.44.187.719.933.719.342.008.684-.05 1.005-.17l.12-.847.075-.564c.06-.43-.175-.713-.876-.726zm.024 1.245-.09.645a.642.642 0 0 1-.201.03c-.196 0-.245-.115-.227-.25l.01-.085.026-.165a.27.27 0 0 1 .298-.248h.192l-.01.077zm3.16-.456.012-.079h.005c.06-.44-.187-.718-.93-.718a2.698 2.698 0 0 0-1.007.17v.003l-.293 2.08h.778l.104-.74h.198l.437.739h.778l-.513-.862a.725.725 0 0 0 .438-.593zm-.747-.165-.01.085-.039.163a.27.27 0 0 1-.3.247h-.19l.01-.078.09-.638a.64.64 0 0 1 .201-.029c.201.001.25.115.232.25zm2.604 1.33.018-.132a3.28 3.28 0 0 1-.647.073h-.06c-.196 0-.245-.115-.227-.254l.065-.479.018-.136.07-.477a.27.27 0 0 1 .296-.254h.06c.21-.002.42.02.624.067l.018-.137c.016-.114.027-.207-.127-.236a3.265 3.265 0 0 0-.537-.037c-.744 0-1.07.277-1.13.718l-.117.835c-.06.44.188.719.932.719.194 0 .388-.015.58-.048.085-.02.14-.058.165-.236m1.486-1.946c-.072 0-.143.002-.21.006l.1-.73c-.558.061-.815.32-.87.706l-.071.507-.247 1.76h.778l.254-1.834a.646.646 0 0 1 .2-.029c.197 0 .246.114.227.25l-.227 1.613h.778l.216-1.524c.062-.442-.186-.72-.932-.72M.865 11.51l.007-.055.243-1.684h-.78l-.27 1.843v.007l-.056.424c-.054.385.128.646.67.706l.18-1.239m22.771-1.53h-1.07l-.042.29h.878c.115 0 .208-.116.233-.29M2.274 12.741l.227-1.613c.019-.135-.03-.25-.227-.25a.64.64 0 0 0-.2.03l-.254 1.833h-.78l.293-2.079a2.69 2.69 0 0 1 1.006-.17c.745 0 .992.28.93.72l-.214 1.525h-.778", source: "https://www.intermarche.com", hex: "E2001A" }, Zt = { title: "Shell", slug: "shell", get svg() {
  return G + "Shell" + B + this.path + V;
}, path: "M12 .863C5.34.863 0 6.251 0 12.98c0 .996.038 1.374.246 2.33l3.662 2.71.57 4.515h6.102l.326.227c.377.262.705.375 1.082.375.352 0 .732-.101 1.024-.313l.39-.289h6.094l.563-4.515 3.695-2.71c.208-.956.246-1.334.246-2.33C24 6.252 18.661.863 12 .863zm.996 2.258c.9 0 1.778.224 2.512.649l-2.465 12.548 3.42-12.062c1.059.36 1.863.941 2.508 1.814l.025.034-4.902 10.615 5.572-9.713.033.03c.758.708 1.247 1.567 1.492 2.648l-6.195 7.666 6.436-6.5.01.021c.253.563.417 1.36.417 1.996 0 .509-.024.712-.164 1.25l-3.554 2.602-.467 3.71h-4.475l-.517.395c-.199.158-.482.266-.682.266-.199 0-.483-.108-.682-.266l-.517-.394H6.322l-.445-3.61-3.627-2.666c-.11-.436-.16-.83-.16-1.261 0-.72.159-1.49.426-2.053l.013-.024 6.45 6.551L2.75 9.621c.25-1.063.874-2.09 1.64-2.713l5.542 9.776L4.979 6.1c.555-.814 1.45-1.455 2.546-1.827l3.424 12.069L8.355 3.816l.055-.03c.814-.45 1.598-.657 2.457-.657.195 0 .286.004.528.03l.587 13.05.46-13.059c.224-.025.309-.029.554-.029z", source: "https://en.wikipedia.org/wiki/File:Shell_logo.svg", hex: "FFD500" }, Kt = [
  { terms: ["intermarche", "intermarché"], icon: qt },
  { terms: ["e.leclerc", "eleclerc", "leclerc"], icon: Ft },
  { terms: ["auchan"], icon: Wt },
  { terms: ["shell"], icon: Zt }
];
function Yt(s) {
  const t = (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return Kt.find(({ terms: e }) => e.some((i) => t.includes(i)))?.icon;
}
const _t = ["diesel", "gasoline95", "dieselprime", "gasolineprime", "gplauto"], Jt = [..._t, "distance"];
function Qt(s) {
  if (!s) return;
  const t = Number(s.attributes.latitude), e = Number(s.attributes.longitude);
  if (!(!Number.isFinite(t) || !Number.isFinite(e) || Math.abs(t) > 90 || Math.abs(e) > 180))
    return { lat: t, lon: e };
}
function Xt(s, t) {
  return [...s].sort((e, i) => {
    if (t === "distance") return e.distance_km - i.distance_km;
    const r = e.prices[t]?.price_eur ?? Number.POSITIVE_INFINITY, o = i.prices[t]?.price_eur ?? Number.POSITIVE_INFINITY;
    return r - o || e.distance_km - i.distance_km;
  });
}
function te(s, t) {
  return t === "distance" ? [...s] : [t];
}
function ee(s, t) {
  const e = [...t].sort((r, o) => r - o), i = e.indexOf(s);
  return i <= Math.floor((e.length - 1) / 3) ? "low" : i >= Math.ceil((e.length - 1) * 2 / 3) ? "high" : "mid";
}
function se(s, t) {
  const e = t?.toLowerCase().startsWith("pt");
  return s === "diesel" ? e ? "Gasóleo simples" : "Diesel" : s === "gasoline95" ? e ? "Gasolina simples 95" : "Gasoline 95" : s === "dieselprime" ? e ? "Gasóleo especial" : "Premium diesel" : s === "gasolineprime" ? e ? "Gasolina premium" : "Premium gasoline" : "GPL Auto";
}
function ie(s, t) {
  if (!s) return t?.startsWith("pt") ? "Data indisponível" : "Date unavailable";
  const e = Date.now() - new Date(s).getTime();
  if (!Number.isFinite(e)) return t?.startsWith("pt") ? "Data indisponível" : "Date unavailable";
  const i = Math.max(0, Math.floor(e / 36e5));
  if (i < 1) return t?.startsWith("pt") ? "Atualizado há menos de 1 h" : "Updated less than 1 h ago";
  if (i < 24) return t?.startsWith("pt") ? `Atualizado há ${i} h` : `Updated ${i} h ago`;
  const r = Math.floor(i / 24);
  return t?.startsWith("pt") ? `Atualizado há ${r} d` : `Updated ${r} d ago`;
}
var re = Object.defineProperty, oe = Object.getOwnPropertyDescriptor, g = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? oe(t, e) : t, o = s.length - 1, n; o >= 0; o--)
    (n = s[o]) && (r = (i ? n(t, e, r) : n(r)) || r);
  return i && r && re(t, e, r), r;
};
const P = {
  radius_km: 15,
  limit: 5,
  fuels: ["diesel", "gasoline95"],
  sort_by: "diesel",
  navigation_app: "waze",
  show_brand_logo: !0,
  title: "Ninjas Gas Stations"
};
let m = class extends x {
  constructor() {
    super(...arguments), this._stations = [], this._busy = !1, this._error = "", this._locationMissing = !1, this._stale = !1, this._sort = "diesel", this._lastRequest = 0, this.visibilityChanged = () => {
      document.visibilityState === "visible" && this.refresh();
    };
  }
  set hass(s) {
    const t = this._hass;
    this._hass = s, t !== s && this.refreshIfLocationChanged();
  }
  get hass() {
    return this._hass;
  }
  setConfig(s) {
    if (!s.api_url) throw new Error("Ninjas Gas Stations card requires api_url");
    const t = s.fuels?.length ? s.fuels : [...P.fuels], e = s.sort_by ?? P.sort_by, i = e === "distance" || t.includes(e) ? e : t[0];
    this._config = {
      ...P,
      ...s,
      fuels: t,
      sort_by: i,
      type: "custom:ninjas-gas-stations-card",
      api_url: s.api_url.replace(/\/$/, "")
    }, this._sort = i;
  }
  connectedCallback() {
    super.connectedCallback(), this._observer = new IntersectionObserver((s) => {
      s.some((t) => t.isIntersecting) && this.refresh();
    }), this._observer.observe(this), document.addEventListener("visibilitychange", this.visibilityChanged);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._observer?.disconnect(), document.removeEventListener("visibilitychange", this.visibilityChanged), this._pendingTimer && window.clearTimeout(this._pendingTimer);
  }
  async refreshIfLocationChanged() {
    const s = this.readEntityLocation();
    if (!s) return;
    const t = !this._location || this.distanceMeters(this._location, s) > 300;
    this._location = s, t && this.isConnected && (this._pendingTimer && window.clearTimeout(this._pendingTimer), this._pendingTimer = window.setTimeout(() => void this.refresh(), 350));
  }
  readEntityLocation() {
    const s = this._config?.entity;
    return Qt(s ? this._hass?.states[s] : void 0);
  }
  distanceMeters(s, t) {
    const e = (n) => n * Math.PI / 180, i = e(t.lat - s.lat), r = e(t.lon - s.lon);
    return 2 * Math.asin(Math.sqrt(Math.sin(i / 2) ** 2 + Math.cos(e(s.lat)) * Math.cos(e(t.lat)) * Math.sin(r / 2) ** 2)) * 6371e3;
  }
  async getLocation() {
    const s = this.readEntityLocation();
    if (s) return s;
    if (navigator.geolocation)
      return new Promise((t) => {
        navigator.geolocation.getCurrentPosition(
          ({ coords: e }) => t({ lat: e.latitude, lon: e.longitude }),
          () => t(void 0),
          { enableHighAccuracy: !1, maximumAge: 6e4, timeout: 1e4 }
        );
      });
  }
  async refresh() {
    if (!(!this._config || this._busy || Date.now() - this._lastRequest < 700)) {
      this._busy = !0, this._error = "", this._locationMissing = !1;
      try {
        const s = await this.getLocation();
        if (!s) {
          this._locationMissing = !0;
          return;
        }
        this._location = s;
        const t = new URLSearchParams({
          lat: String(s.lat),
          lon: String(s.lon),
          radius_km: String(this._config.radius_km),
          limit: String(this._config.limit),
          fuels: _t.join(","),
          sort: this._sort
        }), e = await fetch(`${this._config.api_url}/api/stations?${t}`, {
          headers: this._config.api_token ? { Authorization: `Bearer ${this._config.api_token}` } : {}
        });
        if (!e.ok) throw new Error(`Fuel service returned ${e.status}`);
        const i = await e.json();
        this._stations = Xt(i.stations, this._sort), this._stale = i.stale, this._lastRequest = Date.now();
      } catch (s) {
        this._error = s instanceof Error ? s.message : "Unable to load nearby stations";
      } finally {
        this._busy = !1;
      }
    }
  }
  setSort(s) {
    this._sort = s, this.refresh();
  }
  sortLabel(s, t) {
    return {
      diesel: ["Gasóleo", "Diesel"],
      gasoline95: ["Gasolina 95", "Gasoline 95"],
      dieselprime: ["Gasóleo Prime", "Diesel Prime"],
      gasolineprime: ["Gasolina Prime", "Gasoline Prime"],
      gplauto: ["GPL Auto", "GPL Auto"],
      distance: ["Distância", "Nearest"]
    }[s][t ? 0 : 1];
  }
  openNavigation(s) {
    const t = this._config?.navigation_app ?? "waze", e = t === "google" ? s.google_maps_url : t === "apple" ? s.apple_maps_url : s.waze_url;
    if (t !== "waze") {
      window.open(e, "_blank", "noopener,noreferrer");
      return;
    }
    const i = `waze://?ll=${s.lat},${s.lon}&navigate=yes`, r = Date.now();
    window.location.href = i, window.setTimeout(() => {
      document.visibilityState === "visible" && Date.now() - r < 2500 && (window.location.href = e);
    }, 900);
  }
  renderPrice(s, t, e) {
    const i = s.prices[t];
    if (!i) return c;
    const r = e.map((n) => n.prices[t]?.price_eur).filter((n) => n !== void 0), o = r.length > 0 && i.price_eur === Math.min(...r);
    return p`<div class="price ${ee(i.price_eur, r)}">
      ${i.price_eur.toFixed(3)} €/l<small>${se(t, this._hass?.language)}</small>
      ${t === "gasolineprime" ? p`<small>${i.label}</small>` : c}
      <small>${ie(i.updated_at, this._hass?.language)}</small>
      ${o ? p`<span class="cheapest">${this._hass?.language?.startsWith("pt") ? "Mais barato" : "Cheapest"}</span>` : c}
    </div>`;
  }
  renderBrand(s) {
    const t = Yt(s.brand);
    return p`<span class="brand" role="img" aria-label=${s.brand || s.name} title=${s.brand || s.name}>
      ${t ? p`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill=${`#${t.hex}`} d=${t.path}></path></svg>` : p`<svg class="brand-fallback" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 22V3h10v19H5Zm2-2h6V5H7v15Zm9-12h1.5l2.5 2.5V17a2 2 0 0 1-4 0v-2h2v2a.5.5 0 0 0 1 0v-5.7L16 10V8ZM8 7h4v4H8V7Z"></path></svg>`}
    </span>`;
  }
  renderStation(s, t) {
    const e = te(this._config?.fuels ?? [...P.fuels], this._sort);
    return p`<li class="row">
      <span class="rank" aria-label=${`Rank ${t + 1}`}>${t + 1}</span>
      ${this._config?.show_brand_logo ? this.renderBrand(s) : c}
      <div class="details"><div class="name">${s.name}</div>
        <div class="place">${[s.brand, s.municipality].filter(Boolean).join(" · ")}</div>
        <div class="distance">${s.distance_km.toFixed(1)} km</div></div>
      <div class="prices">${e.map((i) => this.renderPrice(s, i, this._stations))}</div>
      <button class="nav" aria-label=${`Navigate to ${s.name} using ${this._config?.navigation_app}`} title=${`Navigate with ${this._config?.navigation_app}`} @click=${() => this.openNavigation(s)}><span class="nav-icon" aria-hidden="true">↗</span><span>${this._hass?.language?.startsWith("pt") ? "Navegar" : "Navigate"}</span></button>
    </li>`;
  }
  static getConfigElement() {
    return document.createElement("ninjas-gas-stations-card-editor");
  }
  render() {
    if (!this._config) return c;
    const s = this._hass?.language?.toLowerCase().startsWith("pt") ?? !1;
    return p`<ha-card>
      <header class="head"><div><h2>${this._config.title}</h2>
        <div class="subtitle">${this._config.radius_km} km · ${this._stations.length} ${s ? "postos" : "stations"}</div></div>
        <button class="refresh" aria-label=${s ? "Atualizar postos" : "Refresh stations"} title=${s ? "Atualizar" : "Refresh"} ?disabled=${this._busy} @click=${() => void this.refresh()}>↻</button>
      </header>
      <nav class="modes" aria-label=${s ? "Ordenar por" : "Sort by"}>
        ${Jt.map((t) => p`<button aria-pressed=${this._sort === t} @click=${() => this.setSort(t)}>${this.sortLabel(t, s)}</button>`)}
      </nav>
      ${this._stale ? p`<div class="warning" role="status">${s ? "Preços em cache: atualização temporariamente indisponível." : "Cached prices: live refresh is temporarily unavailable."}</div>` : c}
      ${this._busy && !this._stations.length ? p`<div class="notice" aria-label="Loading">${[1, 2, 3].map(() => p`<div class="skeleton"></div>`)}</div>` : c}
      ${this._locationMissing ? p`<div class="notice" role="status">${s ? "Ative a localização no Companion ou permita o acesso à localização do navegador." : "Enable Companion location tracking or allow browser location access."}</div>` : c}
      ${this._error ? p`<div class="notice error" role="alert">${this._error}<br><button @click=${() => void this.refresh()}>${s ? "Tentar novamente" : "Retry"}</button></div>` : c}
      ${!this._busy && !this._error && !this._locationMissing && !this._stations.length ? p`<div class="notice">${s ? `Sem postos num raio de ${this._config.radius_km} km` : `No stations within ${this._config.radius_km} km`}</div>` : c}
      ${this._stations.length ? p`<ol class="rows">${this._stations.map((t, e) => this.renderStation(t, e))}</ol>` : c}
    </ha-card>`;
  }
  static getStubConfig() {
    return { ...P, api_url: "http://homeassistant.local:8099" };
  }
};
m.styles = dt`
    :host { display:block; color:var(--primary-text-color); }
    ha-card { overflow:hidden; }
    .head { align-items:center; border-bottom:1px solid var(--divider-color); display:flex; gap:12px; justify-content:space-between; padding:16px; }
    h2 { font-size:1.08rem; font-weight:700; margin:0; }
    .subtitle { color:var(--secondary-text-color); font-size:.82rem; margin-top:4px; }
    button { align-items:center; background:var(--secondary-background-color); border:0; border-radius:8px; color:var(--primary-text-color); cursor:pointer; display:inline-flex; justify-content:center; min-height:44px; min-width:44px; padding:8px 12px; }
    button:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
    .refresh { font-size:1.25rem; }
    .modes { display:grid; gap:5px; grid-template-columns:repeat(auto-fit,minmax(86px,1fr)); padding:12px 14px 8px; }
    .modes button { background:transparent; border:1px solid var(--divider-color); font-size:.75rem; min-height:40px; padding:6px 8px; }
    .modes [aria-pressed="true"] { background:var(--primary-color); color:var(--text-primary-color, #fff); }
    .rows { list-style:none; margin:0; padding:0 12px 8px; }
    .row { align-items:center; border-bottom:1px solid var(--divider-color); display:grid; gap:10px; grid-template-columns:30px 38px minmax(0,1fr) auto auto; min-height:92px; padding:10px 4px; }
    .row:last-child { border-bottom:0; }
    .rank { color:var(--secondary-text-color); font-size:.82rem; text-align:center; }
    .brand { align-items:center; background:var(--card-background-color, #fff); border:1px solid var(--divider-color); border-radius:8px; display:flex; height:40px; justify-content:center; overflow:hidden; width:40px; }
    .brand svg { display:block; height:25px; width:25px; }
    .brand-fallback { color:var(--secondary-text-color); height:25px; width:25px; }
    .details { min-width:0; }
    .name { font-size:.91rem; font-weight:600; line-height:1.25; overflow-wrap:anywhere; }
    .place,.updated { color:var(--secondary-text-color); font-size:.76rem; margin-top:4px; }
    .prices { align-content:center; display:grid; gap:7px; min-width:88px; }
    .price { font-variant-numeric:tabular-nums; font-size:.9rem; font-weight:650; text-align:right; white-space:nowrap; }
    .price small { color:var(--secondary-text-color); display:block; font-size:.68rem; font-weight:400; }
    .low { color:var(--success-color, #238636); } .mid { color:var(--warning-color, #9a6700); } .high { color:var(--error-color, #cf222e); }
    .cheapest { background:var(--success-color, #238636); border-radius:4px; color:#fff; display:inline-block; font-size:.64rem; margin:4px 0 0; padding:3px 6px; }
    .distance { color:var(--secondary-text-color); font-size:.72rem; margin-top:4px; }
    .nav { font-size:.78rem; font-weight:600; gap:6px; white-space:nowrap; }
    .nav-icon { font-size:1.05rem; line-height:1; }
    .notice { color:var(--secondary-text-color); font-size:.85rem; padding:22px 18px; text-align:center; }
    .notice.error { color:var(--error-color, #cf222e); }
    .warning { color:var(--warning-color, #9a6700); font-size:.76rem; padding:8px 16px; }
    .skeleton { animation:pulse 1.2s ease-in-out infinite alternate; background:var(--secondary-background-color); border-radius:4px; height:12px; margin:10px 0; }
    @keyframes pulse { to { opacity:.45; } }
    @media (max-width:480px) {
      .row { align-items:start; gap:7px; grid-template-columns:22px 36px minmax(0,1fr) 70px; padding:14px 4px; }
      .rank { grid-column:1; grid-row:1 / span 2; padding-top:7px; }
      .brand { grid-column:2; grid-row:1; height:34px; width:34px; }
      .brand svg,.brand-fallback { height:22px; width:22px; }
      .details { grid-column:3; grid-row:1; }
      .prices { align-items:flex-start; display:flex; flex-wrap:wrap; gap:8px 14px; grid-column:3; grid-row:2; justify-content:flex-start; min-width:0; padding-top:7px; }
      .price { font-size:.8rem; text-align:left; }
      .nav { align-self:center; grid-column:4; grid-row:1 / span 2; }
    }
  `;
g([
  I({ attribute: !1 })
], m.prototype, "hass", 1);
g([
  v()
], m.prototype, "_hass", 2);
g([
  v()
], m.prototype, "_config", 2);
g([
  v()
], m.prototype, "_stations", 2);
g([
  v()
], m.prototype, "_busy", 2);
g([
  v()
], m.prototype, "_error", 2);
g([
  v()
], m.prototype, "_locationMissing", 2);
g([
  v()
], m.prototype, "_stale", 2);
g([
  v()
], m.prototype, "_sort", 2);
m = g([
  ft("ninjas-gas-stations-card")
], m);
const ne = "ninjas-gas-stations-card", $t = window.customCards ?? [];
$t.push({ type: ne, name: "Ninjas Gas Stations", description: "Nearby Portuguese fuel prices from DGEG" });
window.customCards = $t;
export {
  m as NinjasGasStationsCard,
  Qt as entityLocation,
  se as fuelName,
  ee as priceLevel,
  ie as relativeUpdatedAt,
  Xt as sortStations
};
