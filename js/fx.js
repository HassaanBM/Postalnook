/* Smooth scrolling and scroll animations (GSAP: ScrollSmoother + ScrollTrigger). Preview mode only.
   Quiet on purpose: soft fade-up, a small image drift, a pinned header and a thin progress line.
   Off when the visitor prefers reduced motion, or when GSAP did not load. Remove js/fx.js and vendor/ to ship without it. */
(function () {
  var PN = (window.PN = window.PN || {});
  var F = (PN.fx = { active: false });
  var smoother = null, ctx = null, drift = [], bar = null, barTween = null, TB = 50, rf = 0, barTick = null, BH = 4;

  function ready() { return !!(window.gsap && window.ScrollTrigger && window.ScrollSmoother); }
  function reduced() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }

  F.enter = function () {
    if (F.active || !ready() || reduced()) return false;
    if (window.matchMedia && matchMedia("(max-width: 900px), (pointer: coarse)").matches) return false; /* phones: native scrolling */
    try {
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
      var app = document.getElementById("pn-app"), tb = document.getElementById("pn-toolbar");
      TB = tb ? tb.offsetHeight : 0;
      app.style.setProperty("--tb-h", TB + "px");
      document.documentElement.classList.add("pn-smooth"); app.classList.add("is-smooth");
      window.scrollTo(0, 0);
      smoother = ScrollSmoother.create({ wrapper: "#pn-canvas", content: "#pn-frame", smooth: 1.1, effects: false, smoothTouch: 0.1 });
      bar = document.createElement("div"); bar.id = "pn-progress"; app.append(bar);
      /* the bar rides the bottom edge of the screen and rests on top of the footer, like its border */
      barTick = function () {
        var ft = document.querySelector("#stage .pn-footer"), vh = window.innerHeight;
        var y = Math.min(vh, ft ? ft.getBoundingClientRect().top : vh) - BH;
        bar.style.transform = "translate3d(0," + Math.round(y) + "px,0)";
        /* an open Services menu sits above the bar: cut the bar where the menu covers it */
        var mask = "";
        var pn = document.querySelector("#stage .pn-dd-panel");
        if (pn && getComputedStyle(pn).visibility === "visible") {
          var r = pn.getBoundingClientRect();
          if (r.height && r.top < y + BH && r.bottom > y) { mask = "linear-gradient(90deg,#000 " + Math.round(r.left) + "px,transparent " + Math.round(r.left) + "px,transparent " + Math.round(r.right) + "px,#000 " + Math.round(r.right) + "px)"; }
        }
        if (bar._m !== mask) { bar._m = mask; bar.style.webkitMaskImage = bar.style.maskImage = mask || "none"; }
      };
      gsap.ticker.add(barTick); barTick();
      barTween = gsap.fromTo(bar.firstChild || (bar.innerHTML = "<i></i>", bar.firstChild), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      F.active = true; return true;
    } catch (e) { console.error(e); F.leave(); return false; }
  };

  /* call after every render in Preview mode */
  F.build = function () {
    if (!F.active) return;
    try {
      if (ctx) ctx.revert(); drift.forEach(function (t) { t.kill && t.kill(); }); drift = [];
      var stage = document.getElementById("stage");
      ctx = gsap.context(function () {
        var h = stage.querySelector(".pn-header");
        if (h) {
          ScrollTrigger.create({ trigger: h, pin: true, start: "top top+=" + TB, end: "max", pinSpacing: false, pinReparent: false });
          ScrollTrigger.create({ start: 8, end: "max", toggleClass: { targets: h, className: "is-stuck" } });
        }
        var sel = [".pn-banner-copy > *", ".pn-banner .pn-inner:not(.pn-banner-grid) > *", ".pn-banner-art", ".pn-section .pn-inner > .pn-b:not(.pn-columns)",
          ".pn-columns > .pn-b", ".pn-contact-grid > *", ".pn-map", ".pn-vip-in > *", ".pn-faqtabs-nav"].join(",");
        var items = Array.prototype.slice.call(stage.querySelectorAll(sel));
        if (items.length) {
          gsap.set(items, { autoAlpha: 0, y: 26 });
          ScrollTrigger.batch(items, {
            start: "top 93%", once: true, interval: 0.08, batchMax: 6,
            onEnter: function (b) { gsap.to(b, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, overwrite: true, clearProps: "transform" }); }
          });
        }
      }, stage);
      /* pictures drift a little slower than the page */
      var art = stage.querySelectorAll(".pn-banner-art, .pn-contact-art");
      if (art.length && smoother) drift = [].concat(smoother.effects(art, { speed: 0.94 }) || []);
      ScrollTrigger.refresh();
    } catch (e) {
      console.error(e);
      Array.prototype.forEach.call(document.querySelectorAll("#stage *"), function (n) { if (n.style && n.style.visibility === "hidden") { n.style.visibility = ""; n.style.opacity = ""; } });
    }
  };

  F.refresh = function () { if (!F.active) return; cancelAnimationFrame(rf); rf = requestAnimationFrame(function () { try { ScrollTrigger.refresh(); } catch (e) {} }); };
  F.scrollTop = function () { return smoother ? smoother.scrollTop() : 0; };
  F.setScroll = function (y) { if (smoother) { smoother.scrollTop(y); } };
  F.scrollTo = function (node) { if (smoother && node) smoother.scrollTo(node, true, "top " + (TB + 84) + "px"); };

  F.leave = function () {
    try {
      if (ctx) { ctx.revert(); ctx = null; }
      drift.forEach(function (t) { t.kill && t.kill(); }); drift = [];
      if (barTween) { if (barTween.scrollTrigger) barTween.scrollTrigger.kill(); barTween.kill(); barTween = null; }
      if (barTick && window.gsap) { gsap.ticker.remove(barTick); barTick = null; }
      if (bar) { bar.remove(); bar = null; }
      if (smoother) { smoother.kill(); smoother = null; }
      if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    } catch (e) { console.error(e); }
    var app = document.getElementById("pn-app");
    document.documentElement.classList.remove("pn-smooth"); if (app) app.classList.remove("is-smooth");
    window.scrollTo(0, 0); F.active = false;
  };
})();
