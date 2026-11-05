/* App shell: draws the current page from JSON and runs the site behavior in Preview mode.
   The editor (editor/) is optional. Remove its two tags from index.html to ship the site alone. */
(function () {
  var PN = (window.PN = window.PN || {});
  var S = PN.store, el = PN.el;
  var A = (PN.app = { timers: [], lastPage: null });
  var root, canvas, stage, styleEl;

  A.narrow = function () { return window.matchMedia && matchMedia("(max-width: 900px)").matches; };

  A.init = function () {
    root = document.getElementById("pn-app");
    canvas = document.getElementById("pn-canvas");
    stage = document.getElementById("stage");
    styleEl = document.getElementById("pn-block-css");
    A.canvas = canvas; A.stage = stage;
    /* phones and small screens: start as the clean site (Preview). A small "Editor" button brings the tools back. */
    if (S.mode === "edit") S.mode = "preview"; /* opens as the finished site. Use Edit in the toolbar to edit. */
    var fab = document.getElementById("pn-fab");
    if (fab) fab.addEventListener("click", function () {
      var on = root.classList.toggle("tb-open");
      fab.setAttribute("aria-expanded", on ? "true" : "false");
      fab.firstChild.nodeValue = on ? "Hide tools" : "Editor";
    });
    bindStage();
    if (window.PN_EXPORT) window.addEventListener("popstate", function () { var id = S.idFromUrl(location.href); if (id !== S.pageId) { S.pageId = id; S.sel = null; S.setMeta(id); S.emit("page"); } });
    S.on(function (kind) {
      if (kind === "change" || kind === "page" || kind === "mode") { A.applyShell(); A.render(); }
      else if (kind === "device") { A.applyShell(); if (PN.fx) PN.fx.refresh(); S.emit("rendered"); }
    });
    window.addEventListener("resize", function () { layoutRing(); });
    A.applyShell();
  };

  A.applyShell = function () {
    root.setAttribute("data-mode", S.mode);
    root.setAttribute("data-device", S.device);
  };

  A.updateCss = function () { styleEl.textContent = PN.buildCss(S.page().blocks, S.project); };

  A.ctx = function () { return { edit: S.mode === "edit", project: S.project, ui: S.ui }; };

  A.render = function () {
    var page = S.page();
    var FX = PN.fx;
    if (FX) { if (S.mode === "preview" && !FX.active) FX.enter(); else if (S.mode !== "preview" && FX.active) FX.leave(); }
    var smooth = !!(FX && FX.active);
    var top = smooth ? FX.scrollTop() : canvas.scrollTop;
    var samePage = A.lastPage === page.id;
    A.clearTimers();
    stage.textContent = "";
    var ctx = A.ctx();
    var r = el("div", { class: "pn-page", "data-page": page.id });
    page.blocks.forEach(function (b) { var n = PN.renderBlock(b, ctx); if (n) r.append(n); });
    stage.append(r);
    A.updateCss();
    if (smooth) FX.setScroll(samePage ? top : 0); else canvas.scrollTop = samePage ? top : 0;
    A.lastPage = page.id;
    if (S.mode === "preview") startThanks();
    if (smooth) {
      FX.build();
      if (!samePage && window.gsap) gsap.fromTo(stage, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out", clearProps: "opacity,visibility" });
    }
    S.emit("rendered");
  };

  A.clearTimers = function () {
    A.timers.forEach(function (t) { if (t.kind === "i") clearInterval(t.id); else clearTimeout(t.id); });
    A.timers = [];
    if (A.anim) { try { A.anim.cancel(); } catch (e) {} A.anim = null; }
  };

  A.goHref = function (href) {
    href = PN.tok(href || "");
    if (/^page:/.test(href)) S.go(href.slice(5));
    else if (/^#/.test(href)) scrollToAnchor(href.slice(1));
    else if (/^https?:/i.test(href)) { try { window.open(href, "_blank", "noopener"); } catch (e) {} }
  };

  function scrollToAnchor(name) {
    var t = stage.querySelector('[data-anchor-id="' + name + '"]');
    if (!t) return;
    if (PN.fx && PN.fx.active) PN.fx.scrollTo(t); else t.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- thank you page: intro animation, ring and auto return ---------- */
  function layoutRing() {
    var cta = stage && stage.querySelector(".pn-cta"); var ring = cta && cta.querySelector(".pn-ring"); if (!ring) return;
    var w = cta.offsetWidth, h = cta.offsetHeight, sw = 3;
    ring.setAttribute("viewBox", "0 0 " + w + " " + h);
    Array.prototype.forEach.call(ring.querySelectorAll("rect"), function (r) {
      r.setAttribute("x", sw / 2); r.setAttribute("y", sw / 2); r.setAttribute("width", Math.max(0, w - sw)); r.setAttribute("height", Math.max(0, h - sw)); r.setAttribute("rx", 15); r.setAttribute("ry", 15);
    });
  }
  function startThanks() {
    var s = stage.querySelector(".pn-thanks"); if (!s) return;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var card = s.querySelector(".pn-thanks-card"), tick = s.querySelector(".pn-tick");
    if (reduce) s.classList.remove("pn-intro");
    else {
      var cr = card.getBoundingClientRect(), tr = tick.getBoundingClientRect();
      var drop = cr.height / 2 - ((tr.top - cr.top) + tr.height / 2);
      tick.style.setProperty("--drop", Math.max(0, drop) + "px");
    }
    layoutRing();
    var tm = s.querySelector(".pn-timer");
    var secs = tm ? (parseInt(tm.getAttribute("data-secs"), 10) || 0) : 0;
    if (!secs) return;
    var delay = reduce ? 400 : 2400;
    var prog = s.querySelector(".pn-ring .prog"), num = s.querySelector(".pn-timer-n"), txt = s.querySelector(".pn-timer-t"), stay = s.querySelector(".pn-timer-stay"), main = s.querySelector(".pn-cta .pn-btn");
    var done = false;
    function end() {
      if (done) return; done = true;
      var g = main && main.getAttribute("data-go");
      if (g) S.go(g);
      else if (main && /^https?:/.test(main.getAttribute("href") || "")) { try { window.location.assign(main.getAttribute("href")); } catch (e) {} }
    }
    var t0 = performance.now() + delay;
    if (prog && prog.animate) {
      A.anim = prog.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: secs * 1000, delay: delay, easing: "linear", fill: "both" });
      A.anim.finished.then(function () { num.textContent = "0"; end(); }).catch(function () {});
    }
    var iv = setInterval(function () {
      var left = Math.max(0, Math.ceil(secs - (performance.now() - t0) / 1000));
      num.textContent = String(Math.min(secs, left));
      if (!prog || !prog.animate) { if (performance.now() >= t0 + secs * 1000) { clearInterval(iv); end(); } }
    }, 200);
    A.timers.push({ kind: "i", id: iv });
    stay.addEventListener("click", function () {
      done = true; if (A.anim) { A.anim.cancel(); A.anim = null; } clearInterval(iv);
      var ring = s.querySelector(".pn-ringwrap"); if (ring) ring.style.display = "none";
      txt.textContent = "Auto-return is off."; stay.hidden = true;
    });
  }

  /* ---------- clicks and forms ---------- */
  function closeMenus() {
    Array.prototype.forEach.call(stage.querySelectorAll(".pn-dd.is-open"), function (x) { x.classList.remove("is-open"); var tg = x.querySelector(".pn-dd-toggle"); if (tg) tg.setAttribute("aria-expanded", "false"); });
  }
  document.addEventListener("click", function (e) { if (S.mode === "preview" && !e.target.closest(".pn-dd")) closeMenus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenus(); });

  function bindStage() {
    stage.addEventListener("click", function (e) {
      var t = e.target;
      if (S.mode === "edit") { if (t.closest("a,button,label,summary")) e.preventDefault(); return; }
      var dd = t.closest(".pn-dd-toggle");
      if (dd) { var box = dd.closest(".pn-dd"); var o = box.classList.toggle("is-open"); dd.setAttribute("aria-expanded", o ? "true" : "false"); if (PN.fx) PN.fx.refresh(); return; }
      if (!t.closest(".pn-dd")) closeMenus();
      var mb = t.closest(".pn-menu-btn");
      if (mb) { var h = mb.closest(".pn-header"); var open = h.classList.toggle("is-open"); if (PN.fx) PN.fx.refresh(); mb.setAttribute("aria-expanded", open ? "true" : "false"); mb.setAttribute("aria-label", open ? "Close menu" : "Open menu"); return; }
      var tab = t.closest("[data-faqtab]");
      if (tab) { S.ui.faqTab[tab.getAttribute("data-faqtabs")] = tab.getAttribute("data-faqtab"); A.render(); return; }
      var q = t.closest(".pn-faq-q");
      if (q) {
        var item = q.closest(".pn-faq"); var willOpen = !item.classList.contains("is-open");
        var group = item.closest(".pn-faqgroup") || item.parentElement;
        Array.prototype.forEach.call(group.querySelectorAll(".pn-faq.is-open"), function (x) { x.classList.remove("is-open"); });
        if (willOpen) item.classList.add("is-open");
        if (PN.fx) PN.fx.refresh();
        return;
      }
      var cardLink = !t.closest("a,button,input,select,textarea,label") && t.closest(".pn-card") ? t.closest(".pn-card").querySelector("a[data-go]") : null;
      if (cardLink && S.mode === "preview") { e.preventDefault(); S.go(cardLink.getAttribute("data-go")); return; }
      var go = t.closest("[data-go]");
      if (go && window.PN_EXPORT && PN.store.fromDisk() && S.mode === "preview" && go.tagName === "A" && !e.defaultPrevented && !(e.metaKey || e.ctrlKey || e.shiftKey)) { closeMenus(); return; } /* file://: let the link load the page */
      if (go) { e.preventDefault(); closeMenus(); var h2 = stage.querySelector(".pn-header"); if (h2) h2.classList.remove("is-open"); S.go(go.getAttribute("data-go")); return; }
      var an = t.closest("[data-anchor]");
      if (an) { e.preventDefault(); scrollToAnchor(an.getAttribute("data-anchor")); return; }
      var ext = t.closest("a[href]");
      if (ext && !window.PN_EXPORT && !/^https?:|^tel:|^mailto:/i.test(ext.getAttribute("href") || "")) e.preventDefault();
    });
    stage.addEventListener("submit", function (e) {
      e.preventDefault();
      if (S.mode !== "preview") return;
      var f = e.target; var msg = f.querySelector(".pn-form-msg");
      var bad = Array.prototype.filter.call(f.querySelectorAll("[required]"), function (i) { return i.type === "checkbox" ? !i.checked : !i.checkValidity() || !i.value.trim(); });
      if (bad.length) { msg.hidden = false; msg.className = "pn-form-msg is-err"; msg.textContent = "Please fill in the required fields and tick the box."; bad[0].focus(); return; }
      if (f.getAttribute("data-form") === "contact") { S.go("thank-you"); return; }
      msg.hidden = false; msg.className = "pn-form-msg is-ok"; msg.textContent = "Design preview. Nothing was sent.";
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    S.load().then(function () {
      A.init();
      if (PN.editor) PN.editor.init();
      A.render();
    }).catch(function (err) {
      var s = document.getElementById("stage");
      s.innerHTML = "";
      s.append(el("div", { class: "pn-fatal" }, el("h2", { text: "The site data did not load." }), el("p", { text: String(err && err.message || err) })));
      console.error(err);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
