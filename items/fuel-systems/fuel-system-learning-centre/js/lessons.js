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

  /* ---------- 4. Components lesson ---------- */
  // `image` is null for now, so a placeholder is shown. Put a picture in images/ and set e.g. image: "images/fuel-tank.jpg".
  var COMPONENTS = [
    { id: "tanks", name: "Fuel Tanks", icon: "🛢️", short: "Store the fuel", image: null, photo: "a wing fuel tank cut-away",
      fn: "Store the fuel until it is needed. Many aircraft use the wing and body structure itself as a tank.",
      loc: "In the wings and the body (fuselage). Some aircraft also carry extra tanks under the wings.",
      why: "The tanks hold all the energy for the flight. Baffles inside stop the fuel from sloshing about when the aircraft turns or climbs.",
      sym: ["Fuel smell near the tank", "Wet stains or drips under a panel", "Fuel quantity falling faster than normal", "Water or dirt in a fuel sample"],
      maint: "Look for leaks and cracked sealant, drain a sample to check for water, and keep to the strict safety rules for tank entry.",
      check: { q: "Which of these is a sign of a leaking fuel tank?", o: ["A wet fuel stain under a wing panel", "A clean, dry panel", "A bright cockpit light"], a: 0, why: "A wet stain with a fuel smell points to a tank leak, often at worn sealant." } },
    { id: "boost", name: "Boost Pumps", icon: "⚙️", short: "Push fuel to the engine", image: null, photo: "a boost pump removed from a tank",
      fn: "Push fuel out of the tank toward the engine and keep the pressure in the pipes steady.",
      loc: "Inside the tank, near the bottom, so the pump is always covered in fuel.",
      why: "At high altitude fuel can turn into vapour bubbles. Boost pumps keep the fuel under pressure so the engine always gets a solid flow. Two pumps give a back-up.",
      sym: ["Low fuel pressure warning light", "Unusual pump noise", "Pump caution light stays on", "Engine surges if the pump has failed"],
      maint: "Never run a boost pump dry: the fuel around it cools it. Test each pump on its own and check the electrical connectors.",
      check: { q: "Why must a boost pump never run dry?", o: ["The fuel around it cools and protects it", "It would fill the cockpit with air", "It would change the fuel colour"], a: 0, why: "Fuel cools the pump motor. Running dry can overheat it and even cause a spark." } },
    { id: "edp", name: "Engine Driven Pumps", icon: "🔩", short: "High-pressure pump on the engine", image: null, photo: "an engine-driven fuel pump on the gearbox",
      fn: "Raise the fuel to the high pressure the engine needs. It is turned by the engine itself.",
      loc: "Bolted to the engine accessory gearbox, on the side of the engine.",
      why: "It keeps working even if the electric boost pumps fail, so it is a vital back-up. The engine cannot run properly without it.",
      sym: ["Low fuel pressure at high power", "Hard starting", "Engine surges or loses power", "Fuel leak at the drive seal", "Metal pieces in the filter"],
      maint: "Check for leaks at the drive shaft seal, compare fuel pressure with the limits, and look for metal in the filter. Change it as the manual says.",
      check: { q: "What turns an engine driven pump?", o: ["The engine, through a gearbox", "The aircraft battery", "The pilot's hand"], a: 0, why: "The engine drives it through the accessory gearbox." } },
    { id: "filters", name: "Fuel Filters", icon: "🧹", short: "Clean the fuel", image: null, photo: "a fuel filter and its element",
      fn: "Catch dirt, rust and other small bits so only clean fuel reaches the engine.",
      loc: "In the fuel line between the tanks and the engine, often near the engine.",
      why: "Dirt can block tiny holes and damage the pump and the fuel control unit. A filter is cheap; an engine is not.",
      sym: ["Falling fuel pressure or flow", "Blocked-filter warning", "Engine loses power", "Fuel leak at the filter seal after a change"],
      maint: "Replace it on schedule, check the old element for metal or dirt, and fit the seals correctly.",
      check: { q: "A fuel filter is blocked. What is most likely?", o: ["Fuel flow drops and the engine may lose power", "The fuel gets hotter", "The gauge reads full"], a: 0, why: "A blocked filter restricts the flow of fuel." } },
    { id: "shutoff", name: "Fuel Shutoff Valves", icon: "🚦", short: "Open or stop the flow", image: null, photo: "a motorised fuel shutoff valve",
      fn: "Open to let fuel flow, and close to stop it.",
      loc: "In the fuel lines, near the tank outlets and where the pipes go toward the engine.",
      why: "In a fire or a serious leak the crew can cut off the fuel quickly. Maintenance can also isolate one part of the system to work on it safely.",
      sym: ["Fuel still flows when the valve is closed", "No fuel flows when the valve is open", "Valve slow to move", "Position light does not match the valve"],
      maint: "Check that it moves fully open and fully closed, seals when closed, and that the motor, wiring and position indicator work.",
      check: { q: "When would a crew close a fuel shutoff valve?", o: ["During an engine fire", "During normal cruise", "When the cockpit gets warm"], a: 0, why: "Stopping the fuel helps to stop a fire from feeding." } },
    { id: "sensors", name: "Fuel Quantity Sensors", icon: "📏", short: "Sense how much fuel is there", image: null, photo: "fuel quantity probes inside a tank",
      fn: "Sense how much fuel is in the tank. Many aircraft use probes that react to how much of their length is covered by fuel.",
      loc: "Inside each tank, standing from the bottom to the top.",
      why: "The gauge is only as good as its sensors. Wrong sensor signals mean the crew may not know how much fuel they really have.",
      sym: ["Reading jumps about", "Reading stuck on zero or full", "Left and right tanks disagree", "Reading does not change when fuel is added"],
      maint: "Check the probes for dirt, water or corrosion, check the wiring connectors, and test the system against a known fuel amount.",
      check: { q: "A dirty or wet probe will most likely cause...", o: ["A wrong fuel reading", "A louder pump", "A blocked vent"], a: 0, why: "Dirt or water changes the signal the probe sends." } },
    { id: "gauges", name: "Fuel Gauges", icon: "📊", short: "Show the crew the fuel", image: null, photo: "a cockpit fuel quantity indicator",
      fn: "Show the crew how much fuel is in each tank, and give low-fuel warnings.",
      loc: "In the cockpit, on the instrument panel or a display.",
      why: "The crew uses the gauges to plan the flight and to know when to land. A wrong reading can be dangerous.",
      sym: ["Needle stuck", "Reading flickers", "Different from the amount you expect", "Warning light does not work"],
      maint: "Test the gauge as the manual says, compare it with a second source, and check the wiring and warning lights.",
      check: { q: "You doubt a fuel gauge reading. What is the best action?", o: ["Check it against another source and report it", "Trust it anyway", "Ignore it"], a: 0, why: "A second source tells you whether the gauge or the fuel is wrong." } },
    { id: "vent", name: "Fuel Vent System", icon: "🌬️", short: "Lets the tank breathe", image: null, photo: "a vent outlet on a wing tip",
      fn: "Let air flow into the tank as fuel is used, and out as fuel is added or expands.",
      loc: "Pipes run from the top of each tank to openings on the outside of the aircraft, often near the wing tips.",
      why: "Without a vent the tank would have a low pressure and could be crushed, or have a high pressure and burst. It keeps the pressure equal to the outside air.",
      sym: ["Fuel flow slows or stops", "A tank looks dented or swollen", "Fuel leaks out of the vent", "Fuel does not go into the tank during refuelling"],
      maint: "Keep the vent openings clear of dirt, ice, insects and covers. Never block a vent, and remove vent covers before flight.",
      check: { q: "What can a blocked vent cause?", o: ["Tank damage or fuel that will not flow", "A brighter fuel gauge", "A cooler engine"], a: 0, why: "The tank cannot breathe, so the pressure inside becomes wrong." } }
  ];
  FL.componentIds = COMPONENTS.map(function (c) { return c.id; });

  FL.inits.components = function () {
    var list = document.getElementById("comp-list");
    var cards = {};
    var firstTry = {}; // first answer to each check, reported once to the portal tracker

    function passed(id) { return !!FL.store.get().visited["check:" + id]; }

    function refreshProgress() {
      var n = COMPONENTS.filter(function (c) { return passed(c.id); }).length;
      document.getElementById("comp-bar").style.width = (n / COMPONENTS.length * 100) + "%";
      document.getElementById("comp-count").textContent = n + " of " + COMPONENTS.length;
    }

    function setOpen(c, open) {
      var card = cards[c.id];
      card.head.setAttribute("aria-expanded", String(open));
      card.body.hidden = !open;
      if (open) {
        FL.store.visit("comp:" + c.id);
        if (FL.refreshProgress) FL.refreshProgress();
      }
    }

    function placeholder(c) {
      var fig = el("figure", "lc-figure");
      if (c.image) {
        var img = el("img");
        img.src = c.image;
        img.alt = c.name;
        fig.appendChild(img);
      } else {
        var ph = el("div", "img-ph");
        ph.setAttribute("role", "img");
        ph.setAttribute("aria-label", "Image placeholder: " + c.photo);
        ph.appendChild(el("span", "ph-icon", c.icon));
        ph.appendChild(el("span", null, "Image placeholder"));
        fig.appendChild(ph);
      }
      fig.appendChild(el("figcaption", null, "Add a photo or diagram of " + c.photo + "."));
      return fig;
    }

    function facts(c) {
      var wrap = el("div", "facts");
      var items = [
        ["Function", c.fn], ["Location", c.loc], ["Why it is important", c.why],
        ["Failure symptoms", c.sym], ["Maintenance concern", c.maint]
      ];
      items.forEach(function (it) {
        var box = el("div", "fact");
        var b = el("button", "fact-btn");
        b.setAttribute("aria-expanded", "false");
        b.appendChild(el("span", null, it[0]));
        b.appendChild(el("span", "plus", "+"));
        var txt = el("div", "fact-text");
        txt.hidden = true;
        if (Array.isArray(it[1])) {
          var ul = el("ul");
          it[1].forEach(function (x) { ul.appendChild(el("li", null, x)); });
          txt.appendChild(ul);
        } else txt.textContent = it[1];
        b.addEventListener("click", function () {
          var open = b.getAttribute("aria-expanded") !== "true";
          b.setAttribute("aria-expanded", String(open));
          b.lastChild.textContent = open ? "−" : "+";
          txt.hidden = !open;
        });
        box.appendChild(b);
        box.appendChild(txt);
        wrap.appendChild(box);
      });
      return wrap;
    }

    function knowledgeCheck(c, card) {
      var box = el("div", "check");
      box.appendChild(el("h4", null, "Quick check"));
      box.appendChild(el("p", null, c.check.q));
      var opts = el("div", "choice-list");
      var fb = el("div", "feedback");
      fb.hidden = true;
      fb.setAttribute("role", "status");
      var retry = el("button", "btn alt", "Try again");
      retry.hidden = true;

      function reset() {
        opts.querySelectorAll("button").forEach(function (b) { b.disabled = false; b.className = "choice"; });
        fb.hidden = true;
        retry.hidden = true;
      }

      c.check.o.forEach(function (text, i) {
        var b = el("button", "choice", text);
        b.addEventListener("click", function () {
          var ok = i === c.check.a;
          opts.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
          b.classList.add(ok ? "correct" : "incorrect");
          fb.hidden = false;
          fb.className = "feedback " + (ok ? "good" : "bad");
          fb.textContent = (ok ? "Correct! " : "Not quite. ") + c.check.why;
          if (firstTry[c.id] == null) {
            firstTry[c.id] = { q: "Component check · " + c.name + ": " + c.check.q, topic: c.name, correct: ok };
            reportAll();
          }
          if (ok) {
            FL.store.visit("check:" + c.id);
            card.state.textContent = "✓";
            card.state.classList.add("ok");
            refreshProgress();
            if (FL.refreshProgress) FL.refreshProgress();
          } else retry.hidden = false;
        });
        opts.appendChild(b);
      });
      retry.addEventListener("click", reset);
      box.appendChild(opts);
      box.appendChild(fb);
      box.appendChild(retry);
      return box;
    }

    // Once all eight checks have been tried, send the first-try results to the portal.
    function reportAll() {
      var ids = Object.keys(firstTry);
      if (ids.length < COMPONENTS.length || !window.Tracker) return;
      var answers = ids.map(function (k) { return firstTry[k]; });
      Tracker.quizResult(answers.filter(function (a) { return a.correct; }).length, answers.length, answers);
    }

    COMPONENTS.forEach(function (c, i) {
      var art = el("article", "lesson-card");
      art.id = "comp-" + c.id;
      var head = el("button", "lc-head");
      head.setAttribute("aria-expanded", "false");
      head.appendChild(el("span", "lc-num", String(i + 1)));
      head.appendChild(el("span", "ico", c.icon));
      var t = el("span", "lc-title");
      t.appendChild(el("b", null, c.name));
      t.appendChild(el("small", null, c.short));
      head.appendChild(t);
      var state = el("span", "lc-state", passed(c.id) ? "✓" : "▾");
      if (passed(c.id)) state.classList.add("ok");
      head.appendChild(state);
      var body = el("div", "lc-body");
      body.hidden = true;
      var card = { head: head, body: body, state: state };
      cards[c.id] = card;
      body.appendChild(placeholder(c));
      body.appendChild(el("p", "hint", "Tap each box to reveal it."));
      body.appendChild(facts(c));
      body.appendChild(knowledgeCheck(c, card));
      head.addEventListener("click", function () { setOpen(c, head.getAttribute("aria-expanded") !== "true"); });
      art.appendChild(head);
      art.appendChild(body);
      list.appendChild(art);
    });

    document.getElementById("comp-open-all").addEventListener("click", function () { COMPONENTS.forEach(function (c) { setOpen(c, true); }); });
    document.getElementById("comp-close-all").addEventListener("click", function () { COMPONENTS.forEach(function (c) { setOpen(c, false); }); });
    refreshProgress();

    // A roadmap link such as #components?c=boost opens that card.
    return {
      show: function () {
        var want = FL.query && FL.query.c;
        var c = COMPONENTS.filter(function (x) { return x.id === want; })[0];
        if (!c) return;
        setOpen(c, true);
        cards[c.id].head.scrollIntoView();
      }
    };
  };

  /* ---------- 5. Fuel quantity indication ---------- */
  var QUANTITY_CHECKS = [
    { q: "What does a fuel quantity probe sense?", o: ["How much of its length is covered by fuel", "The colour of the fuel", "The speed of the aircraft"], a: 0, why: "More fuel around the probe gives a bigger signal." },
    { q: "The cockpit shows 60% but the tank really holds 10%. Why is this dangerous?", o: ["The crew gets no low fuel warning", "The tank is too heavy", "The pump will be cold"], a: 0, why: "The warning lights follow the reading. A wrong reading can hide a real shortage." },
    { q: "The LOW FUEL light comes on. What should the crew do?", o: ["Plan to land soon", "Ignore it", "Switch the gauge off"], a: 0, why: "The light means fuel is getting low." }
  ];

  FL.inits.quantity = function () {
    var CAPACITY = 2000;   // kg, a teaching value
    var LOW = 20, CRITICAL = 10;
    var NS = "http://www.w3.org/2000/svg";
    var range = document.getElementById("q-range");
    var faultBtn = document.getElementById("q-fault");
    var flyBtn = document.getElementById("q-fly");
    var statusEl = document.getElementById("q-status");
    var faultOn = false, stuck = 50, timer = null, lastZone = null;
    var cx = 160, cy = 160;

    function pt(p, r) {
      var th = Math.PI * (1 - p / 100);
      return [cx + r * Math.cos(th), cy - r * Math.sin(th)];
    }
    function arc(p0, p1, r, color) {
      var a = pt(p0, r), b = pt(p1, r);
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", "M" + a[0] + " " + a[1] + " A" + r + " " + r + " 0 0 1 " + b[0] + " " + b[1]);
      path.setAttribute("stroke", color);
      return path;
    }
    // Dial: red 0-10, amber 10-20, green above.
    var zones = document.getElementById("qc-zones");
    zones.appendChild(arc(0, CRITICAL, 112, "#d23b3b"));
    zones.appendChild(arc(CRITICAL, LOW, 112, "#f2a900"));
    zones.appendChild(arc(LOW, 100, 112, "#2e8b57"));
    var ticks = document.getElementById("qc-ticks");
    [0, 25, 50, 75, 100].forEach(function (p) {
      var a = pt(p, 124), b = pt(p, 134);
      var line = document.createElementNS(NS, "line");
      line.setAttribute("x1", a[0]); line.setAttribute("y1", a[1]); line.setAttribute("x2", b[0]); line.setAttribute("y2", b[1]);
      line.setAttribute("stroke", "#9db0c8"); line.setAttribute("stroke-width", "2");
      ticks.appendChild(line);
      var t = document.createElementNS(NS, "text");
      var c = pt(p, 146);
      t.setAttribute("x", c[0]); t.setAttribute("y", c[1] + 4); t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", "#9db0c8"); t.style.fontSize = "11px";
      t.textContent = p === 0 ? "E" : p === 100 ? "F" : String(p);
      ticks.appendChild(t);
    });
    var segsEl = document.getElementById("qc-segs");
    var segs = [];
    for (var i = 0; i < 10; i++) { var sg = document.createElement("i"); segs.push(sg); segsEl.appendChild(sg); }

    function render() {
      var actual = Number(range.value);
      var shown = faultOn ? stuck : actual;
      document.getElementById("q-pct").textContent = actual;
      document.getElementById("qt-pct").textContent = actual + "%";

      // Tank and probes follow the real level.
      var h = 216 * actual / 100;
      var fuel = document.getElementById("qt-fuel");
      fuel.setAttribute("y", String(238 - h)); fuel.setAttribute("height", String(h));
      var wet = document.getElementById("qt-wetrect");
      wet.setAttribute("y", String(238 - h)); wet.setAttribute("height", String(h));

      // Cockpit follows the shown level (the real one unless the reading is stuck).
      document.getElementById("qc-needle").style.transform = "rotate(" + (shown * 1.8) + "deg)";
      var kg = Math.round(CAPACITY * shown / 100);
      document.getElementById("qc-kg").textContent = kg;
      document.getElementById("qc-pct").textContent = shown;
      var lit = Math.ceil(shown / 10);
      segs.forEach(function (sg, k) {
        sg.className = k < lit ? (k === 0 ? "on red" : k === 1 ? "on amber" : "on") : "";
      });
      var crit = shown <= CRITICAL, low = shown <= LOW;
      document.getElementById("qc-low").classList.toggle("lit", low);
      document.getElementById("qc-crit").classList.toggle("lit", crit);
      document.getElementById("qc-crit").classList.toggle("flash", crit);

      document.getElementById("qf-1").textContent = actual + "% of the probe covered";
      document.getElementById("qf-2").textContent = faultOn ? "signal lost: no change" : "signal turned into kg";
      document.getElementById("qf-3").textContent = kg + " kg shown";

      var zone, cls, msg;
      if (faultOn && Math.abs(stuck - actual) > 10) {
        zone = "fault"; cls = "bad";
        msg = "The cockpit says " + stuck + "% but the tank holds " + actual + "%." + (actual <= LOW && shown > LOW ? " There is NO low fuel warning. Always check a doubtful reading against another source." : " The reading is wrong. Check it against another source.");
      } else if (shown <= 0) { zone = "empty"; cls = "bad"; msg = "Tank empty. Fuel critical warning is flashing."; }
      else if (crit) { zone = "crit"; cls = "bad"; msg = "FUEL CRITICAL (red, flashing): land as soon as possible."; }
      else if (low) { zone = "low"; cls = "mid"; msg = "LOW FUEL (amber): fuel is low. Plan to land."; }
      else { zone = "ok"; cls = "good"; msg = "Normal: no warnings. The cockpit matches the tank."; }
      statusEl.className = "status " + cls;
      // Only change the spoken text when the situation changes, not on every slider step.
      if (zone !== lastZone) { statusEl.textContent = msg; lastZone = zone; }
      else if (zone === "fault") statusEl.textContent = msg;
    }

    function stopFly() {
      clearInterval(timer);
      timer = null;
      flyBtn.setAttribute("aria-pressed", "false");
      flyBtn.textContent = "✈️ Use fuel";
    }

    range.addEventListener("input", function () { stopFly(); render(); });
    document.querySelectorAll("#page-quantity [data-level]").forEach(function (b) {
      b.addEventListener("click", function () { stopFly(); range.value = b.dataset.level; render(); });
    });
    flyBtn.addEventListener("click", function () {
      if (timer) { stopFly(); return; }
      if (Number(range.value) <= 0) range.value = 100;
      flyBtn.setAttribute("aria-pressed", "true");
      flyBtn.textContent = "■ Stop";
      timer = setInterval(function () {
        range.value = Math.max(0, Number(range.value) - 1);
        render();
        if (Number(range.value) <= 0) stopFly();
      }, 150);
    });
    faultBtn.addEventListener("click", function () {
      faultOn = !faultOn;
      stuck = Number(range.value);
      faultBtn.setAttribute("aria-pressed", String(faultOn));
      document.getElementById("q-fault-pill").textContent = faultOn ? "On" : "Off";
      render();
    });

    // Quick check questions
    var box = document.getElementById("q-checks");
    QUANTITY_CHECKS.forEach(function (c, n) {
      var wrap = el("div");
      wrap.style.marginBottom = "1rem";
      wrap.appendChild(el("p", null, (n + 1) + ". " + c.q));
      var list = el("div", "choice-list");
      var fb = el("div", "feedback");
      fb.hidden = true;
      fb.setAttribute("role", "status");
      c.o.forEach(function (text, i) {
        var b = el("button", "choice", text);
        b.addEventListener("click", function () {
          var ok = i === c.a;
          list.querySelectorAll("button").forEach(function (x, k) { x.disabled = true; if (k === c.a) x.classList.add("correct"); });
          if (!ok) b.classList.add("incorrect");
          fb.hidden = false;
          fb.className = "feedback " + (ok ? "good" : "bad");
          fb.textContent = (ok ? "Correct! " : "Not quite. ") + c.why;
        });
        list.appendChild(b);
      });
      wrap.appendChild(list);
      wrap.appendChild(fb);
      box.appendChild(wrap);
    });

    render();
    return { hide: stopFly };
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
