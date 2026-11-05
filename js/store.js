/* Project state: pages as JSON, history (undo/redo), autosave, change log. */
(function () {
  var PN = (window.PN = window.PN || {});
  var KEY = "pn-project-v1";
  var MAX_STEPS = 100;

  var S = (PN.store = {
    project: null,      // { pages:[{id,title,path,blocks}], shared:{header,footer,contact,vip} }
    pristine: null,     // JSON string of the live content
    pageId: "home",
    mode: "edit",       // edit | preview
    device: "desktop",  // desktop | tablet | phone
    sel: null,
    snap: "",
    undoStack: [], redoStack: [], log: [],
    memoryOnly: false, saveState: "idle", saveError: "",
    ui: { faqTab: {} },
    _l: [], _saveT: null
  });

  S.on = function (fn) { S._l.push(fn); };
  S.emit = function (kind, data) { S._l.forEach(function (f) { try { f(kind, data); } catch (e) { console.error(e); } }); };

  /* ---------- loading ---------- */
  function getJson(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + " " + r.status); return r.json(); });
  }
  /* data/bundle.js holds the same JSON as the files in data/. It avoids network requests. */
  function getData(url) {
    var b = window.PN_DATA;
    if (b && b[url] !== undefined) return Promise.resolve(JSON.parse(JSON.stringify(b[url])));
    return getJson(url);
  }
  S.load = function () {
    return getData("data/pages/index.json").then(function (idx) {
      return Promise.all([getData("data/shared.json")].concat(idx.map(function (p) { return getData("data/pages/" + p.file); }))).then(function (arr) {
        var shared = arr[0]; var pages = arr.slice(1);
        var proj = { pages: pages.map(function (p, i) { return { id: idx[i].id, title: idx[i].title, path: idx[i].path, blocks: p.blocks }; }), shared: shared };
        proj = hydrateProject(proj);
        S.pristine = JSON.stringify(proj);
        var saved = window.PN_EXPORT ? null : readSaved();
        if (saved && saved.project && saved.project.pages && saved.project.shared) {
          S.project = hydrateProject(saved.project);
          S.pageId = S.project.pages.some(function (p) { return p.id === saved.pageId; }) ? saved.pageId : "home";
          S.restored = true;
        } else S.project = proj;
        if (window.PN_EXPORT) { S.mode = "preview"; var pm = document.querySelector('meta[name="pn-page"]'); S.pageId = (pm && !window.PN_EXPORT.notFound && S.project.pages.some(function (x) { return x.id === pm.content; })) ? pm.content : S.idFromUrl(location.href);
          var r = S.resolve(S.pageId); if (r !== S.pageId) { S.pageId = r; try { history.replaceState({ id: r }, "", S.urlFor(r)); } catch (e) {} S.setMeta(r); } }
        S.snap = JSON.stringify(S.project);
      });
    });
  };
  function hydrateProject(p) {
    var out = { pages: p.pages.map(function (pg) { return { id: pg.id, title: pg.title, path: pg.path, blocks: pg.blocks.map(PN.hydrate) }; }), shared: {} };
    Object.keys(p.shared).forEach(function (k) { out.shared[k] = PN.hydrate(p.shared[k]); });
    return out;
  }
  function readSaved() {
    try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }

  /* ---------- saving ---------- */
  S.save = function () {
    if (window.PN_EXPORT) return;
    clearTimeout(S._saveT);
    S.saveState = "saving"; S.emit("save");
    S._saveT = setTimeout(function () {
      try {
        localStorage.setItem(KEY, JSON.stringify({ v: 1, pageId: S.pageId, project: S.project }));
        S.memoryOnly = false; S.saveState = "saved"; S.saveError = "";
      } catch (e) {
        S.memoryOnly = true; S.saveState = "memory";
        S.saveError = (e && e.name === "QuotaExceededError") ? "Storage is full (large images?)." : "Storage is not available here.";
      }
      S.emit("save");
    }, 350);
  };
  S.clearSaved = function () { try { localStorage.removeItem(KEY); } catch (e) {} };

  /* ---------- lookup ---------- */
  S.page = function (id) { id = id || S.pageId; for (var i = 0; i < S.project.pages.length; i++) if (S.project.pages[i].id === id) return S.project.pages[i]; return S.project.pages[0]; };

  /* find a block in the current page tree. Returns {block, arr, idx, parent, ref} or null.
     A shared root is found through its ref in the page: arr/idx point at the ref. */
  S.find = function (id, pageId) {
    var page = S.page(pageId);
    function walk(arr, parent) {
      for (var i = 0; i < arr.length; i++) {
        var b = arr[i];
        if (b.type === "shared") {
          var root = S.project.shared[b.props.ref];
          if (root) {
            if (root.id === id) return { block: root, arr: arr, idx: i, parent: parent, ref: b };
            var r = walk(root.children || [], root); if (r) return r;
          }
          continue;
        }
        if (b.id === id) return { block: b, arr: arr, idx: i, parent: parent, ref: null };
        if (b.children) { var r2 = walk(b.children, b); if (r2) return r2; }
      }
      return null;
    }
    return walk(page.blocks, null);
  };
  S.findShared = function (id) { for (var k in S.project.shared) { if (S.project.shared[k].id === id) return k; } return null; };

  S.isInside = function (ancestor, id) { // is block `id` inside (or equal to) `ancestor`?
    if (ancestor.id === id) return true;
    return (ancestor.children || []).some(function (c) { return S.isInside(c, id); });
  };

  /* ---------- history ---------- */
  S.commit = function (entry) {
    var after = JSON.stringify(S.project);
    if (after === S.snap) return false;
    S.undoStack.push({ before: S.snap, after: after, entry: entry || null });
    var limit = after.length > 2500000 ? 30 : MAX_STEPS;
    while (S.undoStack.length > limit) S.undoStack.shift();
    S.redoStack = [];
    if (entry) S.log.push(entry);
    S.snap = after;
    S.save(); S.emit("change");
    return true;
  };
  function restore(snap) {
    S.project = hydrateProject(JSON.parse(snap));
    S.snap = snap;
    if (!S.project.pages.some(function (p) { return p.id === S.pageId; })) S.pageId = S.project.pages[0].id;
    if (S.sel && !S.find(S.sel)) S.sel = null;
    S.save(); S.emit("change");
  }
  S.undo = function () {
    var it = S.undoStack.pop(); if (!it) return;
    S.redoStack.push(it); if (it.entry) { var i = S.log.lastIndexOf(it.entry); if (i >= 0) S.log.splice(i, 1); }
    restore(it.before);
  };
  S.redo = function () {
    var it = S.redoStack.pop(); if (!it) return;
    S.undoStack.push(it); if (it.entry) S.log.push(it.entry);
    restore(it.after);
  };

  /* ---------- navigation ---------- */
  S.geo = function () {
    var q = /[?&]geo=([a-z]{2})/i.exec(location.search); if (q) return q[1].toUpperCase();
    var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    if (/^Asia\/(Kolkata|Calcutta)$/.test(tz)) return "IN"; if (tz === "Asia/Karachi") return "PK";
    var l = (navigator.languages && navigator.languages.join(",")) || navigator.language || "";
    if (/-IN\b/i.test(l)) return "IN"; if (/-PK\b/i.test(l)) return "PK";
    return "";
  };
  /* the LLC entry page sends visitors to the page for their country. Other visitors see the country picker. */
  S.resolve = function (id) {
    if (id !== "llc" || S.mode !== "preview") return id;
    var g = S.geo(); return g === "IN" ? "llc-india" : g === "PK" ? "llc-pakistan" : id;
  };
  S.go = function (id) {
    id = S.resolve(id);
    if (!S.project.pages.some(function (p) { return p.id === id; })) return;
    if (window.PN_EXPORT && S.fromDisk() && S.mode === "preview") { try { location.href = S.urlFor(id); return; } catch (e) {} }
    S.pageId = id; S.sel = null;
    if (window.PN_EXPORT) { var u = S.urlFor(id); try { if (location.href !== u) history.pushState({ id: id }, "", u); } catch (e) {} S.setMeta(id); }
    S.emit("page");
  };
  /* export build: real URLs, one folder per page. The <base> tag in each page points at the site root. */
  /* opened straight from disk (file://) a folder link shows a file list, so link to index.html and use normal page loads */
  S.fromDisk = function () { return location.protocol === "file:"; };
  S.hrefFor = function (id) { var p = S.page(id).path, f = S.fromDisk() ? "index.html" : ""; return p === "/" ? (f || "./") : p.slice(1) + "/" + f; };
  S.urlFor = function (id) { return new URL(S.hrefFor(id), document.baseURI).href; };
  S.idFromUrl = function (href) {
    if (window.PN_EXPORT && window.PN_EXPORT.notFound) return "not-found";
    var root = new URL(".", document.baseURI).pathname, path = "/" + decodeURIComponent(new URL(href, document.baseURI).pathname.slice(root.length)).replace(/\/index\.html$/, "").replace(/\/+$/, "");
    for (var i = 0; i < S.project.pages.length; i++) if (S.project.pages[i].path === path) return S.project.pages[i].id;
    return "home";
  };
  S.setMeta = function (id) {
    var m = (window.PN_EXPORT && window.PN_EXPORT.meta || {})[id]; if (!m) return;
    document.title = m.title;
    var set = function (sel, v) { var e = document.querySelector(sel); if (e) e.setAttribute("content", v); };
    set('meta[name="description"]', m.description); set('meta[property="og:title"]', m.title); set('meta[property="og:description"]', m.description);
    set('meta[property="og:url"]', m.url); set('meta[name="twitter:title"]', m.title); set('meta[name="twitter:description"]', m.description);
    var c = document.querySelector('link[rel="canonical"]'); if (c) c.setAttribute("href", m.url);
    set('meta[name="robots"]', m.noindex ? "noindex,follow" : "index,follow,max-image-preview:large");
  };
  S.select = function (id) { if (S.sel === id) return; S.sel = id; S.emit("select"); };
  S.setMode = function (m) { S.mode = m; if (m === "preview") S.sel = null; S.emit("mode"); };
  S.setDevice = function (d) { S.device = d; S.emit("device"); };

  /* ---------- entries for the change summary ---------- */
  function pageTitle() { return S.page().title; }
  function entry(element, what, before, after) { return { page: pageTitle(), element: element, what: what, before: before, after: after }; }
  S.entry = entry;
  function short(v) { v = PN.stripHtml(v == null ? "" : String(v)); return v.length > 80 ? v.slice(0, 79) + "…" : v; }

  /* ---------- edits ---------- */
  S.updateProps = function (id, patch, what) {
    var loc = S.find(id); if (!loc) return;
    var b = loc.block, before = {}, after = {}, changed = false;
    Object.keys(patch).forEach(function (k) { if (b.props[k] !== patch[k]) { before[k] = b.props[k]; after[k] = patch[k]; b.props[k] = patch[k]; changed = true; } });
    if (!changed) return;
    var keys = Object.keys(after);
    S.commit(entry(PN.describe(b), what || (keys.length === 1 ? (labelOf(b, keys[0]) || keys[0]) : "settings"), keys.map(function (k) { return short(before[k]); }).join(" | "), keys.map(function (k) { return short(after[k]); }).join(" | ")));
  };
  function labelOf(b, k) { var t = PN.types[b.type]; var f = t && t.fields.filter(function (x) { return x.k === k; })[0]; return f ? f.l : null; }

  /* style: device = null (all sizes) | "tablet" | "phone" */
  S.setStyle = function (id, patch, device, opts) {
    var loc = S.find(id); if (!loc) return;
    var b = loc.block; var target;
    if (device) { b.bp = b.bp || {}; b.bp[device] = b.bp[device] || {}; target = b.bp[device]; } else { b.style = b.style || {}; target = b.style; }
    var before = [], after = [];
    Object.keys(patch).forEach(function (k) {
      var v = patch[k]; var old = target[k];
      if (v === "" || v == null) delete target[k]; else target[k] = v;
      before.push(k + ": " + (old == null ? "default" : old)); after.push(k + ": " + (v === "" || v == null ? "default" : v));
    });
    if (opts && opts.silent) return;
    S.commit(entry(PN.describe(b), "style" + (device ? " (" + device + " only)" : ""), before.join(", "), after.join(", ")));
  };

  function parentLabel(loc) { return loc.parent ? PN.describe(loc.parent) : "page"; }

  S.removeBlock = function (id) {
    var loc = S.find(id); if (!loc) return;
    var name = PN.describe(loc.block);
    loc.arr.splice(loc.idx, 1);
    if (S.sel === id) S.sel = null;
    S.commit(entry(name, loc.ref ? "removed from this page" : "deleted", "in " + parentLabel(loc), "-"));
  };

  S.duplicate = function (id) {
    var loc = S.find(id); if (!loc || loc.ref) return null;
    var c = PN.cloneBlock(loc.block); loc.arr.splice(loc.idx + 1, 0, c); S.sel = c.id;
    S.commit(entry(PN.describe(loc.block), "duplicated", "-", "copy added after it")); return c;
  };

  S.toggleHidden = function (id) {
    var loc = S.find(id); if (!loc) return;
    var target = loc.ref || loc.block; target.hidden = !target.hidden; if (!target.hidden) delete target.hidden;
    S.commit(entry(PN.describe(loc.block), target.hidden ? "hidden" : "shown", target.hidden ? "visible" : "hidden", target.hidden ? "hidden" : "visible"));
  };

  /* insert a new block. parentId: block id or "root". */
  S.addBlock = function (block, parentId, index) {
    var arr, parent = null;
    if (!parentId || parentId === "root") arr = S.page().blocks;
    else { var l = S.find(parentId); if (!l || !l.block.children) return null; arr = l.block.children; parent = l.block; }
    if (index == null || index > arr.length) index = arr.length;
    arr.splice(index, 0, block); S.sel = block.id;
    S.commit(entry(PN.describe(block), "added", "-", "in " + (parent ? PN.describe(parent) : "page") + ", position " + (index + 1)));
    return block;
  };

  /* move block to parentId ("root" or id) at index (index counts the array before removal) */
  S.moveBlock = function (id, parentId, index) {
    var loc = S.find(id); if (!loc) return false;
    var moving = loc.ref || loc.block; var name = PN.describe(loc.block);
    var tgtArr, tgtParent = null;
    if (parentId === "root") tgtArr = S.page().blocks;
    else {
      var tl = S.find(parentId); if (!tl || !tl.block.children) return false;
      if (S.isInside(loc.block, parentId)) return false;
      tgtArr = tl.block.children; tgtParent = tl.block;
    }
    if (loc.ref && parentId !== "root") return false;
    var fromArr = loc.arr, fromIdx = loc.idx;
    if (fromArr === tgtArr) { if (index === fromIdx || index === fromIdx + 1) return false; if (fromIdx < index) index--; }
    fromArr.splice(fromIdx, 1);
    if (index > tgtArr.length) index = tgtArr.length;
    tgtArr.splice(index, 0, moving);
    S.commit(entry(name, "moved", "position " + (fromIdx + 1) + " in " + parentLabel(loc), "position " + (index + 1) + " in " + (tgtParent ? PN.describe(tgtParent) : "page")));
    return true;
  };

  S.nudge = function (id, dir) {
    var loc = S.find(id); if (!loc) return false;
    var j = loc.idx + dir; if (j < 0 || j >= loc.arr.length) return false;
    var name = PN.describe(loc.block); var it = loc.arr.splice(loc.idx, 1)[0]; loc.arr.splice(j, 0, it);
    S.commit(entry(name, "moved", "position " + (loc.idx + 1), "position " + (j + 1))); return true;
  };

  /* ---------- pages ---------- */
  function blankBlocks() {
    var s = PN.make("section"); s.children = [PN.make("heading", { text: "Section heading", level: "2" }), PN.make("paragraph", { text: "Write your text here." })];
    var bn = PN.make("banner", { variant: "title", title: "New page" });
    function ref(k) { return PN.make("shared", { ref: k }); }
    var out = [ref("header"), bn, s, ref("contact"), ref("vip"), ref("footer")];
    out.forEach(function (b) { if (b.type === "shared") b.props.ref = b.props.ref; });
    return out;
  }
  S.addPage = function (title) {
    title = title || "New page";
    var id = uniqueId(slug(title));
    S.project.pages.push({ id: id, title: title, path: "/" + id, blocks: blankBlocks() });
    S.pageId = id; S.sel = null;
    S.commit(entry("Page", "page added", "-", title)); S.emit("page");
  };
  S.duplicatePage = function () {
    var p = S.page(); var c = JSON.parse(JSON.stringify(p));
    (function re(list) { list.forEach(function (x) { x.id = PN.uid(); if (x.type !== "shared" && x.children) re(x.children); }); })(c.blocks);
    c.title = p.title + " copy"; c.id = uniqueId(p.id + "-copy"); c.path = p.path + "-copy"; c.blocks = c.blocks.map(PN.hydrate);
    var i = S.project.pages.indexOf(p); S.project.pages.splice(i + 1, 0, c); S.pageId = c.id; S.sel = null;
    S.commit(entry("Page", "page duplicated", p.title, c.title)); S.emit("page");
  };
  S.deletePage = function (id) {
    if (S.project.pages.length < 2) return;
    var i = S.project.pages.findIndex(function (p) { return p.id === id; }); if (i < 0) return;
    var t = S.project.pages[i].title; S.project.pages.splice(i, 1);
    if (S.pageId === id) S.pageId = S.project.pages[Math.max(0, i - 1)].id; S.sel = null;
    S.commit(entry("Page", "page deleted", t, "-")); S.emit("page");
  };
  S.renamePage = function (id, title, path) {
    var p = S.page(id); var before = p.title + " " + p.path;
    if (title) p.title = title; if (path != null && path !== "") p.path = path;
    S.commit(entry("Page", "page renamed", before, p.title + " " + p.path));
  };
  S.resetPage = function () {
    var p = S.page(); var pr = JSON.parse(S.pristine); var src = pr.pages.filter(function (x) { return x.id === p.id; })[0];
    p.blocks = src ? src.blocks.map(PN.hydrate) : blankBlocks(); S.sel = null;
    S.commit(entry("Page", "reset to live content", "edited", "live content"));
  };
  S.resetAll = function () {
    S.project = hydrateProject(JSON.parse(S.pristine)); S.sel = null; S.log = [];
    if (!S.project.pages.some(function (p) { return p.id === S.pageId; })) S.pageId = "home";
    S.undoStack.push({ before: S.snap, after: JSON.stringify(S.project), entry: null }); S.redoStack = []; S.snap = JSON.stringify(S.project);
    S.save(); S.emit("change");
  };
  S.importProject = function (obj) {
    var proj = obj && obj.project ? obj.project : obj;
    if (!proj || !Array.isArray(proj.pages) || !proj.shared) throw new Error("This file is not a PostalNook project.");
    var h = hydrateProject(proj);
    S.project = h; if (!h.pages.some(function (p) { return p.id === S.pageId; })) S.pageId = h.pages[0].id; S.sel = null;
    S.commit(entry("Project", "project imported", "-", h.pages.length + " pages"));
    S.emit("page");
  };
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "page"; }
  function uniqueId(base) { var id = base, n = 2; while (S.project.pages.some(function (p) { return p.id === id; })) id = base + "-" + (n++); return id; }

  /* ---------- summary text ---------- */
  S.summary = function () {
    if (!S.log.length) return "No changes yet.";
    var lines = ["PostalNook editor changes (" + S.log.length + ")", ""];
    S.log.forEach(function (e, i) {
      lines.push((i + 1) + ". " + e.page + " > " + e.element + " > " + e.what + ": " + (e.before || "-") + " -> " + (e.after || "-"));
    });
    return lines.join("\n");
  };
  S.exportJson = function () { return JSON.stringify({ app: "postalnook-editor", version: 1, exportedAt: new Date().toISOString(), project: S.project }, null, 2); };
})();
