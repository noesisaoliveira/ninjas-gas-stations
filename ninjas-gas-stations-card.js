/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = globalThis, W = z.ShadowRoot && (z.ShadyCSS === void 0 || z.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, G = Symbol(), J = /* @__PURE__ */ new WeakMap();
let at = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== G) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (W && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = J.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && J.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const _t = (s) => new at(typeof s == "string" ? s : s + "", void 0, G), lt = (s, ...t) => {
  const e = s.length === 1 ? s[0] : t.reduce((i, r, o) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[o + 1], s[0]);
  return new at(e, s, G);
}, mt = (s, t) => {
  if (W) s.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), r = z.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = e.cssText, s.appendChild(i);
  }
}, K = W ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return _t(e);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: gt, defineProperty: $t, getOwnPropertyDescriptor: vt, getOwnPropertyNames: yt, getOwnPropertySymbols: bt, getPrototypeOf: At } = Object, j = globalThis, Y = j.trustedTypes, wt = Y ? Y.emptyScript : "", xt = j.reactiveElementPolyfillSupport, P = (s, t) => s, R = { toAttribute(s, t) {
  switch (t) {
    case Boolean:
      s = s ? wt : null;
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
} }, B = (s, t) => !gt(s, t), Q = { attribute: !0, type: String, converter: R, reflect: !1, useDefault: !1, hasChanged: B };
Symbol.metadata ??= Symbol("metadata"), j.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let w = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Q) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), r = this.getPropertyDescriptor(t, i, e);
      r !== void 0 && $t(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: r, set: o } = vt(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? Q;
  }
  static _$Ei() {
    if (this.hasOwnProperty(P("elementProperties"))) return;
    const t = At(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(P("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(P("properties"))) {
      const e = this.properties, i = [...yt(e), ...bt(e)];
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
      for (const r of i) e.unshift(K(r));
    } else t !== void 0 && e.push(K(t));
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
    return mt(t, this.constructor.elementStyles), t;
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
      const o = (i.converter?.toAttribute !== void 0 ? i.converter : R).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, r = i._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const o = i.getPropertyOptions(r), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : R;
      this._$Em = r;
      const l = n.fromAttribute(e, o.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, r = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (r === !1 && (o = this[t]), i ??= n.getPropertyOptions(t), !((i.hasChanged ?? B)(o, e) || i.useDefault && i.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, i)))) return;
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
w.elementStyles = [], w.shadowRootOptions = { mode: "open" }, w[P("elementProperties")] = /* @__PURE__ */ new Map(), w[P("finalized")] = /* @__PURE__ */ new Map(), xt?.({ ReactiveElement: w }), (j.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const q = globalThis, X = (s) => s, D = q.trustedTypes, tt = D ? D.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, ht = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, ct = "?" + $, Et = `<${ct}>`, A = document, M = () => A.createComment(""), k = (s) => s === null || typeof s != "object" && typeof s != "function", F = Array.isArray, St = (s) => F(s) || typeof s?.[Symbol.iterator] == "function", I = `[ 	
\f\r]`, C = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, et = /-->/g, st = />/g, y = RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), it = /'/g, rt = /"/g, dt = /^(?:script|style|textarea|title)$/i, Ct = (s) => (t, ...e) => ({ _$litType$: s, strings: t, values: e }), u = Ct(1), E = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), ot = /* @__PURE__ */ new WeakMap(), b = A.createTreeWalker(A, 129);
function pt(s, t) {
  if (!F(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return tt !== void 0 ? tt.createHTML(t) : t;
}
const Pt = (s, t) => {
  const e = s.length - 1, i = [];
  let r, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = C;
  for (let l = 0; l < e; l++) {
    const a = s[l];
    let d, p, c = -1, m = 0;
    for (; m < a.length && (n.lastIndex = m, p = n.exec(a), p !== null); ) m = n.lastIndex, n === C ? p[1] === "!--" ? n = et : p[1] !== void 0 ? n = st : p[2] !== void 0 ? (dt.test(p[2]) && (r = RegExp("</" + p[2], "g")), n = y) : p[3] !== void 0 && (n = y) : n === y ? p[0] === ">" ? (n = r ?? C, c = -1) : p[1] === void 0 ? c = -2 : (c = n.lastIndex - p[2].length, d = p[1], n = p[3] === void 0 ? y : p[3] === '"' ? rt : it) : n === rt || n === it ? n = y : n === et || n === st ? n = C : (n = y, r = void 0);
    const g = n === y && s[l + 1].startsWith("/>") ? " " : "";
    o += n === C ? a + Et : c >= 0 ? (i.push(d), a.slice(0, c) + ht + a.slice(c) + $ + g) : a + $ + (c === -2 ? l : g);
  }
  return [pt(s, o + (s[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class N {
  constructor({ strings: t, _$litType$: e }, i) {
    let r;
    this.parts = [];
    let o = 0, n = 0;
    const l = t.length - 1, a = this.parts, [d, p] = Pt(t, e);
    if (this.el = N.createElement(d, i), b.currentNode = this.el.content, e === 2 || e === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (r = b.nextNode()) !== null && a.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const c of r.getAttributeNames()) if (c.endsWith(ht)) {
          const m = p[n++], g = r.getAttribute(c).split($), T = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: o, name: T[2], strings: g, ctor: T[1] === "." ? kt : T[1] === "?" ? Nt : T[1] === "@" ? Ot : H }), r.removeAttribute(c);
        } else c.startsWith($) && (a.push({ type: 6, index: o }), r.removeAttribute(c));
        if (dt.test(r.tagName)) {
          const c = r.textContent.split($), m = c.length - 1;
          if (m > 0) {
            r.textContent = D ? D.emptyScript : "";
            for (let g = 0; g < m; g++) r.append(c[g], M()), b.nextNode(), a.push({ type: 2, index: ++o });
            r.append(c[m], M());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ct) a.push({ type: 2, index: o });
      else {
        let c = -1;
        for (; (c = r.data.indexOf($, c + 1)) !== -1; ) a.push({ type: 7, index: o }), c += $.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const i = A.createElement("template");
    return i.innerHTML = t, i;
  }
}
function S(s, t, e = s, i) {
  if (t === E) return t;
  let r = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const o = k(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== o && (r?._$AO?.(!1), o === void 0 ? r = void 0 : (r = new o(s), r._$AT(s, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = r : e._$Cl = r), r !== void 0 && (t = S(s, r._$AS(s, t.values), r, i)), t;
}
class Mt {
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
    const { el: { content: e }, parts: i } = this._$AD, r = (t?.creationScope ?? A).importNode(e, !0);
    b.currentNode = r;
    let o = b.nextNode(), n = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let d;
        a.type === 2 ? d = new U(o, o.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(o, a.name, a.strings, this, t) : a.type === 6 && (d = new Ut(o, this, t)), this._$AV.push(d), a = i[++l];
      }
      n !== a?.index && (o = b.nextNode(), n++);
    }
    return b.currentNode = A, r;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class U {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    t = S(this, t, e), k(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== E && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : St(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && k(this._$AH) ? this._$AA.nextSibling.data = t : this.T(A.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, r = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = N.createElement(pt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(e);
    else {
      const o = new Mt(r, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = ot.get(t.strings);
    return e === void 0 && ot.set(t.strings, e = new N(t)), e;
  }
  k(t) {
    F(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, r = 0;
    for (const o of t) r === e.length ? e.push(i = new U(this.O(M()), this.O(M()), this, this.options)) : i = e[r], i._$AI(o), r++;
    r < e.length && (this._$AR(i && i._$AB.nextSibling, r), e.length = r);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = X(t).nextSibling;
      X(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, r, o) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = r, this.options = o, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  _$AI(t, e = this, i, r) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = S(this, t, e, 0), n = !k(t) || t !== this._$AH && t !== E, n && (this._$AH = t);
    else {
      const l = t;
      let a, d;
      for (t = o[0], a = 0; a < o.length - 1; a++) d = S(this, l[i + a], e, a), d === E && (d = this._$AH[a]), n ||= !k(d) || d !== this._$AH[a], d === h ? t = h : t !== h && (t += (d ?? "") + o[a + 1]), this._$AH[a] = d;
    }
    n && !r && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class kt extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Nt extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Ot extends H {
  constructor(t, e, i, r, o) {
    super(t, e, i, r, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = S(this, t, e, 0) ?? h) === E) return;
    const i = this._$AH, r = t === h && i !== h || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, o = t !== h && (i === h || r);
    r && this.element.removeEventListener(this.name, this, i), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ut {
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
const Tt = q.litHtmlPolyfillSupport;
Tt?.(N, U), (q.litHtmlVersions ??= []).push("3.3.3");
const zt = (s, t, e) => {
  const i = e?.renderBefore ?? t;
  let r = i._$litPart$;
  if (r === void 0) {
    const o = e?.renderBefore ?? null;
    i._$litPart$ = r = new U(t.insertBefore(M(), o), o, void 0, e ?? {});
  }
  return r._$AI(s), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const V = globalThis;
class x extends w {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = zt(e, this.renderRoot, this.renderOptions);
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
x._$litElement$ = !0, x.finalized = !0, V.litElementHydrateSupport?.({ LitElement: x });
const Rt = V.litElementPolyfillSupport;
Rt?.({ LitElement: x });
(V.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ut = (s) => (t, e) => {
  e !== void 0 ? e.addInitializer(() => {
    customElements.define(s, t);
  }) : customElements.define(s, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Dt = { attribute: !0, type: String, converter: R, reflect: !1, hasChanged: B }, jt = (s = Dt, t, e) => {
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
function L(s) {
  return (t, e) => typeof e == "object" ? jt(s, t, e) : ((i, r, o) => {
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
  return L({ ...s, state: !0, attribute: !1 });
}
var Ht = Object.defineProperty, Lt = Object.getOwnPropertyDescriptor, Z = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? Lt(t, e) : t, o = s.length - 1, n; o >= 0; o--)
    (n = s[o]) && (r = (i ? n(t, e, r) : n(r)) || r);
  return i && r && Ht(t, e, r), r;
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
      { name: "fuels", selector: { select: { multiple: !0, options: [{ value: "diesel", label: "Gasóleo simples" }, { value: "gasoline95", label: "Gasolina simples 95" }] } } },
      { name: "sort_by", selector: { select: { options: [{ value: "diesel", label: "Cheapest diesel" }, { value: "gasoline95", label: "Cheapest gasoline 95" }, { value: "distance", label: "Nearest" }] } } },
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
    return u`<ha-form .hass=${this.hass} .data=${this.config ?? {}} .schema=${this.schema}
      .computeLabel=${(s) => s.name.replaceAll("_", " ")}
      @value-changed=${this.changed}></ha-form>`;
  }
};
O.styles = lt`
    ha-form { display: block; }
  `;
Z([
  L({ attribute: !1 })
], O.prototype, "hass", 2);
Z([
  L({ attribute: !1 })
], O.prototype, "config", 2);
O = Z([
  ut("ninjas-gas-stations-card-editor")
], O);
function It(s) {
  if (!s) return;
  const t = Number(s.attributes.latitude), e = Number(s.attributes.longitude);
  if (!(!Number.isFinite(t) || !Number.isFinite(e) || Math.abs(t) > 90 || Math.abs(e) > 180))
    return { lat: t, lon: e };
}
function Wt(s, t) {
  return [...s].sort((e, i) => {
    if (t === "distance") return e.distance_km - i.distance_km;
    const r = e.prices[t]?.price_eur ?? Number.POSITIVE_INFINITY, o = i.prices[t]?.price_eur ?? Number.POSITIVE_INFINITY;
    return r - o || e.distance_km - i.distance_km;
  });
}
function Gt(s, t) {
  const e = [...t].sort((r, o) => r - o), i = e.indexOf(s);
  return i <= Math.floor((e.length - 1) / 3) ? "low" : i >= Math.ceil((e.length - 1) * 2 / 3) ? "high" : "mid";
}
function Bt(s, t) {
  const e = t?.toLowerCase().startsWith("pt");
  return s === "diesel" ? e ? "Gasóleo simples" : "Diesel" : e ? "Gasolina simples 95" : "Gasoline 95";
}
function qt(s, t) {
  if (!s) return t?.startsWith("pt") ? "Data indisponível" : "Date unavailable";
  const e = Date.now() - new Date(s).getTime();
  if (!Number.isFinite(e)) return t?.startsWith("pt") ? "Data indisponível" : "Date unavailable";
  const i = Math.max(0, Math.floor(e / 36e5));
  if (i < 1) return t?.startsWith("pt") ? "Atualizado há menos de 1 h" : "Updated less than 1 h ago";
  if (i < 24) return t?.startsWith("pt") ? `Atualizado há ${i} h` : `Updated ${i} h ago`;
  const r = Math.floor(i / 24);
  return t?.startsWith("pt") ? `Atualizado há ${r} d` : `Updated ${r} d ago`;
}
var Ft = Object.defineProperty, Vt = Object.getOwnPropertyDescriptor, _ = (s, t, e, i) => {
  for (var r = i > 1 ? void 0 : i ? Vt(t, e) : t, o = s.length - 1, n; o >= 0; o--)
    (n = s[o]) && (r = (i ? n(t, e, r) : n(r)) || r);
  return i && r && Ft(t, e, r), r;
};
const nt = {
  radius_km: 15,
  limit: 5,
  fuels: ["diesel", "gasoline95"],
  sort_by: "diesel",
  navigation_app: "waze",
  show_brand_logo: !0,
  title: "Ninjas Gas Stations"
};
let f = class extends x {
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
    this._config = { ...nt, ...s, type: "custom:ninjas-gas-stations-card", api_url: s.api_url.replace(/\/$/, "") }, this._sort = this._config.sort_by;
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
    return It(s ? this._hass?.states[s] : void 0);
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
          fuels: this._config.fuels.join(","),
          sort: this._sort
        }), e = await fetch(`${this._config.api_url}/api/stations?${t}`, {
          headers: this._config.api_token ? { Authorization: `Bearer ${this._config.api_token}` } : {}
        });
        if (!e.ok) throw new Error(`Fuel service returned ${e.status}`);
        const i = await e.json();
        this._stations = Wt(i.stations, this._sort), this._stale = i.stale, this._lastRequest = Date.now();
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
    if (!i) return h;
    const r = e.map((n) => n.prices[t]?.price_eur).filter((n) => n !== void 0), o = r.length > 0 && i.price_eur === Math.min(...r);
    return u`<div class="price ${Gt(i.price_eur, r)}">
      ${i.price_eur.toFixed(3)} €/l<small>${Bt(t, this._hass?.language)}</small>
      <small>${qt(i.updated_at, this._hass?.language)}</small>
      ${o ? u`<span class="cheapest">${this._hass?.language?.startsWith("pt") ? "Mais barato" : "Cheapest"}</span>` : h}
    </div>`;
  }
  renderStation(s, t) {
    const e = this._config?.fuels ?? ["diesel", "gasoline95"];
    return u`<li class="row">
      <span class="rank" aria-label=${`Rank ${t + 1}`}>${t + 1}</span>
      ${this._config?.show_brand_logo ? u`<span class="brand" aria-hidden="true">${(s.brand || s.name).slice(0, 2).toUpperCase()}</span>` : h}
      <div class="details"><div class="name">${s.name}</div>
        <div class="place">${[s.brand, s.municipality].filter(Boolean).join(" · ")}</div>
        <div class="distance">${s.distance_km.toFixed(1)} km</div></div>
      <div class="prices">${e.map((i) => this.renderPrice(s, i, this._stations))}</div>
      <button class="nav" aria-label=${`Navigate to ${s.name} using ${this._config?.navigation_app}`} title="Navigate" @click=${() => this.openNavigation(s)}>↗</button>
    </li>`;
  }
  static getConfigElement() {
    return document.createElement("ninjas-gas-stations-card-editor");
  }
  render() {
    if (!this._config) return h;
    const s = this._hass?.language?.toLowerCase().startsWith("pt") ?? !1;
    return u`<ha-card>
      <header class="head"><div><h2>${this._config.title}</h2>
        <div class="subtitle">${this._config.radius_km} km · ${this._stations.length} ${s ? "postos" : "stations"}</div></div>
        <button class="refresh" aria-label=${s ? "Atualizar postos" : "Refresh stations"} title=${s ? "Atualizar" : "Refresh"} ?disabled=${this._busy} @click=${() => void this.refresh()}>↻</button>
      </header>
      <nav class="modes" aria-label=${s ? "Ordenar por" : "Sort by"}>
        ${["diesel", "gasoline95", "distance"].map((t) => u`<button aria-pressed=${this._sort === t} @click=${() => this.setSort(t)}>${t === "diesel" ? s ? "Gasóleo" : "Diesel" : t === "gasoline95" ? "95" : s ? "Distância" : "Nearest"}</button>`)}
      </nav>
      ${this._stale ? u`<div class="warning" role="status">${s ? "Preços em cache: atualização temporariamente indisponível." : "Cached prices: live refresh is temporarily unavailable."}</div>` : h}
      ${this._busy && !this._stations.length ? u`<div class="notice" aria-label="Loading">${[1, 2, 3].map(() => u`<div class="skeleton"></div>`)}</div>` : h}
      ${this._locationMissing ? u`<div class="notice" role="status">${s ? "Ative a localização no Companion ou permita o acesso à localização do navegador." : "Enable Companion location tracking or allow browser location access."}</div>` : h}
      ${this._error ? u`<div class="notice error" role="alert">${this._error}<br><button @click=${() => void this.refresh()}>${s ? "Tentar novamente" : "Retry"}</button></div>` : h}
      ${!this._busy && !this._error && !this._locationMissing && !this._stations.length ? u`<div class="notice">${s ? `Sem postos num raio de ${this._config.radius_km} km` : `No stations within ${this._config.radius_km} km`}</div>` : h}
      ${this._stations.length ? u`<ol class="rows">${this._stations.map((t, e) => this.renderStation(t, e))}</ol>` : h}
    </ha-card>`;
  }
  static getStubConfig() {
    return { ...nt, api_url: "http://homeassistant.local:8099" };
  }
};
f.styles = lt`
    :host { display:block; color:var(--primary-text-color); }
    ha-card { overflow:hidden; }
    .head { align-items:center; border-bottom:1px solid var(--divider-color); display:flex; gap:12px; justify-content:space-between; padding:16px; }
    h2 { font-size:1.05rem; font-weight:650; margin:0; }
    .subtitle { color:var(--secondary-text-color); font-size:.82rem; margin-top:4px; }
    button { align-items:center; background:var(--secondary-background-color); border:0; border-radius:8px; color:var(--primary-text-color); cursor:pointer; display:inline-flex; justify-content:center; min-height:44px; min-width:44px; padding:8px 12px; }
    button:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
    .refresh { font-size:1.25rem; }
    .modes { display:flex; gap:4px; padding:10px 12px 2px; }
    .modes button { flex:1; font-size:.76rem; min-height:40px; padding:6px; }
    .modes [aria-pressed="true"] { background:var(--primary-color); color:var(--text-primary-color, #fff); }
    .rows { list-style:none; margin:0; padding:0 12px 8px; }
    .row { align-items:center; border-bottom:1px solid var(--divider-color); display:grid; gap:10px; grid-template-columns:30px 38px minmax(0,1fr) auto 44px; min-height:92px; padding:10px 4px; }
    .row:last-child { border-bottom:0; }
    .rank { color:var(--secondary-text-color); font-size:.82rem; text-align:center; }
    .brand { align-items:center; background:var(--secondary-background-color); border-radius:50%; display:flex; font-size:.7rem; font-weight:700; height:36px; justify-content:center; overflow:hidden; width:36px; }
    .details { min-width:0; }
    .name { font-size:.91rem; font-weight:600; line-height:1.25; overflow-wrap:anywhere; }
    .place,.updated { color:var(--secondary-text-color); font-size:.76rem; margin-top:4px; }
    .prices { display:grid; gap:5px; min-width:88px; }
    .price { font-variant-numeric:tabular-nums; font-size:.83rem; text-align:right; white-space:nowrap; }
    .price small { color:var(--secondary-text-color); display:block; font-size:.66rem; }
    .low { color:var(--success-color, #238636); } .mid { color:var(--warning-color, #9a6700); } .high { color:var(--error-color, #cf222e); }
    .cheapest { background:var(--success-color, #238636); border-radius:3px; color:#fff; display:inline-block; font-size:.64rem; margin:4px 0 0; padding:2px 5px; }
    .distance { color:var(--secondary-text-color); font-size:.72rem; margin-top:4px; }
    .nav { font-size:1.12rem; }
    .notice { color:var(--secondary-text-color); font-size:.85rem; padding:22px 18px; text-align:center; }
    .notice.error { color:var(--error-color, #cf222e); }
    .warning { color:var(--warning-color, #9a6700); font-size:.76rem; padding:8px 16px; }
    .skeleton { animation:pulse 1.2s ease-in-out infinite alternate; background:var(--secondary-background-color); border-radius:4px; height:12px; margin:10px 0; }
    @keyframes pulse { to { opacity:.45; } }
    @media (max-width:420px) { .row { gap:6px; grid-template-columns:24px 32px minmax(0,1fr) auto 40px; } .brand { height:30px; width:30px; } .prices { min-width:76px; } .price { font-size:.76rem; } }
  `;
_([
  L({ attribute: !1 })
], f.prototype, "hass", 1);
_([
  v()
], f.prototype, "_hass", 2);
_([
  v()
], f.prototype, "_config", 2);
_([
  v()
], f.prototype, "_stations", 2);
_([
  v()
], f.prototype, "_busy", 2);
_([
  v()
], f.prototype, "_error", 2);
_([
  v()
], f.prototype, "_locationMissing", 2);
_([
  v()
], f.prototype, "_stale", 2);
_([
  v()
], f.prototype, "_sort", 2);
f = _([
  ut("ninjas-gas-stations-card")
], f);
const Zt = "ninjas-gas-stations-card", ft = window.customCards ?? [];
ft.push({ type: Zt, name: "Ninjas Gas Stations", description: "Nearby Portuguese fuel prices from DGEG" });
window.customCards = ft;
export {
  f as NinjasGasStationsCard,
  It as entityLocation,
  Bt as fuelName,
  Gt as priceLevel,
  qt as relativeUpdatedAt,
  Wt as sortStations
};
