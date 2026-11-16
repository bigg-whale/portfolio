// All the animation lives here. Delete this file (and its <script> tag) to turn it all off.
// Anyone with "reduce motion" switched on in their device settings gets the static page.
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Very old browsers: stay on the static page rather than hide content that could never be revealed.
  if (!("IntersectionObserver" in window) || !window.requestAnimationFrame) return;

  var root = document.documentElement;
  root.classList.add("js-motion");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---------- helpers ----------
  // Text for screen readers: a <br> counts as a space, so "Slide into<br>my inbox." isn't read as "intomy".
  function plainText(el) {
    var copy = el.cloneNode(true);
    Array.prototype.slice.call(copy.querySelectorAll("br")).forEach(function (br) {
      br.parentNode.replaceChild(document.createTextNode(" "), br);
    });
    return copy.textContent.replace(/\s+/g, " ").trim();
  }

  function splitWords(el, className) {
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement("span");
        w.className = className;
        var inner = document.createElement("span");
        inner.textContent = part;
        w.appendChild(inner);
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  function splitChars(el) {
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", plainText(el));
    var i = 0;
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      Array.from(node.textContent).forEach(function (ch) {
        if (ch === " " || ch === "\n") { frag.appendChild(document.createTextNode(ch)); return; }
        var c = document.createElement("span");
        c.className = "ch";
        c.setAttribute("aria-hidden", "true");
        c.style.setProperty("--i", i++);
        c.textContent = ch;
        frag.appendChild(c);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  // ---------- 1. hero entrance ----------
  var h1 = document.querySelector(".headline");
  if (h1) {
    h1.setAttribute("aria-label", plainText(h1));
    splitWords(h1, "w");
    var outline = h1.querySelector(".outline");
    if (outline) splitWords(outline, "w");
    // stagger every word (and the GAMES box) in reading order
    h1.querySelectorAll(".w, mark").forEach(function (n, i) {
      n.style.setProperty("--d", (0.15 + i * 0.1) + "s");
    });
  }
  document.querySelectorAll(".patch-list li").forEach(function (li, i) {
    li.style.setProperty("--d", (1.3 + i * 0.12) + "s");
  });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add("hero-in"); });
  });

  // ---------- 2. scroll reveals ----------
  var groups = [
    ".section-head .kicker", ".section-desc",
    ".feature-media", ".feature-info", ".project-grid .project",
    ".cook", ".about-lead", ".about-body", ".stat",
    ".skills-label", ".tags-big li", ".contact-btn", ".contact-empty",
    ".footer-big", ".footer-meta"
  ];
  groups.forEach(function (sel) {
    var els = document.querySelectorAll(sel);
    els.forEach(function (el, i) {
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--d", Math.min(i, 8) * 0.08 + "s");
    });
  });
  document.querySelectorAll(".section-head h2").forEach(function (h) {
    splitChars(h);
    h.setAttribute("data-reveal", "");
    h.classList.add("chars");
  });
  // tags in the featured card pop one by one too
  document.querySelectorAll(".feature-info .tags li, .feature-info .bullets li").forEach(function (el, i) {
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--d", 0.3 + Math.min(i, 10) * 0.06 + "s");
  });

  // 1 -> "st", 2 -> "nd" ... so "2nd" counts 1st, 2nd instead of flashing "0nd", "1nd"
  function ordinal(n) {
    var t = n % 100;
    if (t >= 11 && t <= 13) return "th";
    return ["th", "st", "nd", "rd"][n % 10] || "th";
  }

  // Sets the starting number right away (so the final value never flashes first)
  // and returns a function that runs the count.
  function countUp(el) {
    var m = /^(\d+)(.*)$/.exec(el.textContent.trim());
    if (!m) return null;
    var target = +m[1], rest = m[2], start = null, dur = 900;
    var isOrdinal = /^(st|nd|rd|th)$/i.test(rest);
    var upper = isOrdinal && rest === rest.toUpperCase();
    var from = isOrdinal ? 1 : 0;
    function show(n) {
      var suffix = isOrdinal ? ordinal(n) : rest;
      el.textContent = n + (upper ? suffix.toUpperCase() : suffix);
    }
    if (target === 0) { // nothing to count: do a little glitch instead
      el.classList.add("glitch");
      return null;
    }
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      show(Math.round(from + (target - from) * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    show(from);
    return function () { requestAnimationFrame(step); };
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      var num = e.target.querySelector && e.target.querySelector(".stat-num");
      var run = num && countUp(num);
      if (run) setTimeout(run, 250);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });

  // SinOS progress bar: fills when seen, then gets "stuck"
  var prog = document.querySelector(".progress");
  if (prog) {
    var pio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { prog.classList.add("is-in"); pio.disconnect(); }
    }, { threshold: 0.6 });
    pio.observe(prog);
    // its "stuck" wobble animates width (costs layout every frame), so only run it while on screen
    new IntersectionObserver(function (es) {
      prog.classList.toggle("is-live", es[0].isIntersecting);
    }).observe(prog);
  }

  // ---------- 3. tickers that react to scrolling ----------
  var tracks = Array.prototype.slice.call(document.querySelectorAll(".ticker-track")).map(function (t) {
    t.style.animation = "none";
    return { el: t, x: 0, half: 0, visible: true, dir: +(t.getAttribute("data-dir") || -1), speed: +(t.getAttribute("data-speed") || 60) };
  });
  function measureTracks() { tracks.forEach(function (t) { t.half = t.el.scrollWidth / 2; }); }
  measureTracks();
  window.addEventListener("resize", measureTracks);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureTracks);
  var tio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      tracks.forEach(function (t) { if (t.el.parentNode === e.target) t.visible = e.isIntersecting; });
    });
  });
  tracks.forEach(function (t) { tio.observe(t.el.parentNode); });

  // The scroll handler only takes notes; all page writes happen once per frame in tick().
  // (Measuring or restyling inside the handler made scrolling stutter.)
  var hero = document.querySelector(".hero");
  // --sy (scroll position) is set on each shape itself. It is registered as non-inherited in the CSS,
  // so the bobbing <i> inside every shape is left alone instead of being restyled on every scroll frame.
  var shapes = Array.prototype.slice.call(document.querySelectorAll(".bg-shapes .shape"));
  var heroH = 0, syDirty = true, lastSy = "";
  function measureHero() { heroH = hero ? hero.offsetHeight : 0; syDirty = true; }
  measureHero();
  window.addEventListener("resize", measureHero);
  window.addEventListener("load", measureHero);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureHero);

  var lastY = window.scrollY, boost = 0, scrollDir = 1, last = performance.now();
  window.addEventListener("scroll", function () {
    var y = window.scrollY, dy = y - lastY;
    lastY = y;
    syDirty = true;
    if (dy) scrollDir = dy > 0 ? 1 : -1;
    boost = Math.min(boost + Math.abs(dy) * 0.9, 900);
  }, { passive: true });

  function tick(now) {
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (syDirty) {
      syDirty = false;
      if (shapes.length && lastY < heroH + 200) {
        var sy = lastY.toFixed(0);
        if (sy !== lastSy) {
          lastSy = sy;
          for (var s = 0; s < shapes.length; s++) shapes[s].style.setProperty("--sy", sy);
        }
      }
    }
    boost *= Math.pow(0.92, dt * 60);
    tracks.forEach(function (t) {
      var half = t.half;
      if (!half || !t.visible) return;
      t.x += t.dir * scrollDir * (t.speed + boost) * dt;
      if (t.x <= -half) t.x += half;
      if (t.x > 0) t.x -= half;
      var skew = Math.max(-8, Math.min(8, t.dir * scrollDir * boost / 90));
      t.el.style.transform = "translate3d(" + t.x + "px,0,0) skewX(" + skew + "deg)";
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---------- 4. tilt on hover (mouse only) ----------
  if (finePointer) {
    var fm = document.querySelector(".feature-media");
    if (fm) fm.setAttribute("data-tilt", "5");
    // Smooth tilt: measure once on enter, then ease toward the cursor every frame.
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = +(el.getAttribute("data-tilt") || 8);
      var rect = null, tx = 0, ty = 0, cx = 0, cy = 0, gx = 50, gy = 50, running = false, inside = false;
      function frame() {
        cx += (tx - cx) * 0.14;
        cy += (ty - cy) * 0.14;
        el.style.setProperty("--rx", (-cy * max).toFixed(3) + "deg");
        el.style.setProperty("--ry", (cx * max).toFixed(3) + "deg");
        el.style.setProperty("--gx", gx + "%");
        el.style.setProperty("--gy", gy + "%");
        if (inside || Math.abs(cx) > 0.001 || Math.abs(cy) > 0.001) {
          requestAnimationFrame(frame);
        } else {
          running = false;
          el.classList.remove("tilting");
        }
      }
      function start() { if (!running) { running = true; requestAnimationFrame(frame); } }
      el.addEventListener("pointerenter", function () {
        rect = el.getBoundingClientRect();
        inside = true;
        el.classList.add("tilting");
        start();
      });
      el.addEventListener("pointermove", function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        tx = Math.max(-0.5, Math.min(0.5, px));
        ty = Math.max(-0.5, Math.min(0.5, py));
        gx = (tx + 0.5) * 100;
        gy = (ty + 0.5) * 100;
        start();
      });
      el.addEventListener("pointerleave", function () {
        inside = false;
        rect = null;
        tx = 0; ty = 0;
        start();
      });
      window.addEventListener("scroll", function () { rect = null; }, { passive: true });
    });
  }
})();
