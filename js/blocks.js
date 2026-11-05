/* PostalNook block library.
   A page is a list of blocks (JSON). Each block: {id, type, props, style, bp, hidden, children}.
   This file turns a block into DOM. The editor changes the same JSON. */
(function () {
  var PN = (window.PN = window.PN || {});

  /* ---------- small helpers ---------- */
  PN.uid = function () { return "b" + Math.random().toString(36).slice(2, 9); };

  function el(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k === "text") e.textContent = v;
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (var i = 2; i < arguments.length; i++) append(e, arguments[i]);
    return e;
  }
  /* live pictures can be blocked or offline: swap a broken <img> for the grey placeholder */
  function withFallback(img, label, extra) {
    img.addEventListener("error", function () {
      if (!img.parentNode) return;
      img.replaceWith(el("div", { class: "pn-ph" + (extra ? " " + extra : "") }, PN.icon("image"), el("span", { text: label })));
    }, { once: true });
    return img;
  }
  function append(e, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(e, x); }); return; }
    e.append(c.nodeType ? c : document.createTextNode(c));
  }
  PN.el = el;

  var SVG = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    question: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 8"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 20.5 4.9 16A8.5 8.5 0 1 1 8 19.1z"/><path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l1-1.6-2-1-.9.8c-1-.4-1.9-1.300-2.300-2.300l.8-.9-1-2z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.7 3h3.1l-6.8 7.7L22 21h-6.3l-4.900-6.400L5.200 21H2.100l7.300-8.300L2 3h6.400l4.400 5.800zm-1.100 16.200h1.700L7.500 4.700H5.700z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.300 8.800h3.400V20H4.300zM6 3.500a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM9.800 8.800h3.200v1.500c.5-.9 1.600-1.800 3.300-1.800 3.400 0 4 2.200 4 5.100V20h-3.400v-5.600c0-1.300 0-3-1.800-3s-2.100 1.400-2.100 2.900V20H9.800z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.500 6.500h.01"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.600 7.200a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3z"/></svg>',
    google: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.500 12.200H12.200M20.300 12.200c-.5 4.500-3.800 7.300-8 7.300a7.500 7.500 0 1 1 5.300-12.800"/></svg>',
    yelp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.200 2.500c-.6.100-1 .6-1 1.200v7.300c0 .8.900 1.200 1.500.7l1.700-1.900c.2-.2.300-.5.300-.8V3.700c0-.7-.6-1.300-1.300-1.200zM8.300 12.400 4 10.900c-.7-.2-1.400.4-1.300 1.100l.5 3c.1.600.7 1 1.300.8l3.800-1.400c.7-.3.800-1.200.3-1.700zM10.500 14.200l-2.700 4.100c-.4.600 0 1.400.7 1.500l3 .5c.7.100 1.300-.5 1.200-1.200l-.4-4.800c0-.9-1.200-1.300-1.800-.1zM14.900 13.800c-.6-.3-1.200.3-1 .9l1.500 4.600c.2.600.9.900 1.500.5l2.500-1.800c.6-.4.600-1.300 0-1.700zM20 11.300l-4.400-.9c-.7-.1-1.300.7-.9 1.300l2.500 3.700c.4.600 1.300.6 1.700 0l1.800-2.800c.3-.6 0-1.200-.7-1.300z"/></svg>'
  };
  SVG.search = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  SVG.chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  PN.SVG = SVG;
  PN.icon = function (name, cls) {
    var s = el("span", { class: "pn-ic" + (cls ? " " + cls : ""), "aria-hidden": "true", html: SVG[name] || "" });
    return s;
  };

  /* Logo: redrawn mark. Replace with the real file through the logo block (Image). */
  var LOGO_MARK = '<svg viewBox="0 0 36 30" aria-hidden="true"><path d="M2 10h32v17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="#ff6d00"/><path d="M2.5 11.5 18 21l15.5-9.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 1h26l3 9H2z" fill="var(--logo-top,#002544)"/><path d="M10 1 8 10M18 1v9M26 1l2 9" stroke="var(--logo-line,#fff)" stroke-width="1.6"/></svg>';

  /* ---------- tokens and rich text ---------- */
  PN.tok = function (s) {
    if (s == null) return "";
    s = String(s);
    if (s.indexOf("{{") < 0) return s;
    var t = window.SITE.tokens();
    return s.replace(/\{\{(\w+)\}\}/g, function (m, k) { return t[k] != null ? t[k] : m; });
  };
  var ALLOWED = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, BR: 1, A: 1 };
  PN.sanitize = function (html) {
    var doc = new DOMParser().parseFromString("<body>" + (html || "") + "</body>", "text/html");
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 1) {
          walk(n);
          if (!ALLOWED[n.tagName]) { while (n.firstChild) node.insertBefore(n.firstChild, n); node.removeChild(n); }
          else {
            Array.prototype.slice.call(n.attributes).forEach(function (a) {
              if (!(n.tagName === "A" && (a.name === "href" || a.name === "data-go"))) n.removeAttribute(a.name);
            });
            if (n.tagName === "A") {
              var h = n.getAttribute("href") || "";
              if (/^\s*javascript:/i.test(h)) n.removeAttribute("href");
              if (/^page:/.test(h)) { n.setAttribute("data-go", h.slice(5)); n.setAttribute("href", window.PN_EXPORT && PN.store && PN.store.project ? PN.store.hrefFor(h.slice(5)) : "#"); }
              else if (/^https?:/i.test(h)) { n.setAttribute("target", "_blank"); n.setAttribute("rel", "noopener"); }
            }
          }
        } else if (n.nodeType !== 3) node.removeChild(n);
      });
    })(doc.body);
    return doc.body.innerHTML;
  };
  PN.stripHtml = function (s) { var d = document.createElement("div"); d.innerHTML = s || ""; return (d.textContent || "").replace(/\s+/g, " ").trim(); };

  /* ---------- links ---------- */
  function linkAttrs(href) {
    href = PN.tok(href || "");
    if (/^page:/.test(href)) { var pid = href.slice(5), out = { href: "#", "data-go": pid }; if (window.PN_EXPORT && PN.store && PN.store.project) { try { out.href = PN.store.hrefFor(pid); } catch (e) {} } return out; }
    if (/^#/.test(href)) return { href: "#", "data-anchor": href.slice(1) };
    if (/^https?:/i.test(href)) return { href: href, target: "_blank", rel: "noopener" };
    if (/^(tel|mailto):/i.test(href)) return { href: href };
    return { href: "#" };
  }
  PN.linkAttrs = linkAttrs;

  /* ---------- registry ---------- */
  var T = (PN.types = {});
  function def(type, d) { d.type = type; T[type] = d; }

  /* base element for a block */
  function base(b, ctx, tag, cls) {
    var e = el(tag || "div", { class: "pn-b pn-t-" + b.type + (cls ? " " + cls : ""), "data-bid": b.id, "data-type": b.type });
    if (b.hidden) e.classList.add("is-hidden");
    return e;
  }
  /* mark text that can be edited in place */
  function editable(node, key, opts) {
    node.setAttribute("data-edit", key);
    if (opts && opts.rich) node.setAttribute("data-rich", "1");
    if (opts && opts.multi) node.setAttribute("data-multi", "1");
    return node;
  }
  function setText(node, b, key, rich) {
    var v = b.props[key];
    if (rich) node.innerHTML = PN.sanitize(PN.tok(v)); else node.textContent = PN.tok(v);
    editable(node, key, { rich: rich });
    return node;
  }
  function kids(b, ctx) {
    var out = [];
    (b.children || []).forEach(function (c) { var n = PN.renderBlock(c, ctx); if (n) out.push(n); });
    return out;
  }

  PN.renderBlock = function (b, ctx) {
    if (b.type === "shared") {
      var root = ctx.project.shared[b.props.ref];
      if (!root) return null;
      if (b.hidden && !ctx.edit) return null;
      var n = PN.renderBlock(root, Object.assign({}, ctx, { viaRef: b }));
      if (n) { n.setAttribute("data-shared", b.props.ref); if (b.hidden) n.classList.add("is-hidden"); }
      return n;
    }
    if (b.hidden && !ctx.edit) return null;
    var t = T[b.type];
    if (!t) return null;
    return t.render(b, ctx);
  };

  /* ---------- types ---------- */

  def("shared", { label: "Shared block", container: false, fields: [], make: function () { return { props: { ref: "header" } }; }, render: function () { return null; } });

  def("logo", {
    label: "Logo", container: false,
    fields: [{ k: "variant", l: "Colors", t: "select", o: [["color", "On light"], ["white", "On dark"]] },
             { k: "src", l: "Logo image (optional)", t: "image" }, { k: "alt", l: "Alt text", t: "text" }],
    make: function () { return { props: { variant: "color", src: "", alt: "PostalNook home" } }; },
    render: function (b) {
      var a = base(b, null, "a", "pn-logo pn-logo--" + (b.props.variant || "color"));
      a.setAttribute("href", window.PN_EXPORT && PN.store && PN.store.project ? PN.store.hrefFor("home") : "#"); a.setAttribute("data-go", "home"); a.setAttribute("aria-label", b.props.alt || "PostalNook home");
      var drawn = function () { a.append(el("span", { class: "pn-logo-mark", html: LOGO_MARK }), el("span", { class: "pn-logo-word", html: "<b>Postal</b><span>Nook</span>" })); };
      if (b.props.src) { var li = el("img", { src: b.props.src, alt: "", class: "pn-logo-img" }); li.addEventListener("error", function () { li.remove(); drawn(); }, { once: true }); a.append(li); }
      else drawn();
      return a;
    }
  });

  def("navMenu", {
    label: "Dropdown menu", container: true,
    fields: [{ k: "label", l: "Menu name", t: "text" }],
    make: function () { return { props: { label: "Menu" }, children: [] }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "div", "pn-dd");
      var btn = el("button", { class: "pn-dd-toggle", type: "button", "aria-expanded": "false", "aria-haspopup": "true" });
      btn.append(setText(el("span", {}), b, "label"), PN.icon("chev", "pn-dd-chev"));
      var panel = el("div", { class: "pn-dd-panel", role: "menu" });
      (b.children || []).filter(function (c) { return !(c.hidden && !ctx.edit); }).forEach(function (c) { panel.append(PN.renderBlock(c, ctx)); });
      d.append(btn, panel); return d;
    }
  });

  def("navGroup", {
    label: "Menu column", container: true,
    fields: [{ k: "title", l: "Column title", t: "text" }, { k: "text", l: "Short line", t: "text" }],
    make: function () { return { props: { title: "Group", text: "" }, children: [] }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "div", "pn-dd-col");
      d.append(setText(el("p", { class: "pn-dd-col-t" }), b, "title"));
      if (b.props.text || ctx.edit) d.append(setText(el("p", { class: "pn-dd-col-d" }), b, "text"));
      var ul = el("div", { class: "pn-dd-col-l" });
      (b.children || []).forEach(function (c) { ul.append(PN.renderBlock(c, ctx)); });
      d.append(ul); return d;
    }
  });

  def("navLink", {
    label: "Link", container: false,
    fields: [{ k: "label", l: "Label", t: "text" }, { k: "href", l: "Goes to", t: "link" }],
    make: function () { return { props: { label: "New link", href: "page:home" } }; },
    render: function (b) {
      var a = base(b, null, "a", "pn-navlink");
      var at = linkAttrs(b.props.href); for (var k in at) a.setAttribute(k, at[k]);
      setText(a, b, "label");
      return a;
    }
  });

  def("button", {
    label: "Button", container: false,
    fields: [{ k: "label", l: "Label", t: "text" }, { k: "href", l: "Goes to", t: "link" },
             { k: "variant", l: "Look", t: "select", o: [["primary", "Orange"], ["outline", "Outline"], ["outline-dark", "Outline (on light)"], ["link", "Text link"]] },
             { k: "size", l: "Size", t: "select", o: [["md", "Normal"], ["lg", "Large"], ["sm", "Small"]] }],
    make: function () { return { props: { label: "Button", href: "page:contact", variant: "primary", size: "md" } }; },
    render: function (b) {
      var w = base(b, null, "div", "pn-btnwrap");
      var a = el("a", { class: "pn-btn pn-btn--" + (b.props.variant || "primary") + " pn-btn--" + (b.props.size || "md") });
      var at = linkAttrs(b.props.href); for (var k in at) a.setAttribute(k, at[k]);
      setText(a, b, "label");
      w.append(a);
      return w;
    }
  });

  def("heading", {
    label: "Heading", container: false,
    fields: [{ k: "text", l: "Text", t: "textarea" }, { k: "level", l: "Level", t: "select", o: [["1", "H1 (page title)"], ["2", "H2"], ["3", "H3"], ["4", "H4"]] }],
    make: function () { return { props: { text: "New heading", level: "2" } }; },
    render: function (b) {
      var h = base(b, null, "h" + (b.props.level || 2), "pn-heading");
      setText(h, b, "text");
      return h;
    }
  });

  def("paragraph", {
    label: "Paragraph", container: false,
    fields: [{ k: "text", l: "Text (simple HTML)", t: "textarea" }],
    make: function () { return { props: { text: "Write your text here." } }; },
    render: function (b) { var p = base(b, null, "p", "pn-p"); setText(p, b, "text", true); return p; }
  });

  def("image", {
    label: "Image", container: false,
    fields: [{ k: "src", l: "Image", t: "image" }, { k: "alt", l: "Alt text", t: "text" },
             { k: "fit", l: "Fit", t: "select", o: [["cover", "Fill (crop)"], ["contain", "Show all"]] },
             { k: "ratio", l: "Shape", t: "select", o: [["auto", "Natural"], ["16/9", "Wide 16:9"], ["4/3", "4:3"], ["1/1", "Square"]] }],
    make: function () { return { props: { src: "", alt: "Image", fit: "cover", ratio: "4/3" } }; },
    render: function (b) {
      var f = base(b, null, "figure", "pn-image");
      var box = el("div", { class: "pn-image-box" });
      if (b.props.ratio && b.props.ratio !== "auto") box.style.aspectRatio = b.props.ratio;
      if (b.props.src) box.append(withFallback(el("img", { src: b.props.src, alt: b.props.alt || "", loading: "lazy", style: "object-fit:" + (b.props.fit || "cover") }), b.props.alt || "Image"));
      else box.append(el("div", { class: "pn-ph" }, PN.icon("image"), el("span", { text: b.props.alt || "Image" })));
      f.append(box);
      return f;
    }
  });

  def("spacer", { label: "Spacer", container: false, fields: [{ k: "h", l: "Height (px)", t: "number" }],
    make: function () { return { props: { h: 32 } }; },
    render: function (b) { var d = base(b, null, "div", "pn-spacer"); d.style.height = (b.props.h || 24) + "px"; return d; } });

  def("divider", { label: "Divider", container: false, fields: [], make: function () { return { props: {} }; },
    render: function (b) { return base(b, null, "hr", "pn-divider"); } });

  def("section", {
    label: "Section", container: true,
    fields: [{ k: "bg", l: "Background", t: "select", o: [["white", "White"], ["warm", "Warm"], ["navy", "Navy"], ["tint", "Light blue"]] },
             { k: "width", l: "Content width", t: "select", o: [["normal", "Normal"], ["narrow", "Narrow"], ["wide", "Wide"]] },
             { k: "anchor", l: "Anchor name (for #links)", t: "text" }],
    make: function () { return { props: { bg: "white", width: "normal", anchor: "" }, children: [] }; },
    render: function (b, ctx) {
      var s = base(b, ctx, "section", "pn-section");
      s.setAttribute("data-bg", b.props.bg || "white"); s.setAttribute("data-width", b.props.width || "normal");
      if (b.props.anchor) s.setAttribute("data-anchor-id", b.props.anchor);
      var inner = el("div", { class: "pn-wrap pn-inner" }); kids(b, ctx).forEach(function (n) { inner.append(n); });
      s.append(inner); return s;
    }
  });

  def("banner", {
    label: "Page banner", container: true,
    fields: [{ k: "variant", l: "Layout", t: "select", o: [["title", "Title only"], ["hero", "Hero (left)"], ["center", "Hero (centered)"]] },
             { k: "title", l: "Title", t: "textarea" }, { k: "text", l: "Text (simple HTML)", t: "textarea" },
             { k: "imgSrc", l: "Picture (hero only)", t: "image" }, { k: "imgAlt", l: "Picture alt text (hero only)", t: "text" }],
    make: function () { return { props: { variant: "title", title: "Page title", text: "", imgSrc: "" }, children: [] }; },
    render: function (b, ctx) {
      var hasArt = b.props.variant === "hero" && (b.props.imgSrc || b.props.imgAlt != null);
      var s = base(b, ctx, "section", "pn-banner pn-banner--" + (b.props.variant || "title") + (hasArt ? " has-art" : ""));
      var inner = el("div", { class: "pn-wrap pn-inner" });
      var copy = hasArt ? el("div", { class: "pn-banner-copy" }) : inner;
      var h = el(ctx.h1 ? "h2" : "h1", { class: "pn-banner-title" }); ctx.h1 = true; setText(h, b, "title"); copy.append(h);
      if (b.props.text || ctx.edit) { var p = el("p", { class: "pn-banner-text" }); setText(p, b, "text", true); if (!b.props.text) p.classList.add("is-empty"); copy.append(p); }
      var ks = kids(b, ctx);
      if (ks.length) { var bt = el("div", { class: "pn-banner-btns" }); ks.forEach(function (n) { bt.append(n); }); copy.append(bt); }
      if (hasArt) {
        var art = el("div", { class: "pn-banner-art" });
        if (b.props.imgSrc) art.append(withFallback(el("img", { src: b.props.imgSrc, alt: b.props.imgAlt || "" }), b.props.imgAlt || "Image", "pn-ph--art")); else art.append(el("div", { class: "pn-ph pn-ph--art" }, PN.icon("image"), el("span", { text: b.props.imgAlt || "Image" })));
        inner.classList.add("pn-banner-grid"); inner.append(copy, art);
      }
      s.append(inner); return s;
    }
  });

  def("columns", {
    label: "Columns", container: true,
    fields: [{ k: "cols", l: "Columns", t: "select", o: [["2", "2"], ["3", "3"], ["4", "4"]] },
             { k: "valign", l: "Vertical align", t: "select", o: [["stretch", "Stretch"], ["start", "Top"], ["center", "Middle"]] }],
    make: function () { return { props: { cols: "3", valign: "stretch" }, children: [] }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "div", "pn-columns");
      d.style.setProperty("--cols", b.props.cols || 3); d.setAttribute("data-valign", b.props.valign || "stretch");
      kids(b, ctx).forEach(function (n) { d.append(n); }); return d;
    }
  });

  def("group", {
    label: "Group", container: true,
    fields: [{ k: "layout", l: "Layout", t: "select", o: [["stack", "Stack"], ["row", "Row"], ["links2", "Two columns of links"], ["f-cols", "Footer columns"], ["f-bottom", "Footer bottom"]] }],
    make: function () { return { props: { layout: "stack" }, children: [] }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "div", "pn-group"); d.setAttribute("data-layout", b.props.layout || "stack");
      kids(b, ctx).forEach(function (n) { d.append(n); }); return d;
    }
  });

  def("card", {
    label: "Card", container: true,
    fields: [{ k: "variant", l: "Look", t: "select", o: [["plain", "Plain"], ["outline", "Outline"], ["accent", "Top color"], ["flat", "Flat"]] },
             { k: "accent", l: "Top color", t: "color" },
             { k: "badge", l: "Number badge", t: "text" }, { k: "tag", l: "Pill text", t: "text" }],
    make: function () { return { props: { variant: "plain", accent: "", badge: "", tag: "" }, children: [] }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "div", "pn-card pn-card--" + (b.props.variant || "plain"));
      if (b.props.accent) d.style.setProperty("--accent", b.props.accent);
      if (b.props.badge) d.append(editable(el("span", { class: "pn-badge", text: b.props.badge }), "badge"));
      if (b.props.tag) d.append(editable(el("span", { class: "pn-pill", text: b.props.tag }), "tag"));
      kids(b, ctx).forEach(function (n) { d.append(n); }); return d;
    }
  });

  def("list", {
    label: "List", container: true,
    fields: [{ k: "variant", l: "Marker", t: "select", o: [["bullets", "Bullets"], ["checks", "Check marks"], ["crosses", "Cross marks"], ["chips", "Chips"], ["plain", "None"]] }],
    make: function () { return { props: { variant: "bullets" }, children: [{ type: "listItem", props: { text: "First item" } }, { type: "listItem", props: { text: "Second item" } }, { type: "listItem", props: { text: "Third item" } }] }; },
    render: function (b, ctx) {
      var u = base(b, ctx, "ul", "pn-list pn-list--" + (b.props.variant || "bullets"));
      kids(b, ctx).forEach(function (n) { u.append(n); }); return u;
    }
  });
  def("listItem", {
    label: "List item", container: false,
    fields: [{ k: "text", l: "Text (simple HTML)", t: "textarea" }],
    make: function () { return { props: { text: "List item" } }; },
    render: function (b) { var li = base(b, null, "li", "pn-li"); setText(li, b, "text", true); return li; }
  });

  def("pricingCard", {
    label: "Pricing card", container: true,
    fields: [{ k: "name", l: "Plan name", t: "text" }, { k: "tagline", l: "Short text", t: "text" },
             { k: "pre", l: "Text before price", t: "text" }, { k: "price", l: "Price", t: "text" }, { k: "period", l: "Period", t: "text" },
             { k: "pricePos", l: "Price position", t: "select", o: [["after", "After short text"], ["before", "Before short text"]] },
             { k: "accent", l: "Top color", t: "color" },
             { k: "ctaLabel", l: "Button label", t: "text" }, { k: "ctaHref", l: "Button goes to", t: "link" }],
    make: function () { return { props: { name: "Plan", tagline: "Short description", price: "$0", period: "/month", accent: "", ctaLabel: "Subscribe", ctaHref: "https://www.postalnook.com/signup" }, children: [{ type: "listItem", props: { text: "Feature one" } }, { type: "listItem", props: { text: "Feature two" } }] }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "article", "pn-card pn-card--accent pn-pricing");
      if (b.props.accent) d.style.setProperty("--accent", b.props.accent);
      d.append(setText(el("h3", { class: "pn-price-name" }), b, "name"));
      var tg = b.props.tagline ? setText(el("p", { class: "pn-price-tag" }), b, "tagline") : null, pr = null;
      if (b.props.price) { pr = el("p", { class: "pn-price" }); if (b.props.pre) pr.append(editable(el("span", { class: "pn-price-pre", text: b.props.pre + " " }), "pre")); pr.append(editable(el("span", { class: "pn-price-n", text: b.props.price }), "price"), editable(el("span", { class: "pn-price-p", text: " " + (b.props.period || "") }), "period")); }
      if (b.props.pricePos === "before") d.append(pr, tg); else d.append(tg, pr);
      var ul = el("ul", { class: "pn-list pn-list--checks" }); kids(b, ctx).forEach(function (n) { ul.append(n); }); d.append(ul);
      if (b.props.ctaLabel) { var a = el("a", { class: "pn-btn pn-btn--primary pn-btn--md pn-btn--block" }); var at = linkAttrs(b.props.ctaHref); for (var k in at) a.setAttribute(k, at[k]); setText(a, b, "ctaLabel"); d.append(a); }
      return d;
    }
  });

  def("iconLine", {
    label: "Contact line", container: false,
    fields: [{ k: "icon", l: "Icon", t: "select", o: [["phone", "Phone"], ["mail", "Email"], ["pin", "Address"]] },
             { k: "text", l: "Text", t: "text" }, { k: "href", l: "Goes to (optional)", t: "link" }],
    make: function () { return { props: { icon: "phone", text: "{{phone}}", href: "" } }; },
    render: function (b) {
      var hasLink = !!b.props.href;
      var d = base(b, null, hasLink ? "a" : "div", "pn-iconline");
      if (hasLink) { var at = linkAttrs(b.props.href); for (var k in at) d.setAttribute(k, at[k]); }
      d.append(el("span", { class: "pn-iconline-ic" }, PN.icon(b.props.icon)));
      d.append(setText(el("span", { class: "pn-iconline-t" }), b, "text"));
      return d;
    }
  });

  def("social", {
    label: "Social icon", container: false,
    fields: [{ k: "kind", l: "Network", t: "select", o: ["facebook", "whatsapp", "x", "linkedin", "instagram", "youtube", "google", "yelp"].map(function (x) { return [x, x[0].toUpperCase() + x.slice(1)]; }) },
             { k: "href", l: "Link", t: "link" }],
    make: function () { return { props: { kind: "facebook", href: "https://" } }; },
    render: function (b) {
      var a = base(b, null, "a", "pn-social"); var at = linkAttrs(b.props.href); for (var k in at) a.setAttribute(k, at[k]);
      a.setAttribute("aria-label", b.props.kind); a.append(PN.icon(b.props.kind)); return a;
    }
  });

  def("linkRow", {
    label: "Link row", container: false,
    fields: [{ k: "title", l: "Title", t: "text" }, { k: "text", l: "Text", t: "textarea" }, { k: "href", l: "Goes to", t: "link" }],
    make: function () { return { props: { title: "Link title", text: "Short description.", href: "page:home" } }; },
    render: function (b) {
      var a = base(b, null, "a", "pn-linkrow"); var at = linkAttrs(b.props.href); for (var k in at) a.setAttribute(k, at[k]);
      a.append(el("span", { class: "pn-linkrow-t" }, setText(el("span"), b, "title"), PN.icon("arrow")));
      a.append(setText(el("span", { class: "pn-linkrow-d" }), b, "text")); return a;
    }
  });

  def("blogSearch", {
    label: "Searchable post list", container: true,
    fields: [{ k: "placeholder", l: "Search box hint", t: "text" }, { k: "emptyText", l: "No match message", t: "text" }, { k: "browseLabel", l: "Browse button label", t: "text" }, { k: "browseHref", l: "Browse button goes to", t: "link" }],
    make: function () { return { props: { placeholder: "Search posts", emptyText: "No posts match.", browseLabel: "Browse all posts", browseHref: "page:blog" }, children: [] }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "div", "pn-bsearch");
      var inp = el("input", { class: "pn-bsearch-in", type: "search", placeholder: b.props.placeholder || "Search", "aria-label": b.props.placeholder || "Search", autocomplete: "off" });
      var box = el("div", { class: "pn-bsearch-box" }, PN.icon("search"), inp);
      var cnt = el("p", { class: "pn-bsearch-cnt", "aria-live": "polite" });
      var grid = el("div", { class: "pn-bsearch-grid" });
      var cards = kids(b, ctx); cards.forEach(function (n) { grid.append(n); });
      var none = el("p", { class: "pn-bsearch-none", hidden: "" }); none.textContent = b.props.emptyText || "No posts match.";
      d.append(box, cnt, grid, none);
      if (b.props.browseLabel) { var br = el("a", { class: "pn-btn pn-btn--primary pn-btn--md pn-bsearch-all" }); var at = linkAttrs(b.props.browseHref); for (var kk in at) br.setAttribute(kk, at[kk]); br.textContent = b.props.browseLabel; d.append(el("div", { class: "pn-btnwrap" }, br)); }
      function run() {
        var w = inp.value.trim().toLowerCase().split(/\s+/).filter(Boolean), n = 0;
        cards.forEach(function (c) { var t = c.textContent.toLowerCase(), ok = w.every(function (x) { return t.indexOf(x) > -1; }); c.hidden = !ok; if (ok) n++; });
        cnt.textContent = w.length ? "Showing " + n + " of " + cards.length + " posts" : "Showing the latest " + cards.length + " posts";
        none.hidden = n > 0;
      }
      inp.addEventListener("input", run); inp.addEventListener("keydown", function (e) { if (e.key === "Escape") { inp.value = ""; run(); } });
      run(); return d;
    }
  });

  def("faq", {
    label: "FAQ item", container: false,
    fields: [{ k: "q", l: "Question", t: "textarea" }, { k: "a", l: "Answer (simple HTML)", t: "textarea" }],
    make: function () { return { props: { q: "New question?", a: "Answer." } }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "div", "pn-faq");
      var q = el("button", { class: "pn-faq-q", type: "button" }); q.append(setText(el("span", { class: "pn-faq-qt" }), b, "q"), el("span", { class: "pn-faq-x", "aria-hidden": "true", text: "+" }));
      var a = el("div", { class: "pn-faq-a" }); setText(a, b, "a", true);
      d.append(q, a);
      if (ctx.edit) d.classList.add("is-open");
      return d;
    }
  });
  def("faqGroup", {
    label: "FAQ category", container: true,
    fields: [{ k: "name", l: "Category name", t: "text" }],
    make: function () { return { props: { name: "New category" }, children: [{ type: "faq", props: { q: "Question?", a: "Answer." } }] }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "div", "pn-faqgroup"); d.setAttribute("data-name", b.props.name);
      if (ctx.edit) d.append(setText(el("h3", { class: "pn-faqgroup-title" }), b, "name"));
      kids(b, ctx).forEach(function (n) { d.append(n); }); return d;
    }
  });
  def("faqTabs", {
    label: "FAQ with categories", container: true,
    fields: [],
    make: function () { return { props: {}, children: [] }; },
    render: function (b, ctx) {
      var d = base(b, ctx, "div", "pn-faqtabs");
      var groups = (b.children || []).filter(function (c) { return !(c.hidden && !ctx.edit); });
      var active = (ctx.ui && ctx.ui.faqTab && ctx.ui.faqTab[b.id]); if (!groups.some(function (g) { return g.id === active; })) active = groups[0] && groups[0].id;
      if (!ctx.edit) {
        var tabs = el("div", { class: "pn-faqtabs-nav", role: "tablist" });
        groups.forEach(function (g) { tabs.append(el("button", { type: "button", role: "tab", class: "pn-chip" + (g.id === active ? " is-on" : ""), "data-faqtab": g.id, "data-faqtabs": b.id, "aria-selected": g.id === active ? "true" : "false", text: g.props.name })); });
        d.append(tabs);
      }
      var wrap = el("div", { class: "pn-faqtabs-body" });
      groups.forEach(function (g) { var n = PN.renderBlock(g, ctx); if (n) { if (!ctx.edit && g.id !== active) n.hidden = true; wrap.append(n); } });
      d.append(wrap); return d;
    }
  });

  def("blogCard", {
    label: "Blog card", container: false,
    fields: [{ k: "title", l: "Title", t: "textarea" }, { k: "excerpt", l: "Excerpt", t: "textarea" }, { k: "href", l: "Goes to", t: "link" },
             { k: "imgSrc", l: "Image", t: "image" }, { k: "imgAlt", l: "Image alt text", t: "text" }],
    make: function () { return { props: { title: "Post title", excerpt: "Short summary of the post.", href: "page:blog", imgSrc: "", imgAlt: "" } }; },
    render: function (b) {
      var a = base(b, null, "article", "pn-blogcard");
      var link = el("a", { class: "pn-blogcard-link" }); var at = linkAttrs(b.props.href); for (var k in at) link.setAttribute(k, at[k]);
      var box = el("div", { class: "pn-blogcard-img" });
      if (b.props.imgSrc) box.append(withFallback(el("img", { src: b.props.imgSrc, alt: b.props.imgAlt || "", loading: "lazy" }), "Image")); else box.append(el("div", { class: "pn-cover-brand", "aria-hidden": "true" }, el("img", { src: "img/logo-white.webp", alt: "" })));
      var body = el("div", { class: "pn-blogcard-body" });
      body.append(setText(el("h3", { class: "pn-blogcard-t" }), b, "title"), setText(el("p", { class: "pn-blogcard-d" }), b, "excerpt"));
      link.append(box, body); a.append(link); return a;
    }
  });

  def("pager", {
    label: "Pagination", container: false,
    fields: [{ k: "labels", l: "Labels (comma separated)", t: "text" }],
    make: function () { return { props: { labels: "Previous,1,2,More pages,Next" } }; },
    render: function (b) {
      var n = base(b, null, "nav", "pn-pager"); n.setAttribute("aria-label", "Pagination");
      String(b.props.labels || "").split(",").forEach(function (l, i) { l = l.trim(); if (!l) return; n.append(el("span", { class: "pn-page-i" + (l === "1" ? " is-on" : ""), text: l })); });
      return n;
    }
  });

  /* ----- shared roots ----- */
  def("header", {
    label: "Header", container: true, fields: [],
    make: function () { return { props: {}, children: [] }; },
    render: function (b, ctx) {
      var h = base(b, ctx, "header", "pn-header");
      var wrap = el("div", { class: "pn-wrap pn-header-in" });
      var cs = (b.children || []).filter(function (c) { return !(c.hidden && !ctx.edit); });
      var logo = cs.filter(function (c) { return c.type === "logo"; });
      logo.forEach(function (c) { wrap.append(PN.renderBlock(c, ctx)); });
      wrap.append(el("button", { class: "pn-menu-btn", type: "button", "aria-label": "Open menu", "aria-expanded": "false" }, PN.icon("menu")));
      var nav = el("nav", { class: "pn-nav", "aria-label": "Main" });
      cs.filter(function (c) { return c.type === "navLink" || c.type === "navMenu"; }).forEach(function (c) { nav.append(PN.renderBlock(c, ctx)); });
      var bt = el("div", { class: "pn-nav-btns" });
      cs.filter(function (c) { return c.type === "button"; }).forEach(function (c) { bt.append(PN.renderBlock(c, ctx)); });
      nav.append(bt); wrap.append(nav); h.append(wrap); return h;
    }
  });

  def("footer", {
    label: "Footer", container: true, fields: [],
    make: function () { return { props: {}, children: [] }; },
    render: function (b, ctx) {
      var f = base(b, ctx, "footer", "pn-footer");
      kids(b, ctx).forEach(function (n, i, all) {
        var band = el("div", { class: "pn-f-band" + (i === all.length - 1 && all.length > 1 ? " is-last" : "") }, el("div", { class: "pn-wrap" }, n));
        f.append(band);
      });
      return f;
    }
  });

  def("contact", {
    label: "Contact section", container: false,
    fields: [{ k: "title", l: "Form title", t: "text" }, { k: "text", l: "Form text", t: "textarea" },
             { k: "button", l: "Submit button", t: "text" }, { k: "consent", l: "Consent text (simple HTML)", t: "textarea" },
             { k: "mapTitle", l: "Map card title", t: "text" }, { k: "mapText", l: "Map card text", t: "textarea" },
             { k: "imgSrc", l: "Illustration", t: "image" }],
    make: function () { return { props: { title: "Have a question?", text: "", button: "Get Started", consent: "", mapTitle: "Contact Us", mapText: "", imgSrc: "" } }; },
    render: function (b, ctx) {
      var s = base(b, ctx, "section", "pn-contact"); s.setAttribute("data-anchor-id", "contactus");
      var wrap = el("div", { class: "pn-wrap" });
      var grid = el("div", { class: "pn-contact-grid" });
      var art = el("div", { class: "pn-contact-art" });
      if (b.props.imgSrc) art.append(el("img", { src: b.props.imgSrc, alt: "" })); else art.append(el("div", { class: "pn-ph pn-ph--art" }, PN.icon("image"), el("span", { text: "Illustration" })));
      var card = el("div", { class: "pn-formcard" });
      card.append(el("span", { class: "pn-qicon" }, PN.icon("question")));
      card.append(setText(el("h2", { class: "pn-formcard-t" }), b, "title"), setText(el("p", { class: "pn-formcard-d" }), b, "text"));
      var f = el("form", { class: "pn-form", novalidate: "", "data-form": "contact" });
      f.append(el("div", { class: "pn-row2" },
        el("label", { class: "pn-field", for: "f-name" }, el("span", { html: "Your name <i>*</i>" }), el("input", { id: "f-name", name: "name", type: "text", placeholder: "Your name", required: "" })),
        el("label", { class: "pn-field", for: "f-email" }, el("span", { html: "Email <i>*</i>" }), el("input", { id: "f-email", name: "email", type: "email", placeholder: "Your email", required: "" }))));
      f.append(el("label", { class: "pn-field", for: "f-msg" }, el("span", { html: "Comments/Feedback <i>*</i>" }), el("textarea", { id: "f-msg", name: "msg", rows: "3", placeholder: "Your question or comment...", required: "" })));
      var cons = el("label", { class: "pn-consent", for: "f-agree" }, el("input", { id: "f-agree", type: "checkbox", required: "" }), setText(el("span"), b, "consent", true));
      f.append(cons);
      var sb = el("button", { class: "pn-btn pn-btn--primary pn-btn--md", type: "submit" }); setText(sb, b, "button"); f.append(sb);
      f.append(el("p", { class: "pn-form-msg", role: "alert", hidden: "" }));
      card.append(f); grid.append(art, card); wrap.append(grid);
      /* map */
      var map = el("div", { class: "pn-map" });
      var mp = el("div", { class: "pn-map-art", "aria-hidden": "true" }, el("span", { class: "pn-map-pin", html: SVG.pin }));
      var mc = el("div", { class: "pn-map-card" });
      mc.append(setText(el("h2", {}), b, "mapTitle"), setText(el("p", {}), b, "mapText"));
      var lines = el("div", { class: "pn-map-lines" });
      [["phone", "{{phone}}", "tel:+15123581060"], ["mail", "{{email}}", "mailto:{{email}}"], ["pin", "{{address}}", ""]].forEach(function (x) {
        lines.append(el("div", { class: "pn-iconline" }, el("span", { class: "pn-iconline-ic" }, PN.icon(x[0])), el("span", { class: "pn-iconline-t", text: PN.tok(x[1]) })));
      });
      mc.append(lines);
      var open = el("a", { class: "pn-map-open", target: "_blank", rel: "noopener", href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(window.SITE.address), text: "Open in Google Maps" });
      var frame = el("iframe", { class: "pn-map-frame", title: "Map showing the PostalNook store", loading: "lazy", referrerpolicy: "no-referrer-when-downgrade", allowfullscreen: "",
        src: "https://www.google.com/maps?q=" + encodeURIComponent(window.SITE.address) + "&z=15&output=embed" });
      map.append(mp, frame, mc, open); wrap.append(map);
      s.append(wrap); return s;
    }
  });

  def("vip", {
    label: "VIP Club bar", container: false,
    fields: [{ k: "title", l: "Title", t: "text" }, { k: "text", l: "Text", t: "textarea" }, { k: "placeholder", l: "Email placeholder", t: "text" },
             { k: "button", l: "Button", t: "text" }, { k: "consent", l: "Consent text (simple HTML)", t: "textarea" }],
    make: function () { return { props: { title: "Join our VIP Club", text: "", placeholder: "", button: "Subscribe", consent: "" } }; },
    render: function (b, ctx) {
      var s = base(b, ctx, "section", "pn-vip"); var wrap = el("div", { class: "pn-wrap pn-vip-in" });
      var left = el("div", { class: "pn-vip-l" }, el("span", { class: "pn-vip-ic" }, PN.icon("bell")),
        el("div", {}, setText(el("h2"), b, "title"), setText(el("p"), b, "text")));
      var f = el("form", { class: "pn-vip-f", novalidate: "", "data-form": "vip" });
      var rowf = el("div", { class: "pn-vip-row" }, el("input", { id: "vip-email", type: "email", "aria-label": "Email", placeholder: PN.tok(b.props.placeholder), required: "" }));
      var sb = el("button", { class: "pn-btn pn-btn--primary pn-btn--md", type: "submit" }); setText(sb, b, "button"); rowf.append(sb);
      f.append(rowf, el("label", { class: "pn-consent", for: "vip-agree" }, el("input", { id: "vip-agree", type: "checkbox", required: "" }), setText(el("span"), b, "consent", true)), el("p", { class: "pn-form-msg", role: "status", hidden: "" }));
      wrap.append(left, f); s.append(wrap); return s;
    }
  });

  def("thankyou", {
    label: "Thank you message", container: true,
    fields: [{ k: "title", l: "Title", t: "text" }, { k: "text", l: "Message", t: "textarea" },
             { k: "buttonLabel", l: "Main button", t: "text" }, { k: "buttonHref", l: "Main button goes to", t: "link" },
             { k: "seconds", l: "Auto-return after (seconds, 0 = off)", t: "number" },
             { k: "cueTitle", l: "Extra links heading", t: "text" }, { k: "helpLead", l: "Help line", t: "text" }],
    make: function () { return { props: { title: "Thank you.", text: "We got your message.", buttonLabel: "Return to homepage", buttonHref: "page:home", seconds: 15, cueTitle: "While you wait", helpLead: "Need help sooner? Call" }, children: [] }; },
    render: function (b, ctx) {
      var s = base(b, ctx, "section", "pn-thanks"); if (!ctx.edit) s.classList.add("pn-intro");
      var wrap = el("div", { class: "pn-wrap pn-thanks-in" });
      var card = el("div", { class: "pn-thanks-card", role: "status", "aria-live": "polite" });
      card.append(el("div", { class: "pn-tick", "aria-hidden": "true", html: '<svg viewBox="0 0 64 64"><circle class="disc" cx="32" cy="32" r="32"/><path class="mark" pathLength="1" d="M19 33.5 28.5 43 46 23.5"/></svg>' }));
      card.append(editable(el("h1", { class: "pn-rise pn-thanks-t", style: "--i:0", text: PN.tok(b.props.title) }), "title"));
      card.append(editable(el("p", { class: "pn-rise pn-thanks-p", style: "--i:1", text: PN.tok(b.props.text) }), "text"));
      var pr = el("div", { class: "pn-rise pn-thanks-primary", style: "--i:2" });
      var cta = el("div", { class: "pn-cta" });
      var secs = parseInt(b.props.seconds, 10) || 0;
      if (secs > 0) cta.append(el("span", { class: "pn-ringwrap", "aria-hidden": "true", "data-secs": secs, html: '<svg class="pn-ring"><rect class="track"></rect><rect class="prog" pathLength="100"></rect></svg>' }));
      var a = el("a", { class: "pn-btn pn-btn--primary pn-btn--lg" }); var at = linkAttrs(b.props.buttonHref); for (var k in at) a.setAttribute(k, at[k]); setText(a, b, "buttonLabel");
      cta.append(a); pr.append(cta);
      if (secs > 0) pr.append(el("div", { class: "pn-timer", "data-secs": secs }, el("span", { class: "pn-timer-t" }, "Taking you home in ", el("span", { class: "pn-timer-n", text: String(secs) }), "s"), el("button", { type: "button", class: "pn-timer-stay", text: "Stay on this page" })));
      card.append(pr);
      var cue = el("div", { class: "pn-rise pn-cue", style: "--i:5" });
      cue.append(editable(el("h2", { class: "pn-cue-h", text: PN.tok(b.props.cueTitle) }), "cueTitle"));
      var ul = el("ul", { class: "pn-cue-list" }); kids(b, ctx).forEach(function (n) { ul.append(el("li", {}, n)); }); cue.append(ul);
      var help = el("p", { class: "pn-help" }); help.append(editable(el("span", { text: PN.tok(b.props.helpLead) + " " }), "helpLead"), el("a", { href: window.SITE.phoneHref, text: PN.tok("{{phone}}") }));
      cue.append(help); card.append(cue);
      wrap.append(card); s.append(wrap); return s;
    }
  });

  /* ---------- factory ---------- */
  PN.make = function (type, overrides) {
    var t = T[type]; if (!t) throw new Error("Unknown block type " + type);
    var m = t.make();
    var b = { id: PN.uid(), type: type, props: m.props || {}, style: {}, bp: {} };
    if (t.container) b.children = (m.children || []).map(function (c) { return PN.hydrate(c); });
    if (overrides) Object.assign(b.props, overrides);
    return b;
  };
  PN.hydrate = function (c) {
    var out = { id: c.id || PN.uid(), type: c.type, props: c.props || {}, style: c.style || {}, bp: c.bp || {} };
    if (c.hidden) out.hidden = true;
    if (T[c.type] && T[c.type].container) out.children = (c.children || []).map(PN.hydrate);
    return out;
  };
  PN.cloneBlock = function (b) {
    var n = JSON.parse(JSON.stringify(b));
    (function re(x) { x.id = PN.uid(); (x.children || []).forEach(re); })(n);
    return n;
  };

  /* menu presets for "Add block" */
  PN.addMenu = [
    { id: "heading", label: "Heading", make: function () { return PN.make("heading"); } },
    { id: "paragraph", label: "Paragraph", make: function () { return PN.make("paragraph"); } },
    { id: "image", label: "Image", make: function () { return PN.make("image"); } },
    { id: "button", label: "Button", make: function () { return PN.make("button"); } },
    { id: "card", label: "Card", make: function () { var c = PN.make("card"); c.children = [PN.make("heading", { text: "Card title", level: "3" }), PN.make("paragraph", { text: "Card text." })]; return c; } },
    { id: "cols2", label: "2 columns", make: function () { var c = PN.make("columns", { cols: "2" }); c.children = [0, 1].map(function () { var d = PN.make("card"); d.children = [PN.make("heading", { text: "Title", level: "3" }), PN.make("paragraph", { text: "Text." })]; return d; }); return c; } },
    { id: "cols3", label: "3 columns", make: function () { var c = PN.make("columns", { cols: "3" }); c.children = [0, 1, 2].map(function () { var d = PN.make("card"); d.children = [PN.make("heading", { text: "Title", level: "3" }), PN.make("paragraph", { text: "Text." })]; return d; }); return c; } },
    { id: "list", label: "List", make: function () { return PN.make("list"); } },
    { id: "faq", label: "FAQ item", make: function () { return PN.make("faq"); } },
    { id: "pricing", label: "Pricing card", make: function () { return PN.make("pricingCard"); } },
    { id: "banner", label: "Banner", make: function () { return PN.make("banner"); } },
    { id: "section", label: "Section", make: function () { var s = PN.make("section"); s.children = [PN.make("heading", { text: "Section heading" }), PN.make("paragraph", { text: "Section text." })]; return s; } },
    { id: "spacer", label: "Spacer", make: function () { return PN.make("spacer"); } }
  ];

  /* ---------- per-block style to CSS ---------- */
  var SHADOWS = { none: "none", soft: "0 4px 14px rgba(0,37,68,.08)", medium: "0 10px 30px rgba(0,37,68,.14)", strong: "0 18px 48px rgba(0,37,68,.22)" };
  PN.SHADOWS = SHADOWS;
  function px(v) { return v === "" || v == null ? null : (/^-?\d+(\.\d+)?$/.test(String(v)) ? v + "px" : String(v)); }
  PN.styleToCss = function (s) {
    if (!s) return "";
    var d = [];
    function add(p, v) { if (v != null && v !== "") d.push(p + ":" + v); }
    add("font-size", px(s.fontSize)); add("font-weight", s.weight); add("color", s.color); add("background", s.bg);
    add("text-align", s.align);
    ["Top", "Right", "Bottom", "Left"].forEach(function (side, i) {
      var k = ["t", "r", "b", "l"][i];
      add("padding-" + side.toLowerCase(), px(s["p" + k])); add("margin-" + side.toLowerCase(), px(s["m" + k]));
    });
    add("gap", px(s.gap)); add("width", px(s.width)); add("max-width", px(s.maxWidth)); add("border-radius", px(s.radius));
    if (s.shadow) add("box-shadow", SHADOWS[s.shadow] || s.shadow);
    return d.join(";");
  };
  PN.buildCss = function (blocks, project) {
    var base = [], tab = [], ph = [];
    (function walk(list) {
      list.forEach(function (b) {
        if (b.type === "shared") { var r = project.shared[b.props.ref]; if (r) walk([r]); return; }
        var sel = '[data-bid="' + b.id + '"]';
        var c = PN.styleToCss(b.style); if (c) base.push(sel + "{" + c + "}");
        c = PN.styleToCss(b.bp && b.bp.tablet); if (c) tab.push(sel + "{" + c + "}");
        c = PN.styleToCss(b.bp && b.bp.phone); if (c) ph.push(sel + "{" + c + "}");
        if (b.children) walk(b.children);
      });
    })(blocks);
    var out = base.join("\n");
    if (tab.length) out += "\n@container stage (max-width: 900px){\n" + tab.join("\n") + "\n}";
    if (ph.length) out += "\n@container stage (max-width: 560px){\n" + ph.join("\n") + "\n}";
    return out;
  };

  /* short readable name for a block (used in layers and the change summary) */
  PN.describe = function (b) {
    var t = T[b.type]; var p = b.props || {};
    var s = p.title || p.text || p.label || p.name || p.q || p.alt || p.mapTitle || (b.type === "shared" ? p.ref : "");
    s = PN.stripHtml(PN.tok(s)); if (s.length > 34) s = s.slice(0, 33) + "…";
    return (t ? t.label : b.type) + (s ? ' "' + s + '"' : "");
  };
})();
