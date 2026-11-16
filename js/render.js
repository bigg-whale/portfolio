// Turns window.PROJECTS (js/projects.js) into cards. You shouldn't need to edit this.
(function () {
  "use strict";

  // Link keys with a nice label. "play" = a page on this site that runs the project in the browser (relative path, e.g. "sinos/").
  var LINK_LABELS = { play: "Play in browser ↗", itch: "Play on itch.io ↗", github: "Source on GitHub ↗" };

  // How many non-featured projects the homepage shows before "All projects" takes over.
  var HOME_EXTRA = 2;

  // Paths in projects.js are written from the site root ("assets/img/x.png", "projects/x.html").
  // A page in a subfolder sets data-root="../" on #projects so those paths still resolve.
  var ROOT = "";
  function local(path) {
    if (typeof path !== "string" || !path.trim()) return "";
    // only prefix plain relative paths; full URLs and absolute paths stay as they are
    return /^[a-z][a-z0-9+.-]*:|^\/|^#/i.test(path.trim()) ? path : ROOT + path.trim();
  }

  // Small helper: make an element with a class and optional text.
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // Only allow normal web links and local files; anything else counts as empty.
  // The browser's own URL parser decides what the link really is, so disguised
  // schemes ("java\tscript:", " JaVaScript:", data:, vbscript: ...) can't slip through.
  function safeUrl(url) {
    if (typeof url !== "string") return "";
    url = url.trim();
    if (!url) return "";
    try {
      var parsed = new URL(url, document.baseURI);
      var scheme = parsed.protocol;
      var ok = scheme === "http:" || scheme === "https:" ||
        (scheme === "file:" && window.location.protocol === "file:" && !parsed.host); // opening index.html straight from disk
      return ok ? parsed.href : "";
    } catch (e) {
      return "";
    }
  }

  function buildMedia(p) {
    var wrap = el("div", "media");
    var images = (p.images || []).map(local).map(safeUrl).filter(Boolean);
    var video = safeUrl(local(p.video));

    if (video) {
      var v = el("video", "media-main");
      v.src = video;
      v.controls = true;
      v.preload = "none";
      v.playsInline = true;
      if (images[0]) v.poster = images[0];
      wrap.appendChild(v);
      return wrap;
    }

    if (!images.length) {
      var ph = el("div", "media-placeholder");
      ph.appendChild(el("span", "media-placeholder-big", "Screenshots incoming"));
      ph.appendChild(el("span", "media-placeholder-small", "currently stuck in the build folder"));
      wrap.appendChild(ph);
      return wrap;
    }

    var strip = el("div", images.length > 1 ? "shots shots-multi shots-n" + Math.min(images.length, 5) : "shots");
    images.forEach(function (src, i) {
      var a = el("a", "shot");
      a.href = src;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      var img = el("img");
      img.src = src;
      img.alt = (p.title || "Project") + " screenshot " + (i + 1);
      img.loading = "lazy";
      img.decoding = "async";
      a.appendChild(img);
      strip.appendChild(a);
    });
    wrap.appendChild(strip);
    return wrap;
  }

  // Featured = two boxes side by side (media | info). Others = one card, media on top.
  function buildCard(p) {
    var card, body;
    if (p.featured) {
      card = el("article", "feature");
      var mediaCard = el("div", "card feature-media");
      mediaCard.appendChild(buildMedia(p));
      card.appendChild(mediaCard);
      body = el("div", "card feature-info project-body");
      fillBody(body, p);
      card.appendChild(body);
      return card;
    }
    card = el("article", "card project");
    card.appendChild(buildMedia(p));
    body = el("div", "project-body");
    fillBody(body, p);
    card.appendChild(body);
    return card;
  }

  function fillBody(body, p) {
    var page = safeUrl(local(p.page));
    if (p.num) body.appendChild(el("p", "label", p.num));
    var h = el("h3", "project-title");
    if (page) {
      var ta = el("a", "project-title-link", p.title || "Untitled");
      ta.href = page;
      h.appendChild(ta);
    } else {
      h.textContent = p.title || "Untitled";
    }
    body.appendChild(h);
    if (p.hook) body.appendChild(el("p", "project-hook", p.hook));
    if (p.blurb) body.appendChild(el("p", "project-blurb", p.blurb));

    if (p.bullets && p.bullets.length) {
      var ul = el("ul", "bullets");
      p.bullets.forEach(function (b) { ul.appendChild(el("li", null, b)); });
      body.appendChild(ul);
    }

    if (p.role) body.appendChild(el("p", "project-role", p.role));

    if (p.tags && p.tags.length) {
      var tags = el("ul", "tags");
      p.tags.forEach(function (t) { tags.appendChild(el("li", null, t)); });
      body.appendChild(tags);
    }

    // Links: only render the ones that have a URL. Never a dead button.
    var links = p.links || {};
    var actions = el("div", "project-links");
    // "page" = this project's own detail page on this site; opens in the same tab.
    if (page) {
      var more = el("a", "btn", "View project →");
      more.href = page;
      actions.appendChild(more);
    }
    Object.keys(links).forEach(function (key) {
      var url = safeUrl(key === "play" ? local(links[key]) : links[key]);
      if (!url) return;
      var a = el("a", "btn" + (actions.children.length ? " btn-alt" : ""), LINK_LABELS[key] || key + " ↗");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      actions.appendChild(a);
    });
    if (actions.children.length) body.appendChild(actions);
  }

  // data-mode="home" (default): featured project big, then up to HOME_EXTRA others,
  // then an "All projects" button. data-mode="all": every project as a grid card.
  function renderProjects() {
    var root = document.getElementById("projects");
    var list = window.PROJECTS || [];
    if (!root || !list.length) return;
    ROOT = root.getAttribute("data-root") || "";
    var mode = root.getAttribute("data-mode") || "home";

    var grid;
    if (mode === "all") {
      grid = el("div", "project-grid");
      list.forEach(function (p) { grid.appendChild(buildCard(Object.assign({}, p, { featured: false }))); });
      root.appendChild(grid);
    } else {
      var featured = list.filter(function (p) { return p.featured; }).slice(0, 1);
      var rest = list.filter(function (p) { return featured.indexOf(p) < 0; });
      featured.forEach(function (p) { root.appendChild(buildCard(p)); });
      var shown = rest.slice(0, HOME_EXTRA);
      if (shown.length) {
        // a lone card goes wide (media | text) instead of sitting in a narrow column
        grid = el("div", shown.length === 1 ? "project-grid project-grid-solo" : "project-grid");
        shown.forEach(function (p) { grid.appendChild(buildCard(Object.assign({}, p, { featured: false }))); });
        root.appendChild(grid);
      }
      var allUrl = safeUrl(local("projects/"));
      if (allUrl) {
        var bar = el("div", "all-projects");
        var a = el("a", "btn btn-big", "All projects (" + list.length + ") →");
        a.href = allUrl;
        bar.appendChild(a);
        root.appendChild(bar);
      }
    }

    // Titles and counters follow the real list, so numbers never disagree.
    var title = document.getElementById("games-title");
    if (title && mode !== "all" && list.length > 1) title.textContent = "The work";
    document.querySelectorAll('[data-count="projects"]').forEach(function (n) {
      n.textContent = String(list.length);
      var label = n.nextElementSibling;
      if (label && list.length !== 1) label.textContent = "projects shipped";
    });
  }

  // Swap the profile placeholder for assets/img/me.jpg once it actually loads.
  function setupPhoto() {
    var img = document.querySelector(".profile-photo");
    if (!img) return;
    var show = function () {
      img.hidden = false;
      var ph = document.querySelector(".profile-placeholder");
      if (ph) ph.remove();
    };
    if (img.complete && img.naturalWidth) show();
    else img.addEventListener("load", show, { once: true });
  }

  // Desktop: line the profile card's top up near the GAMES box, wherever the
  // headline happens to wrap. Also tells the floating ball where the card's middle is.
  function alignProfile() {
    var hero = document.querySelector(".hero");
    var grid = document.querySelector(".hero-grid");
    var card = document.querySelector(".profile");
    var mark = document.querySelector(".headline mark");
    if (!hero || !grid || !card || !mark) return;
    card.style.marginTop = "";
    if (window.innerWidth <= 960) { hero.style.removeProperty("--card-mid"); return; }
    // offsetTop ignores animation transforms, so this works mid-animation too
    var markTop = 0, n = mark;
    while (n && n !== grid) { markTop += n.offsetTop; n = n.offsetParent; }
    var h1 = mark.closest("h1");
    var headTop = h1 ? h1.offsetTop : markTop;
    // card sits a little above the GAMES box, but never more than ~18px above the headline
    var target = Math.max(markTop - 50, headTop - 18);
    card.style.marginTop = "0px";
    var shift = Math.max(0, target - card.offsetTop);
    card.style.marginTop = shift + "px";
    hero.style.setProperty("--card-mid", (grid.offsetTop + card.offsetTop + card.offsetHeight / 2 - 15) + "px");
  }

  renderProjects();
  setupPhoto();
  alignProfile();
  window.addEventListener("load", alignProfile);
  var resizeQueued = false;
  window.addEventListener("resize", function () {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(function () { resizeQueued = false; alignProfile(); });
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignProfile);
})();
