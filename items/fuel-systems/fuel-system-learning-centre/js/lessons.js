/* Pages 4-8: components, fuel quantity, transfer, refuelling and hazards. */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- 4. Components ---------- */
  var COMPONENTS = [
    { name: "Fuel tank", icon: "🛢️", cat: "Store", what: "Holds the fuel. Many aircraft use the wing and body structure itself as a tank (an 'integral' tank).", how: "Baffles inside stop the fuel sloshing about when the aircraft moves.", maint: "Inspect for leaks, sealant damage, dirt and water. Tank entry has strict safety rules." },
    { name: "Boost pump", icon: "⚙️", cat: "Move", what: "Pushes fuel toward the engine and keeps pressure in the lines.", how: "An electric motor spins an impeller inside the tank. The fuel around it cools the pump.", maint: "Never run a boost pump dry. Check pressure and electrical connections." },
    { name: "Transfer pump", icon: "🔄", cat: "Move", what: "Moves fuel from one tank to another to keep the aircraft balanced.", how: "Switched on by the crew or the system when a tank level changes.", maint: "Check it starts and stops, and that no fuel is left behind." },
    { name: "Fuel lines and couplings", icon: "➰", cat: "Move", what: "Pipes and joints that carry fuel around the aircraft.", how: "Flexible joints allow for wing movement and vibration.", maint: "Look for chafing, loose clamps, worn seals and drips at every joint." },
    { name: "Shut-off valve", icon: "🚦", cat: "Control", what: "Opens or closes the fuel path to the engine.", how: "A motor or the crew moves it. It is used in emergencies such as fire.", maint: "Check full travel and that it seals fully when closed." },
    { name: "Crossfeed valve", icon: "↔️", cat: "Control", what: "Lets one side's fuel feed the other side's engine or tank if something fails.", how: "Opened by the crew when needed.", maint: "Test open and closed positions and the position indicator." },
    { name: "Fuel filter", icon: "🧹", cat: "Clean", what: "Stops dirt and rust from reaching the engine.", how: "Fuel passes through a fine mesh or paper element.", maint: "Change on schedule. Check the warning for a blocked filter." },
    { name: "Water drain valve", icon: "💧", cat: "Clean", what: "Lets you drain water and dirt from the lowest point of a tank.", how: "Water is heavier than fuel and sinks, so it collects at the bottom.", maint: "Sample the drain and look for water or dirt. Check the valve closes properly." },
    { name: "Vent system", icon: "🌬️", cat: "Safety", what: "Lets air in as fuel is used, and out as fuel is added or expands.", how: "Open pipes go from the tanks to the outside air.", maint: "Keep vents clear of ice, dirt and insects. A blocked vent can damage a tank." },
    { name: "Quantity probes", icon: "📏", cat: "Measure", what: "Sensors that tell the system how much fuel is in each tank.", how: "They sense how much of their length is covered by fuel.", maint: "Check wiring, dirt and water on the probes, and test the gauge." },
    { name: "Low-level warning sensor", icon: "⚠️", cat: "Measure", what: "Warns the crew when fuel is nearly gone.", how: "Switches a warning light on when its sensor is no longer covered by fuel.", maint: "Test the light and sensor as the manual says." },
    { name: "Refuel coupling", icon: "🔌", cat: "Safety", what: "A single point to connect the hose for pressure refuelling.", how: "It only fits the correct nozzle, so wrong fuel cannot be added easily.", maint: "Check the cap and seals, and that the area is clean before connecting." }
  ];

  FL.inits.components = function () {
    var cats = ["All"].concat(COMPONENTS.map(function (c) { return c.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
    var filters = document.getElementById("comp-filters");
    var grid = document.getElementById("comp-grid");
    var current = "All";

    function draw() {
      grid.textContent = "";
      COMPONENTS.filter(function (c) { return current === "All" || c.cat === current; }).forEach(function (c) {
        var card = el("button", "card comp");
        card.setAttribute("aria-expanded", "false");
        var h = el("h3");
        h.appendChild(el("span", "icon", c.icon));
        h.appendChild(document.createTextNode(c.name));
        card.appendChild(h);
        card.appendChild(el("span", "chip", c.cat));
        card.appendChild(el("p", null, c.what));
        card.appendChild(el("span", "hint", "Tap to learn more"));
        var more = el("div", "more");
        more.appendChild(el("p", null, "How it works: " + c.how));
        more.appendChild(el("p", "maint", "Maintenance: " + c.maint));
        card.appendChild(more);
        card.addEventListener("click", function () {
          card.setAttribute("aria-expanded", String(card.getAttribute("aria-expanded") !== "true"));
        });
        grid.appendChild(card);
      });
    }

    cats.forEach(function (c) {
      var b = el("button", null, c);
      b.setAttribute("aria-pressed", String(c === current));
      b.addEventListener("click", function () {
        current = c;
        if (c !== "All") FL.store.visit("cat:" + c);
        if (FL.refreshProgress) FL.refreshProgress();
        filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        draw();
      });
      filters.appendChild(b);
    });
    draw();
    // A roadmap link such as #components?cat=Store opens with that filter chosen.
    return {
      show: function () {
        var want = FL.query && FL.query.cat;
        if (!want) return;
        filters.querySelectorAll("button").forEach(function (b) { if (b.textContent === want) b.click(); });
      }
    };
  };

  /* ---------- 5. Quantity ---------- */
  FL.inits.quantity = function () {
    var CAPACITY = 2000; // teaching value in kg
    var range = document.getElementById("q-range");
    var fault = document.getElementById("q-fault");
    var faultOn = false;
    var stuck = 50;
    var fill = document.getElementById("q-fill");
    var needle = document.getElementById("q-needle");

    function render() {
      var actual = Number(range.value);
      var shown = faultOn ? stuck : actual;
      document.getElementById("q-pct").textContent = actual;
      var h = 216 * actual / 100;
      fill.setAttribute("y", String(248 - h));
      fill.setAttribute("height", String(h));
      needle.style.transform = "rotate(" + (shown * 1.8) + "deg)";
      document.getElementById("q-digital").textContent = Math.round(CAPACITY * shown / 100) + " kg";
      var wet = actual > 85 ? 3 : actual > 50 ? 2 : actual > 15 ? 1 : 0;
      document.getElementById("q-wet").textContent = wet;
      var s = document.getElementById("q-status");
      if (faultOn && Math.abs(stuck - actual) > 10) {
        s.className = "status bad";
        s.textContent = "The gauge says " + stuck + "% but the tank holds " + actual + "%. Never trust one reading you doubt: check against a second source.";
      } else if (shown < 15) {
        s.className = "status bad";
        s.textContent = "LOW FUEL warning: land soon.";
      } else if (shown < 30) {
        s.className = "status mid";
        s.textContent = "Fuel is getting low. Watch it closely.";
      } else {
        s.className = "status good";
        s.textContent = "Reading looks normal and matches the tank.";
      }
    }

    range.addEventListener("input", render);
    fault.addEventListener("click", function () {
      faultOn = !faultOn;
      stuck = Number(range.value);
      fault.setAttribute("aria-pressed", String(faultOn));
      document.getElementById("q-fault-pill").textContent = faultOn ? "On" : "Off";
      render();
    });
    render();
  };

  /* ---------- 6. Transfer ---------- */
  FL.inits.transfer = function () {
    var tanks = { L: 80, F: 40, R: 70 };
    var NAMES = { L: "Left wing", F: "Feed tank", R: "Right wing" };
    var on = { engine: false, L: false, R: false };
    var timer = null;
    var fills = {}, pcts = {};

    var row = document.getElementById("t-tanks");
    ["L", "F", "R"].forEach(function (k) {
      var t = el("div", "tank");
      var v = el("div", "vessel");
      fills[k] = el("div", "fill");
      pcts[k] = el("div", "pct");
      v.appendChild(fills[k]);
      v.appendChild(pcts[k]);
      t.appendChild(v);
      t.appendChild(el("span", null, NAMES[k]));
      row.appendChild(t);
    });

    var controls = document.getElementById("t-controls");
    function toggle(key, label) {
      var b = el("button", "switch");
      b.style.width = "auto";
      b.setAttribute("aria-pressed", "false");
      b.appendChild(el("span", null, label));
      var pill = el("span", "pill", "Off");
      b.appendChild(pill);
      b.addEventListener("click", function () {
        on[key] = !on[key];
        b.setAttribute("aria-pressed", String(on[key]));
        pill.textContent = on[key] ? "On" : "Off";
        status();
      });
      controls.appendChild(b);
    }
    toggle("engine", "Engine burning fuel");
    toggle("L", "Transfer left to feed");
    toggle("R", "Transfer right to feed");
    var reset = el("button", "btn alt", "Reset");
    reset.addEventListener("click", function () { tanks = { L: 80, F: 40, R: 70 }; draw(); status(); });
    controls.appendChild(reset);

    function draw() {
      ["L", "F", "R"].forEach(function (k) {
        var v = Math.max(0, Math.min(100, tanks[k]));
        fills[k].style.height = v + "%";
        pcts[k].textContent = Math.round(v) + "%";
      });
    }

    function status() {
      var s = document.getElementById("t-status");
      var diff = Math.abs(tanks.L - tanks.R);
      if (tanks.F <= 0) { s.className = "status bad"; s.textContent = "Feed tank empty: the engine stops! Switch on a transfer in time."; }
      else if (tanks.F < 20 && on.engine) { s.className = "status bad"; s.textContent = "Feed tank is low. Start a transfer now."; }
      else if (diff > 20) { s.className = "status mid"; s.textContent = "Left and right are " + Math.round(diff) + "% apart. Take fuel from the fuller side to balance the aircraft."; }
      else { s.className = "status good"; s.textContent = "Fuel is in balance and the feed tank has enough for the engine."; }
    }

    function tick() {
      if (on.engine) tanks.F -= 1.2;
      ["L", "R"].forEach(function (k) {
        if (on[k] && tanks[k] > 0 && tanks.F < 100) { tanks[k] -= 1.5; tanks.F += 1.5; }
      });
      tanks.F = Math.max(0, Math.min(100, tanks.F));
      draw();
      status();
    }

    draw();
    status();
    return {
      show: function () { if (!timer) timer = setInterval(tick, 400); },
      hide: function () { clearInterval(timer); timer = null; }
    };
  };

  /* ---------- 7. Refuelling ---------- */
  var REFUEL_STEPS = [
    "Park in the approved refuelling area and chock the wheels.",
    "Check a fire extinguisher is ready and remove ignition sources (no smoking, phones or sparks).",
    "Connect the bonding (earth) wire between the bowser and the aircraft.",
    "Connect the refuelling hose to the aircraft's refuel coupling.",
    "Set the required fuel quantity and start the flow slowly.",
    "Watch the gauges and look for leaks while fuel flows.",
    "At the required quantity, stop the flow, disconnect the hose and cap the coupling.",
    "Remove the bonding wire last, take a fuel sample and record the amount."
  ];

  FL.inits.refuel = function () {
    var list = document.getElementById("rf-steps");
    var feedback = document.getElementById("rf-feedback");
    var next;

    function shuffled() {
      var idx = REFUEL_STEPS.map(function (_, i) { return i; });
      for (var i = idx.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = idx[i]; idx[i] = idx[j]; idx[j] = t;
      }
      return idx;
    }

    function setLevel() {
      var p = Math.round(next / REFUEL_STEPS.length * 100);
      document.getElementById("rf-fill").style.height = p + "%";
      document.getElementById("rf-pct").textContent = p + "%";
    }

    function start() {
      next = 0;
      list.textContent = "";
      feedback.hidden = true;
      shuffled().forEach(function (i) {
        var li = el("li");
        var b = el("button");
        b.appendChild(el("span", "n", "?"));
        b.appendChild(el("span", null, REFUEL_STEPS[i]));
        b.addEventListener("click", function () {
          if (b.classList.contains("right")) return;
          feedback.hidden = false;
          if (i === next) {
            b.classList.remove("wrong");
            b.classList.add("right");
            b.firstChild.textContent = String(next + 1);
            next++;
            setLevel();
            feedback.className = "feedback good";
            feedback.textContent = next === REFUEL_STEPS.length ? "All steps in the right order. Safe and complete!" : "Correct. What comes next?";
          } else {
            b.classList.remove("wrong");
            void b.offsetWidth; // restart the shake animation
            b.classList.add("wrong");
            feedback.className = "feedback bad";
            feedback.textContent = "Not yet. Safety checks and bonding come before any fuel moves.";
          }
        });
        li.appendChild(b);
        list.appendChild(li);
      });
      setLevel();
    }

    document.getElementById("rf-reset").addEventListener("click", start);
    var tabs = { refuel: document.getElementById("tab-refuel"), defuel: document.getElementById("tab-defuel") };
    Object.keys(tabs).forEach(function (k) {
      tabs[k].addEventListener("click", function () {
        Object.keys(tabs).forEach(function (o) {
          tabs[o].setAttribute("aria-selected", String(o === k));
          document.getElementById("rf-" + o).hidden = o !== k;
        });
      });
    });
    start();
  };

  /* ---------- 8. Hazards ---------- */
  var HAZARDS = [
    { icon: "🔥", name: "Fire and explosion", red: true, text: "Fuel vapour burns or explodes with a small spark.", control: "No smoking, phones or naked flames. Use approved tools and equipment. Keep a fire extinguisher ready." },
    { icon: "⚡", name: "Static electricity", red: true, text: "Fuel moving through hoses builds up static charge that can spark.", control: "Bond (earth) the aircraft and the fuel equipment before connecting." },
    { icon: "😷", name: "Fumes", text: "Breathing fuel vapour can cause headaches, dizziness and worse.", control: "Work in open air or with ventilation. Use the correct breathing protection when told." },
    { icon: "🧤", name: "Skin and eye contact", text: "Fuel dries out the skin and can irritate eyes.", control: "Wear gloves and eye protection. Wash well if fuel touches you." },
    { icon: "🌊", name: "Spills", text: "Spilled fuel is a slip, fire and environmental hazard.", control: "Stop the flow, keep away ignition sources, use spill kits and report it." },
    { icon: "🦠", name: "Contamination", text: "Water, dirt or microbes in fuel can block filters and damage engines.", control: "Drain and sample tanks, keep caps on, and use only the correct clean fuel." },
    { icon: "🚪", name: "Tank entry", red: true, text: "A fuel tank is a confined space with fumes and little air.", control: "Only trained people enter, with a permit, an observer and the tank purged and tested." }
  ];

  var CHECKS = [
    { t: "You may use your phone near an aircraft that is refuelling.", a: false, why: "Phones can spark. Keep them away from fuel work." },
    { t: "The aircraft must be bonded (earthed) before refuelling.", a: true, why: "Bonding stops static build-up." },
    { t: "A small fuel spill can be left to dry by itself.", a: false, why: "Stop, make safe, clean up and report it." },
    { t: "Fuel vapour is dangerous even when you cannot see any liquid.", a: true, why: "The vapour is what burns." },
    { t: "Anyone may climb into an empty fuel tank to take a look.", a: false, why: "Tank entry needs training, a permit and an observer." }
  ];

  FL.inits.hazards = function () {
    var grid = document.getElementById("hz-grid");
    HAZARDS.forEach(function (h) {
      var c = el("div", "card hazard" + (h.red ? " red" : ""));
      var t = el("h3");
      t.appendChild(el("span", "icon", h.icon));
      t.appendChild(document.createTextNode(h.name));
      c.appendChild(t);
      c.appendChild(el("p", null, h.text));
      c.appendChild(el("p", "control", "Control: " + h.control));
      grid.appendChild(c);
    });

    var box = document.getElementById("hz-check");
    CHECKS.forEach(function (c) {
      var wrap = el("div", null);
      wrap.style.marginBottom = "1rem";
      wrap.appendChild(el("p", null, c.t));
      var row = el("div", "row");
      var fb = el("div", "feedback");
      fb.hidden = true;
      fb.setAttribute("role", "status");
      [["Safe / true", true], ["Unsafe / false", false]].forEach(function (o) {
        var b = el("button", "btn alt", o[0]);
        b.addEventListener("click", function () {
          var ok = o[1] === c.a;
          fb.hidden = false;
          fb.className = "feedback " + (ok ? "good" : "bad");
          fb.textContent = (ok ? "Correct. " : "Not quite. ") + c.why;
        });
        row.appendChild(b);
      });
      wrap.appendChild(row);
      wrap.appendChild(fb);
      box.appendChild(wrap);
    });
  };
})();
