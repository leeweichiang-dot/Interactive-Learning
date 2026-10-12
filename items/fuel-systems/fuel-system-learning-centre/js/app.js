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
    document.querySelectorAll(".section-card .done").forEach(function (s) { s.textContent = d.visited[s.dataset.id] ? "✓ Visited" : ""; });
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

  function buildHome() {
    var grid = document.getElementById("home-cards");
    FL.learningPages.forEach(function (p, i) {
      var a = el("a", "card section-card");
      a.href = "#" + p.id;
      a.appendChild(el("span", "num", String(i + 2)));
      var h = el("h3");
      h.appendChild(el("span", "icon", p.icon));
      h.appendChild(document.createTextNode(p.title));
      a.appendChild(h);
      a.appendChild(el("p", null, p.text));
      var done = el("span", "done");
      done.dataset.id = p.id;
      a.appendChild(done);
      grid.appendChild(a);
    });
    var dash = el("a", "card section-card");
    dash.href = "#dashboard";
    dash.appendChild(el("span", "num", "11"));
    var h = el("h3");
    h.appendChild(el("span", "icon", "📈"));
    h.appendChild(document.createTextNode("My Progress"));
    dash.appendChild(h);
    dash.appendChild(el("p", null, "See your scores and topics to review."));
    grid.appendChild(dash);
  }

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
    var id = (location.hash || "#home").slice(1);
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
