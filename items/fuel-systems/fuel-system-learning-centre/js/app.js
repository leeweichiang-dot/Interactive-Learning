/* Navigation, home page and progress. Loads last, after every page has registered. */
(function () {
  "use strict";
  var FL = window.FL;

  // The nine learning sections; Home and Dashboard are not counted.
  FL.learningPages = [
    { id: "overview", title: "Fuel System Overview", icon: "✈️", text: "Learn the five jobs of a fuel system." },
    { id: "explorer", title: "Fuel Flow Explorer", icon: "🧭", text: "Switch pumps and valves and watch the flow." },
    { id: "components", title: "System Components", icon: "🔩", text: "Meet each part and its job." },
    { id: "quantity", title: "Fuel Quantity Indication", icon: "📊", text: "See how probes become a gauge reading." },
    { id: "transfer", title: "Fuel Transfer", icon: "🔄", text: "Move fuel between tanks and keep balance." },
    { id: "refuel", title: "Refuelling and Defuelling", icon: "⛽", text: "Put the safe steps in order." },
    { id: "hazards", title: "Fuel System Hazards", icon: "⚠️", text: "Know the dangers and how to control them." },
    { id: "simulator", title: "Leak Troubleshooting", icon: "🔍", text: "Find a leak without taking risks." },
    { id: "quiz", title: "Knowledge Quiz", icon: "📝", text: "Check what you have learned." }
  ];
  var ALL = [{ id: "home", title: "Home" }].concat(FL.learningPages, [{ id: "dashboard", title: "My Progress" }]);

  var handles = {};   // per-page { show, hide } returned by init functions
  var started = {};
  var current = null;
  var completed = false;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function percent() {
    var d = FL.store.get();
    var n = FL.learningPages.filter(function (p) { return d.visited[p.id]; }).length;
    return { n: n, pct: Math.round(n / FL.learningPages.length * 100) };
  }

  function refreshProgress() {
    var p = percent();
    var d = FL.store.get();
    document.querySelector("#home-bar i").style.width = p.pct + "%";
    document.getElementById("home-bar").setAttribute("aria-valuenow", String(p.pct));
    document.getElementById("home-progress").textContent = p.n + " of " + FL.learningPages.length + " sections visited (" + p.pct + "%)";
    document.getElementById("start-btn").textContent = p.n ? "Continue learning" : "Start learning";
    document.querySelectorAll("#nav a").forEach(function (a) { a.classList.toggle("done", !!d.visited[a.dataset.id]); });
    refreshRoadmap();
    if (!completed && p.n === FL.learningPages.length) {
      completed = true;
      if (window.Tracker) Tracker.complete();
    }
  }
  FL.refreshProgress = refreshProgress;

  function buildNav() {
    var nav = document.getElementById("nav");
    ALL.forEach(function (p) {
      var a = el("a");
      a.href = "#" + p.id;
      a.dataset.id = p.id;
      a.appendChild(el("span", null, p.title));
      a.appendChild(el("span", "tick", "✓"));
      a.addEventListener("click", function () { closeMenu(); });
      nav.appendChild(a);
    });
    document.getElementById("menu-btn").addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      this.setAttribute("aria-expanded", String(open));
    });
  }

  function closeMenu() {
    document.getElementById("nav").classList.remove("open");
    document.getElementById("menu-btn").setAttribute("aria-expanded", "false");
  }

  // The eight roadmap modules. `steps` are keys saved by FL.store.visit when a page
  // (or, for tanks and pumps, a Components filter) is opened.
  var ROADMAP = [
    { title: "Introduction to Aircraft Fuel Systems", text: "What a fuel system does, and how fuel flows from tank to engine.", icon: "✈️", href: "#overview", steps: ["overview", "explorer"] },
    { title: "Fuel Tanks", text: "Where fuel is stored, and what a leaking tank looks like.", icon: "🛢️", href: "#components?c=tanks", steps: ["comp:tanks"] },
    { title: "Fuel Pumps", text: "How boost pumps and engine driven pumps move fuel to the engine.", icon: "⚙️", href: "#components?c=boost", steps: ["comp:boost", "comp:edp"] },
    { title: "Fuel Quantity Indication", text: "How probes and gauges tell the crew how much fuel is left.", icon: "📊", href: "#quantity", steps: ["quantity"] },
    { title: "Fuel Transfer", text: "Moving fuel between tanks to keep the aircraft balanced.", icon: "🔄", href: "#transfer", steps: ["transfer"] },
    { title: "Refuelling & Defuelling", text: "The safe order of steps, and the hazards of working with fuel.", icon: "⛽", href: "#refuel", steps: ["refuel", "hazards"] },
    { title: "Troubleshooting", text: "Find the cause of a fuel leak without taking risks.", icon: "🔍", href: "#simulator", steps: ["simulator"] },
    { title: "Assessment", text: "A 12-question quiz to check what you have learned.", icon: "📝", href: "#quiz", steps: ["quiz"] }
  ];

  function refreshRoadmap() {
    var d = FL.store.get();
    var nextFound = false;
    var cards = document.querySelectorAll("#roadmap .road-card");
    ROADMAP.forEach(function (m, i) {
      var done = m.steps.filter(function (k) { return d.visited[k]; }).length;
      var pct = Math.round(done / m.steps.length * 100);
      var card = cards[i];
      var isDone = pct === 100;
      var isNext = !isDone && !nextFound;
      if (isNext) { nextFound = true; document.getElementById("start-btn").href = m.href; }
      card.classList.toggle("complete", isDone);
      card.classList.toggle("next", isNext);
      card.querySelector(".track i").style.width = pct + "%";
      card.querySelector(".pct").textContent = pct + "%";
      var chip = card.querySelector(".chip");
      chip.textContent = isDone ? "✓ Done" : done ? "In progress" : isNext ? "Up next" : "Not started";
      chip.className = "chip" + (isDone ? " ok" : done || isNext ? " go" : "");
      card.querySelector(".btn").textContent = isDone ? "Review" : done ? "Continue" : "Start";
    });
  }

  function buildRoadmap() {
    var list = document.getElementById("roadmap");
    ROADMAP.forEach(function (m, i) {
      var li = el("li", "road-card");
      li.appendChild(el("div", "road-num", String(i + 1)));
      var body = el("div", "road-body");
      body.appendChild(el("div", "label", "Module " + (i + 1)));
      var h = el("h3");
      h.appendChild(el("span", "icon", m.icon));
      h.appendChild(document.createTextNode(" " + m.title));
      body.appendChild(h);
      body.appendChild(el("p", null, m.text));
      var bar = el("div", "road-bar");
      var tr = el("div", "track");
      tr.appendChild(el("i"));
      bar.appendChild(tr);
      bar.appendChild(el("span", "pct", "0%"));
      bar.appendChild(el("span", "chip"));
      body.appendChild(bar);
      var go = el("a", "btn", "Start");
      go.href = m.href;
      body.appendChild(go);
      li.appendChild(body);
      list.appendChild(li);
    });
  }

  function buildHome() { buildRoadmap(); }

  function buildPagers() {
    ALL.forEach(function (p, i) {
      var pager = document.querySelector("#page-" + p.id + " .pager");
      if (!pager) return;
      if (i > 0) { var prev = el("a", "btn alt", "← " + ALL[i - 1].title); prev.href = "#" + ALL[i - 1].id; pager.appendChild(prev); }
      else pager.appendChild(el("span"));
      if (i < ALL.length - 1) { var nx = el("a", "btn", ALL[i + 1].title + " →"); nx.href = "#" + ALL[i + 1].id; pager.appendChild(nx); }
    });
  }

  function route() {
    var parts = (location.hash || "#home").slice(1).split("?");
    var id = parts[0];
    FL.query = {};
    (parts[1] || "").split("&").forEach(function (kv) {
      var p = kv.split("=");
      if (p[0]) FL.query[p[0]] = decodeURIComponent(p[1] || "");
    });
    if (!ALL.some(function (p) { return p.id === id; })) id = "home";
    if (current && handles[current] && handles[current].hide) handles[current].hide();
    current = id;
    document.querySelectorAll(".page").forEach(function (s) { s.classList.toggle("active", s.id === "page-" + id); });
    document.querySelectorAll("#nav a").forEach(function (a) {
      if (a.dataset.id === id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (FL.inits[id] && !started[id]) {
      started[id] = true;
      handles[id] = FL.inits[id]() || {};
    } else if (handles[id] && handles[id].show) {
      // Dashboard re-reads saved data each time it is shown.
    }
    if (handles[id] && handles[id].show) handles[id].show();
    if (FL.learningPages.some(function (p) { return p.id === id; })) FL.store.visit(id);
    refreshProgress();
    document.title = (id === "home" ? "" : ALL.filter(function (p) { return p.id === id; })[0].title + " · ") + "Aircraft Fuel System Learning Centre";
    window.scrollTo(0, 0);
  }

  buildNav();
  buildHome();
  buildPagers();
  window.addEventListener("hashchange", route);
  route();
})();
