/* Page 2: Overview. The interactive diagram of a typical aircraft fuel system. */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  var SYSTEMS = [
    { id: "store", name: "Store" }, { id: "supply", name: "Supply" }, { id: "transfer", name: "Transfer" },
    { id: "vent", name: "Vent" }, { id: "measure", name: "Measure" }
  ];

  // [number, name, job, what it does, what maintenance checks]
  var PARTS = [
    [1, "Refuel point", "store", "One place on the outside of the aircraft where the fuel hose connects. Fuel goes in here and a refuel line carries it to the tanks.", "Check the cap and seals are clean and undamaged before connecting a hose."],
    [2, "Wing tanks", "store", "Hold most of the fuel. They are often built into the wing structure itself, so there is room for a lot of fuel.", "Look for wet stains, cracked sealant and dirt or water at the drain valve."],
    [3, "Centre (fuselage) tank", "store", "A tank in the body of the aircraft. Its fuel is moved to the engines through transfer valves.", "Check for leaks and that the fuel can flow out freely."],
    [4, "Feed tanks", "supply", "Small tanks, one above each engine. The engine always drinks from its feed tank, so it always has fuel close by, even when the aircraft turns or climbs.", "Check the pumps and level sensors that keep them topped up."],
    [5, "Boost pumps", "supply", "Electric pumps inside the tanks. They push fuel toward the feed tanks and keep pressure in the pipes.", "Never run them dry. Check pressure warnings and electrical plugs."],
    [6, "Transfer valves", "transfer", "Open to let fuel flow from the centre tank to the feed tanks. They help to keep the fuel in balance.", "Check they open and close fully, and the position light agrees."],
    [7, "Crossfeed valve", "transfer", "Joins the left and right sides. If one side has a problem, the crew can open it so both engines draw fuel from the good side.", "Test both the open and closed positions."],
    [8, "Shut-off valves", "supply", "Stop the fuel going to an engine. The crew closes one in an emergency such as an engine fire.", "Check full travel, that it seals when closed, and its position indicator."],
    [9, "Fuel filters", "supply", "Catch dirt and rust before the fuel reaches the engine pump and the control unit.", "Replace on schedule and look at the old filter for metal or dirt."],
    [10, "Engine driven pumps (EDP)", "supply", "A high-pressure pump on each engine, turned by the engine itself. It raises the fuel to the pressure the engine needs. It keeps working if a boost pump fails.", "Check for leaks at the drive seal and compare pressure with the limits."],
    [11, "Fuel control units (FCU)", "supply", "Measure out the right amount of fuel for the engine, based on the pilot's throttle and the flying conditions.", "Only trained people adjust them. Check for leaks and dirt."],
    [12, "Engines", "supply", "Burn the fuel to make thrust. They need steady, clean fuel at the right pressure.", "Check fuel pressure and flow against the limits, and look for leaks at the inlet pipes."],
    [13, "Vent lines and outlets", "vent", "Pipes that let air into a tank as fuel leaves, and out as fuel is added. The outlets are on the outside of the aircraft, often at the wing tips.", "Keep outlets clear of dirt, ice and insects. Never block a vent."],
    [14, "Quantity probes", "measure", "Long thin sensors inside the tanks. The more of a probe that is covered by fuel, the bigger its signal.", "Check for dirt, water or corrosion on the probes and their connectors."],
    [15, "Cockpit gauge", "measure", "Shows the crew how much fuel is in each tank, and gives low fuel warnings.", "Test it as the manual says and compare it with a second source if in doubt."],
    [16, "Water drain valves", "store", "Small valves at the lowest point of a tank. Water is heavier than fuel and sinks, so it can be drained here.", "Take a sample and look for water or dirt. Check the valve closes fully."]
  ];

  FL.inits.overview = function () {
    var svg = document.getElementById("ov-svg");
    var detail = document.getElementById("ov-detail");
    var legend = document.getElementById("ov-legend");
    var sysBox = document.getElementById("ov-systems");
    var modeBox = document.getElementById("ov-modes");
    var selected = null, system = "all";
    var items = {};   // part number -> legend button

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }
    function sysName(id) { return SYSTEMS.filter(function (s) { return s.id === id; })[0].name; }

    function renderDetail() {
      detail.textContent = "";
      var p = PARTS.filter(function (x) { return x[0] === selected; })[0];
      if (!p) {
        detail.appendChild(el("p", "empty", "Tap a number or a part in the diagram, or an item in the parts list, to read about it."));
        return;
      }
      var head = el("div", "head");
      head.appendChild(el("span", "ov-num", String(p[0])));
      head.appendChild(el("h3", null, p[1]));
      head.appendChild(el("span", "chip", "Job: " + sysName(p[2])));
      detail.appendChild(head);
      detail.appendChild(el("p", null, p[3]));
      detail.appendChild(el("p", "maint", "Maintenance: " + p[4]));
    }

    function select(n) {
      selected = selected === n ? null : n;
      svg.querySelectorAll(".part").forEach(function (g) { g.classList.toggle("sel", Number(g.dataset.n) === selected); });
      Object.keys(items).forEach(function (k) { items[k].setAttribute("aria-pressed", String(Number(k) === selected)); });
      renderDetail();
    }

    function applySystem() {
      svg.classList.toggle("filtering", system !== "all");
      svg.querySelectorAll("[data-sys]").forEach(function (e) { e.classList.toggle("dim", system !== "all" && e.dataset.sys !== system); });
      Object.keys(items).forEach(function (k) {
        var part = PARTS.filter(function (x) { return x[0] === Number(k); })[0];
        items[k].parentNode.classList.toggle("dim", system !== "all" && part[2] !== system);
      });
      sysBox.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.sys === system)); });
    }

    // Job filters
    [{ id: "all", name: "All parts" }].concat(SYSTEMS).forEach(function (s) {
      var b = el("button", "ov-chip", s.name);
      b.dataset.sys = s.id;
      b.addEventListener("click", function () { system = s.id; applySystem(); });
      sysBox.appendChild(b);
    });

    // Fuel flow animation modes
    [["static", "Still"], ["flight", "Fuel to the engines"], ["refuel", "Refuelling"]].forEach(function (m, i) {
      var b = el("button", "ov-chip", m[1]);
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", function () {
        svg.classList.remove("mode-flight", "mode-refuel");
        if (m[0] !== "static") svg.classList.add("mode-" + m[0]);
        modeBox.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      });
      modeBox.appendChild(b);
    });

    // Parts list
    PARTS.forEach(function (p) {
      var li = el("li");
      var b = el("button", "ov-item");
      b.setAttribute("aria-pressed", "false");
      b.appendChild(el("span", "ov-num", String(p[0])));
      var t = el("span", "ov-item-text");
      t.appendChild(el("b", null, p[1]));
      t.appendChild(el("small", null, sysName(p[2])));
      b.appendChild(t);
      b.addEventListener("click", function () { select(p[0]); });
      li.appendChild(b);
      legend.appendChild(li);
      items[p[0]] = b;
    });

    // Diagram parts (mouse, touch and keyboard)
    svg.querySelectorAll(".part").forEach(function (g) {
      g.addEventListener("click", function () { select(Number(g.dataset.n)); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(Number(g.dataset.n)); }
      });
    });

    applySystem();
    renderDetail();

    // On a narrow screen the diagram scrolls sideways. Start with the middle (the fuselage) in view.
    var scroller = svg.parentNode;
    return {
      show: function () {
        requestAnimationFrame(function () { scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2; });
      }
    };
  };
})();
