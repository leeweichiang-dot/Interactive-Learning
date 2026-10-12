/* Page 3: Interactive Fuel Flow Explorer. */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  var PARTS = {
    refuel: { name: "Refuel point", info: "Where the fuel hose connects to fill the aircraft. Fuel goes in here and spreads to the tanks.", maint: "Check the cap and seal are clean and the coupling is not damaged." },
    tankL: { name: "Left wing tank", info: "Holds a large part of the fuel. It is often built into the wing itself.", maint: "Look for wet stains, cracked sealant and water at the drain valve." },
    tankR: { name: "Right wing tank", info: "Matches the left tank. Using both evenly keeps the aircraft balanced.", maint: "Same checks as the left tank. Compare both sides." },
    feed: { name: "Feed tank", info: "A small tank near the engine. The engine always drinks from here, and the wing tanks refill it.", maint: "Check the pumps and level sensors that keep it topped up." },
    pumpL: { name: "Left boost pump", info: "Pushes fuel from the left tank to the feed tank and keeps pressure in the pipes.", maint: "Listen for odd noise. Check pressure warnings and electrical connections." },
    pumpR: { name: "Right boost pump", info: "Does the same job on the right side. Two pumps give a back-up if one fails.", maint: "Test each pump separately. A failed pump may show only as a warning light." },
    valve: { name: "Shut-off valve", info: "Opens to let fuel reach the engine and closes to stop it, for example in an emergency or a fire.", maint: "Check that it moves fully open and fully closed." },
    filter: { name: "Fuel filter", info: "Catches dirt and rust before fuel reaches the engine.", maint: "Replace on schedule. A blocked filter reduces flow and pressure." },
    engine: { name: "Engine", info: "Burns the fuel to make thrust. It needs steady, clean fuel at the right pressure.", maint: "Fuel pressure and flow readings should match the manual limits." },
    vent: { name: "Vent outlet", info: "Lets air into the tank as fuel leaves, and lets air out as the tank is filled. Without it the tank could be crushed or burst.", maint: "Keep it clear of dirt, ice and insects. Never block it." }
  };

  var STEPS = [
    ["Fuel is put in at the refuel point", "refuel"],
    ["It fills the wing tanks", "tankL"],
    ["Boost pumps push it toward the engine", "pumpL"],
    ["The feed tank collects it", "feed"],
    ["The shut-off valve lets it through", "valve"],
    ["The filter cleans it", "filter"],
    ["The engine burns it", "engine"]
  ];

  FL.inits.explorer = function () {
    var state = { pumpL: true, pumpR: true, valve: true, filter: true };
    var LABELS = { pumpL: "Left boost pump", pumpR: "Right boost pump", valve: "Shut-off valve open", filter: "Filter clear (off = blocked)" };
    var svg = document.getElementById("fx-svg");
    var toggles = document.getElementById("fx-toggles");
    var stepsEl = document.getElementById("fx-steps");
    var selected = null;

    function part(id) { return svg.querySelector('[data-part="' + id + '"]'); }

    function select(id) {
      selected = id;
      svg.querySelectorAll(".part").forEach(function (p) { p.classList.toggle("sel", p.dataset.part === id); });
      var p = PARTS[id];
      document.getElementById("fx-title").textContent = p.name;
      document.getElementById("fx-info").textContent = p.info;
      var m = document.getElementById("fx-maint");
      m.hidden = false;
      m.textContent = "Maintenance: " + p.maint;
      stepsEl.querySelectorAll("button").forEach(function (b) { b.classList.toggle("sel", b.dataset.part === id); });
    }

    Object.keys(LABELS).forEach(function (k) {
      var b = document.createElement("button");
      b.className = "switch";
      b.setAttribute("aria-pressed", "true");
      b.innerHTML = '<span></span><span class="pill">On</span>';
      b.firstChild.textContent = LABELS[k];
      b.addEventListener("click", function () {
        state[k] = !state[k];
        b.setAttribute("aria-pressed", String(state[k]));
        b.lastChild.textContent = state[k] ? "On" : "Off";
        update();
        select(k);
      });
      toggles.appendChild(b);
    });

    STEPS.forEach(function (s, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.dataset.part = s[1];
      b.textContent = (i + 1) + ". " + s[0];
      b.addEventListener("click", function () { select(s[1]); });
      li.appendChild(b);
      stepsEl.appendChild(li);
    });

    svg.querySelectorAll(".part").forEach(function (p) {
      p.addEventListener("click", function () { select(p.dataset.part); });
      p.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(p.dataset.part); }
      });
    });

    function update() {
      var pumps = (state.pumpL ? 1 : 0) + (state.pumpR ? 1 : 0);
      var flowing = state.valve && pumps > 0;
      document.getElementById("pipe-L").classList.toggle("on", state.pumpL);
      document.getElementById("pipe-R").classList.toggle("on", state.pumpR);
      document.getElementById("pipe-main").classList.toggle("on", flowing && state.filter);
      part("pumpL").classList.toggle("off", !state.pumpL);
      part("pumpR").classList.toggle("off", !state.pumpR);
      part("valve").classList.toggle("off", !state.valve);
      part("filter").classList.toggle("off", !state.filter);
      part("engine").classList.toggle("off", !(flowing && state.filter));

      var s = document.getElementById("fx-status");
      var msg, cls;
      if (!state.valve) { msg = "Shut-off valve closed: no fuel reaches the engine. The engine will stop."; cls = "bad"; }
      else if (pumps === 0) { msg = "Both pumps off: pressure drops. The engine will soon run out of fuel."; cls = "bad"; }
      else if (!state.filter) { msg = "Filter blocked: fuel flow is weak. The engine may run rough or lose power."; cls = "bad"; }
      else if (pumps === 1) { msg = "One pump working: the engine still gets fuel, but you lose your back-up. Report the fault."; cls = "mid"; }
      else { msg = "Normal: fuel flows to the engine and both pumps share the work."; cls = "good"; }
      s.textContent = msg;
      s.className = "status " + cls;
    }

    update();
    select("refuel");
  };
})();
