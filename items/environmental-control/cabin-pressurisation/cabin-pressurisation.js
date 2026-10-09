/* ==========================================================================
   Cabin Pressurisation System: behaviour
   Sections in this file:
     0. Helpers
     1. Section tabs
     2. Air Circulation Explorer (diagram, flow animation, pop-up)
     3. Pressure Simulation
     4. Fault Scenarios
     5. Competency Check (quiz)
   All text from data is added with textContent, never innerHTML.
   ========================================================================== */
(function () {
  "use strict";

  /* ======================================================================
     0. HELPERS
     ====================================================================== */

  // Shorthand for document.getElementById
  function $(id) { return document.getElementById(id); }

  // Make an element, with an optional class name and text
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Remove everything inside an element
  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  // Format a number with commas, e.g. 35000 -> "35,000"
  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* ======================================================================
     1. SECTION TABS  (only one section is visible at a time)
     ====================================================================== */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  // Show the section for one tab and hide the others
  function showTab(tab, moveFocus) {
    tabs.forEach(function (t) {
      var active = t === tab;
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
      $(t.getAttribute("aria-controls")).hidden = !active;
    });
    if (moveFocus) tab.focus();
    // The popup position depends on the diagram being visible
    if (tab.id === "tab-explorer") positionPopup();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { showTab(tab, false); });
    // Arrow keys, Home and End move between tabs
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); showTab(next, true); }
    });
  });

  /* ======================================================================
     2. AIR CIRCULATION EXPLORER
     ====================================================================== */

  // What each component does and why it matters (plain English)
  var PARTS = {
    engine: {
      name: "Engine (bleed air source)",
      where: "On each wing, hanging below the front edge.",
      does: "The engine takes in a lot of air to make power. A small amount of this hot, high-pressure air is \"bled\" off and sent to the cabin system.",
      why: "Bleed air is the supply that fills the cabin with air and builds up the pressure."
    },
    precooler: {
      name: "Pre-cooler",
      where: "On the wing, next to the engine, where the bleed air pipe leaves it.",
      does: "Bleed air from the engine is very hot. The pre-cooler passes it close to cooler air so the heat is carried away.",
      why: "It protects the pipes and the air conditioning pack from overheating, so the pressure supply stays reliable."
    },
    pack: {
      name: "Air Conditioning Pack (ACM)",
      where: "Under the wing root, where the wings join the fuselage.",
      does: "The Air Cycle Machine (ACM) is a small spinning machine that makes the air very cold by letting it expand. It cools the air and controls how warm or dry it is.",
      why: "It turns hot engine air into safe, comfortable air that can be pumped into the pressurised cabin."
    },
    mix: {
      name: "Mix Manifold",
      where: "Under the cabin floor, just behind the air conditioning pack.",
      does: "This is a chamber where the cold air from the pack is mixed with air that has already been through the cabin (recirculated air). The mix is sent on to the cabin.",
      why: "Mixing keeps the temperature steady and makes good use of the air supply, so pressure is held with less engine air."
    },
    cabin: {
      name: "Cabin",
      where: "The main fuselage, from the flight deck back to the rear pressure bulkhead.",
      does: "This is the sealed space where passengers and crew sit. Fresh air flows in and used air flows out all the time.",
      why: "The cabin is the part that must be held at a safe pressure, equal to 6,000 to 8,000 feet or lower."
    },
    outflow: {
      name: "Outflow Valve",
      where: "On the underside of the rear fuselage, just in front of the rear pressure bulkhead.",
      does: "A controlled door in the aircraft skin. It opens a little to let cabin air escape to the outside, or closes a little to keep more air in.",
      why: "It is the main control for cabin pressure: more open means lower pressure, more closed means higher pressure."
    },
    safety: {
      name: "Safety / Negative Pressure Relief Valve",
      where: "On the skin of the rear fuselage, close to the outflow valve.",
      does: "A backup valve. It opens if the cabin pressure gets too high, and it also opens if the outside pressure becomes higher than the cabin pressure.",
      why: "It stops the pressure difference from damaging the aircraft body if the normal controls fail."
    },
    controller: {
      name: "Differential Pressure Controller",
      where: "In the avionics bay (the electronics compartment) near the nose.",
      does: "The \"brain\" of the system. It reads the cabin and outside pressure and tells the outflow valve how far to open or close.",
      why: "It keeps the cabin at the right pressure automatically, so the crew do not have to adjust the valve by hand."
    }
  };

  // The order the air travels through the system, used by the "Follow the air" button
  var ORDER = ["engine", "precooler", "pack", "mix", "cabin", "outflow"];
  var stepIndex = -1;   // -1 means the trainee has not started the walk-through

  var diagram = $("diagram");
  var popup = $("part-popup");
  var parts = Array.prototype.slice.call(diagram.querySelectorAll(".part"));
  var selectedPart = null;
  var SVG_NS = "http://www.w3.org/2000/svg";

  // Put the pop-up beside the clicked part on wide screens; below the diagram on phones
  function positionPopup() {
    if (popup.hidden) return;
    var wide = window.matchMedia("(min-width: 900px)").matches;
    if (!wide || !selectedPart) { popup.style.marginTop = ""; return; }
    // Line the panel up with the main shape of the part (not its label or leader line)
    var anchor = selectedPart.querySelector(".anchor") || selectedPart;
    var top = anchor.getBoundingClientRect().top - diagram.getBoundingClientRect().top;
    var maxTop = diagram.getBoundingClientRect().height - popup.offsetHeight;
    popup.style.marginTop = Math.max(0, Math.min(top, maxTop)) + "px";
  }

  // Show the information for one part
  function selectPart(group) {
    var info = PARTS[group.getAttribute("data-part")];
    if (!info) return;
    parts.forEach(function (p) { p.classList.toggle("selected", p === group); });
    selectedPart = group;
    stepIndex = ORDER.indexOf(group.getAttribute("data-part"));
    updateStepButton();
    $("popup-name").textContent = info.name;
    $("popup-where").textContent = info.where;
    $("popup-does").textContent = info.does;
    $("popup-why").textContent = info.why;
    popup.hidden = false;
    positionPopup();
    // On phones the panel is below the diagram, so bring it into view
    if (!window.matchMedia("(min-width: 900px)").matches) {
      popup.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function closePopup() {
    popup.hidden = true;
    parts.forEach(function (p) { p.classList.remove("selected"); });
    if (selectedPart) selectedPart.focus();
    selectedPart = null;
    stepIndex = -1;
    updateStepButton();
  }

  parts.forEach(function (group) {
    group.addEventListener("click", function () { selectPart(group); });
    group.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPart(group); }
    });
  });
  $("popup-close").addEventListener("click", closePopup);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !popup.hidden) closePopup();
  });
  window.addEventListener("resize", positionPopup);

  // "Follow the air": each press selects the next part along the air path
  var stepButton = $("step-next");
  function updateStepButton() {
    stepButton.textContent = stepIndex < 0 ? "Follow the air \u25B6"
      : stepIndex >= ORDER.length - 1 ? "Start again \u21BA" : "Next part \u25B6";
  }
  stepButton.addEventListener("click", function () {
    var next = stepIndex >= ORDER.length - 1 ? 0 : stepIndex + 1;
    selectPart(diagram.querySelector('[data-part="' + ORDER[next] + '"]'));
  });

  // Moving dots travel along every flow line (blue = pressurised, grey = return/exhaust).
  // Short lines get one dot so they do not look crowded; longer lines get two.
  Array.prototype.forEach.call(diagram.querySelectorAll("[data-flow]"), function (path) {
    (path.getTotalLength() < 60 ? [0] : [0, 1]).forEach(function (n) {
      var dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("r", "6");
      dot.setAttribute("class", "flow-dot " + path.getAttribute("data-flow"));
      var motion = document.createElementNS(SVG_NS, "animateMotion");
      motion.setAttribute("dur", Math.max(1, path.getTotalLength() / 40) + "s");   // longer lines take longer, so the dots move at one speed
      motion.setAttribute("begin", "-" + (n * 0.5 * Math.max(1, path.getTotalLength() / 40)) + "s");   // negative = already part-way along, so no dot waits at the corner
      motion.setAttribute("repeatCount", "indefinite");
      var mpath = document.createElementNS(SVG_NS, "mpath");
      mpath.setAttribute("href", "#" + path.id);
      motion.appendChild(mpath);
      dot.appendChild(motion);
      diagram.appendChild(dot);
    });
  });

  // Pause / play the flow animation (also helps trainees who prefer less motion)
  var flowToggle = $("flow-toggle");
  function setFlow(running) {
    diagram.classList.toggle("flowing", running);
    if (running) { if (diagram.unpauseAnimations) diagram.unpauseAnimations(); }
    else if (diagram.pauseAnimations) diagram.pauseAnimations();
    flowToggle.textContent = running ? "Pause flow" : "Play flow";
    flowToggle.setAttribute("aria-pressed", running ? "false" : "true");
  }
  flowToggle.addEventListener("click", function () {
    setFlow(!diagram.classList.contains("flowing"));
  });
  // Start paused if the device asks for reduced motion
  setFlow(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ======================================================================
     3. PRESSURE SIMULATION
     ====================================================================== */
  var altSlider = $("sim-alt");
  var valveSlider = $("sim-valve");

  // The valve slider runs from 0 (fully open) to 100 (fully closed).
  // From NORMAL_FROM upwards it is in its normal operating range.
  var NORMAL_FROM = 50;
  var CABIN_LIMIT = 8000;   // normal maximum cabin altitude (ft)
  var MAX_DIFF = 8.6;       // maximum differential pressure (PSI)

  // Work out cabin altitude and differential pressure from the two slider values.
  // It also returns the working, so the "how it is worked out" panel can show every step.
  function simulate(alt, valve) {
    // Simple linear model, held at 8,000 ft
    var normalCabin = Math.round(Math.min(alt * 0.2, CABIN_LIMIT));
    var cabin = normalCabin;
    var leak = 0;
    if (valve < NORMAL_FROM) {
      // Valve open too far: air escapes, so the cabin climbs toward the aircraft altitude.
      // At "fully open" the cabin altitude equals the aircraft altitude.
      leak = (NORMAL_FROM - valve) / NORMAL_FROM;
      cabin = normalCabin + (alt - normalCabin) * leak;
    }
    cabin = Math.round(cabin);
    var gap = alt - cabin;                                      // pressure gap in feet
    var raw = Math.round(gap / 10000 * MAX_DIFF * 10) / 10;     // PSI before the limit is applied
    var diff = Math.min(MAX_DIFF, Math.max(0, raw));            // PSI after the limit
    // The safety valve only lifts when the outflow valve cannot release air (fully closed)
    // and the pressure would go over the limit.
    var relief = valve === 100 && raw > MAX_DIFF;
    return { cabin: cabin, normalCabin: normalCabin, leak: leak, gap: gap, raw: raw, diff: diff, relief: relief };
  }

  // Describe the valve slider in words
  function valveWords(valve) {
    if (valve === 0) return "Fully open";
    if (valve === 100) return "Fully closed";
    if (valve < NORMAL_FROM) return "Too far open (" + valve + "% closed)";
    return "Normal operating range (" + valve + "% closed)";
  }

  // Status: green / amber / red from cabin altitude
  function statusFor(cabin) {
    if (cabin > 10000) return { cls: "status-red", text: "✖ WARNING – Cabin Altitude High" };
    if (cabin > CABIN_LIMIT) return { cls: "status-amber", text: "▲ CAUTION – Cabin altitude above 8,000 ft" };
    return { cls: "status-green", text: "✔ NORMAL PRESSURISATION" };
  }

  // The plain-English sentence under the simulation
  function explain(alt, valve, r, status) {
    var altTxt = fmt(alt) + " ft", cabTxt = fmt(r.cabin) + " ft";
    if (alt === 0) {
      return "The aircraft is on the ground. The air inside and outside the cabin is at the same pressure, so there is no pressure difference.";
    }
    if (valve >= NORMAL_FROM) {
      var lead = "At " + altTxt + " with the outflow valve in its normal position, the cabin is pressurised to the equivalent of " + cabTxt;
      if (valve === 100) {
        return r.relief
          ? "The outflow valve is fully closed, so no air can leave through it and the pressure would keep rising. The safety valve opens by itself to hold the differential pressure at " + MAX_DIFF + " PSI."
          : lead + ". The valve is fully closed, but the pressure is still inside the limit, so the safety valve stays closed.";
      }
      if (r.cabin === CABIN_LIMIT) return lead + " – the top of the normal range. This is still safe.";
      return lead + " – safe and comfortable.";
    }
    var open = "The outflow valve is open too far, so cabin air escapes faster than it is supplied. At " + altTxt + " the cabin altitude is " + cabTxt;
    if (status.cls === "status-red") return open + ". This is too high. The crew would have to descend and use oxygen.";
    if (status.cls === "status-amber") return open + ". This is above the normal 8,000 ft limit. Check the outflow valve and the pressure controller.";
    return open + ". At this height that is still safe, but the pressure is not being held properly.";
  }

  /* ---- Valve view (the cross-section diagram) ---- */

  // Blue arrows inside the cabin push on the skin. Each is {tip x, tip y, direction x, direction y}.
  var PUSH_ARROWS = [
    [38, 110, -1, 0], [38, 160, -1, 0], [38, 210, -1, 0],       // left wall
    [382, 110, 1, 0], [382, 160, 1, 0], [382, 210, 1, 0],       // right wall
    [90, 68, 0, -1], [150, 68, 0, -1], [225, 68, 0, -1],        // roof
    [90, 242, 0, 1], [250, 242, 0, 1], [310, 242, 0, 1]         // floor
  ];

  // Make an arrow path inside a group and return it
  function makeArrow(group, className, marker) {
    var p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("class", className);
    p.setAttribute("marker-end", "url(#" + marker + ")");
    group.appendChild(p);
    return p;
  }

  // Set an arrow to run from (x1, y1) to (x2, y2)
  function setArrow(p, x1, y1, x2, y2) {
    p.setAttribute("d", "M" + x1 + "," + y1 + " L" + x2 + "," + y2);
  }

  var pushGroup = $("sim-push");
  var pushPaths = PUSH_ARROWS.map(function () { return makeArrow(pushGroup, "sim-push-arrow", "sim-arrow-blue"); });
  var airOutGroup = $("sim-air-out");
  var airOutPaths = [130, 190].map(function () { return makeArrow(airOutGroup, "sim-air-arrow", "sim-arrow-grey"); });
  var reliefGroup = $("sim-relief");
  var reliefPath = makeArrow(reliefGroup, "sim-air-arrow", "sim-arrow-grey");
  var cabinFill = $("sim-cabin-fill");

  // Redraw the valves, arrows and labels for the current slider values
  function drawValves(alt, valve, r, status) {
    var open = (100 - valve) / 100;          // 0 = fully closed, 1 = fully open
    var load = r.diff / MAX_DIFF;            // 0 to 1: how close the pressure is to the limit

    // Outflow valve: a flap that turns edge-on as it opens
    $("sim-flap").setAttribute("transform", "rotate(" + (open * 90) + " 160 250)");
    $("sim-outflow-state").textContent = valve === 0 ? "FULLY OPEN" : valve === 100 ? "FULLY CLOSED" : valve + "% closed";

    // Air leaving through the outflow valve (longer arrows = more air)
    var outLength = r.diff > 0 ? open * (14 + 36 * load) : 0;
    airOutPaths.forEach(function (p, i) {
      var x = i === 0 ? 128 : 192;
      if (outLength < 6) { p.setAttribute("d", ""); return; }
      setArrow(p, x, 262, x, 262 + outLength);
    });

    // Safety valve: the plug lifts and air escapes only when it is relieving pressure
    $("sim-poppet").setAttribute("transform", "translate(0," + (r.relief ? -16 : 0) + ")");
    var safetyState = $("sim-safety-state");
    safetyState.textContent = r.relief ? "OPEN \u2013 relieving" : "CLOSED";
    safetyState.setAttribute("class", "sim-state end" + (r.relief ? " is-open" : ""));
    if (r.relief) setArrow(reliefPath, 290, 32, 290, 6); else reliefPath.setAttribute("d", "");

    // Push on the skin: longer arrows mean more differential pressure
    var push = r.diff > 0 ? 6 + 28 * load : 0;
    PUSH_ARROWS.forEach(function (a, i) {
      if (push === 0) { pushPaths[i].setAttribute("d", ""); return; }
      setArrow(pushPaths[i], a[0] - a[2] * push, a[1] - a[3] * push, a[0], a[1]);
    });

    // Cabin colour follows the status bar
    cabinFill.setAttribute("class", "sim-cabin sim-cabin-" + status.cls.replace("status-", ""));
    $("sim-svg-cabin").textContent = fmt(r.cabin) + " ft";
    $("sim-svg-outside").textContent = fmt(alt) + " ft";
  }

  /* ---- Step-by-step working ---- */

  // Fill the "how the differential pressure is worked out" list with the current numbers
  function drawWorking(alt, valve, r) {
    var list = $("calc-steps");
    clear(list);
    function step(title, lines, note, isResult) {
      var li = el("li", "calc-step" + (isResult ? " calc-result" : ""));
      li.appendChild(el("strong", "", title));
      lines.forEach(function (line) { li.appendChild(el("span", "calc-formula", line)); });
      if (note) li.appendChild(el("span", "calc-note", note));
      list.appendChild(li);
    }
    var psi = function (n) { return n.toFixed(1) + " PSI"; };

    // Step 1: cabin altitude
    if (valve >= NORMAL_FROM) {
      step("Find the cabin altitude",
        [fmt(alt) + " ft \u00D7 0.2 = " + fmt(r.cabin) + " ft"],
        "The outflow valve is in its normal range, so the cabin altitude is held at no more than " + fmt(CABIN_LIMIT) + " ft.");
    } else {
      step("Find the cabin altitude",
        ["Normal cabin altitude: " + fmt(alt) + " \u00D7 0.2 = " + fmt(r.normalCabin) + " ft",
         "Air escaping: (" + NORMAL_FROM + " \u2212 " + valve + ") \u00F7 " + NORMAL_FROM + " = " + r.leak.toFixed(2),
         fmt(r.normalCabin) + " + (" + fmt(alt) + " \u2212 " + fmt(r.normalCabin) + ") \u00D7 " + r.leak.toFixed(2) + " = " + fmt(r.cabin) + " ft"],
        "The valve is open too far, so the cabin altitude climbs toward the aircraft altitude.");
    }

    // Step 2: the gap in feet
    step("Find the height gap",
      [fmt(alt) + " \u2212 " + fmt(r.cabin) + " = " + fmt(r.gap) + " ft"],
      "Aircraft altitude minus cabin altitude.");

    // Step 3: feet to PSI
    step("Change the gap into PSI",
      [fmt(r.gap) + " \u00F7 10,000 \u00D7 " + MAX_DIFF + " = " + psi(r.raw)],
      "In this simple model, every 10,000 ft of gap counts as " + MAX_DIFF + " PSI.");

    // Step 4: apply the limit
    if (r.raw > MAX_DIFF) {
      step("Apply the " + MAX_DIFF + " PSI limit",
        [psi(r.raw) + " is more than " + psi(MAX_DIFF) + ", so it is held at " + psi(MAX_DIFF)],
        r.relief ? "The outflow valve is fully closed, so the safety valve opens to hold the pressure here."
          : valve < NORMAL_FROM ? "The valve is open too far, so the cabin is not holding this pressure. The value is capped at the limit."
          : "The controller adjusts the outflow valve to hold the pressure here.");
    } else {
      step("Apply the " + MAX_DIFF + " PSI limit",
        [psi(r.raw) + " is not more than " + psi(MAX_DIFF) + ", so it stays at " + psi(r.diff)],
        "Inside the limit, so nothing needs to hold it back.");
    }

    step("Result", ["Differential pressure = " + psi(r.diff)], "", true);
  }

  // Update all the readouts when a slider moves
  function updateSimulation() {
    var alt = Number(altSlider.value);
    var valve = Number(valveSlider.value);
    var r = simulate(alt, valve);
    var status = statusFor(r.cabin);

    $("sim-alt-text").textContent = fmt(alt) + " ft";
    $("sim-valve-text").textContent = valveWords(valve);
    valveSlider.setAttribute("aria-valuetext", valveWords(valve));
    $("sim-cabin").textContent = fmt(r.cabin);
    $("sim-diff").textContent = r.diff.toFixed(1);

    var bar = $("sim-status");
    bar.className = "status " + status.cls;
    bar.textContent = status.text;
    $("sim-explain").textContent = explain(alt, valve, r, status);
    drawValves(alt, valve, r, status);
    drawWorking(alt, valve, r);
  }
  altSlider.addEventListener("input", updateSimulation);
  valveSlider.addEventListener("input", updateSimulation);
  updateSimulation();

  /* ======================================================================
     4. FAULT SCENARIOS
     ====================================================================== */

  // state: "ok" (normal), "warn" (watch), "bad" (fault)
  var FAULTS = [
    {
      title: "Scenario 1: Cabin altitude climbing fast",
      symptoms: ["Cabin altitude climbs rapidly.", "Differential pressure drops to zero."],
      readings: [
        { label: "Cabin altitude", value: "24,000 ft ▲", note: "CLIMBING FAST", state: "bad" },
        { label: "Differential pressure", value: "0.0 PSI", note: "ZERO", state: "bad" },
        { label: "Engine bleed air pressure", value: "42 PSI", note: "NORMAL", state: "ok" },
        { label: "Cabin temperature", value: "22 °C", note: "NORMAL", state: "ok" }
      ],
      options: [
        { text: "Pack (ACM) fault", correct: false },
        { text: "Outflow valve stuck open", correct: true },
        { text: "Bleed air supply failure", correct: false }
      ],
      explanation: "The bleed air supply and the temperature are normal, so air is still being pumped in. But the pressure is lost, which means air is escaping as fast as it comes in. A valve stuck open lets the cabin air pour out, so cabin altitude rises to match the aircraft and the pressure difference falls to zero.",
      action: "Check the outflow valve first. Look for a jammed valve door or blocked linkage, then check that its motor responds to commands from the pressure controller. Also check the valve seals and the controller wiring for damage."
    },
    {
      title: "Scenario 2: No conditioned air in the cabin",
      symptoms: ["No conditioned air entering the cabin.", "Cabin temperature rises.", "Pressurisation lost."],
      readings: [
        { label: "Conditioned air flow", value: "0 kg/min", note: "NO FLOW", state: "bad" },
        { label: "Cabin temperature", value: "34 °C ▲", note: "RISING", state: "bad" },
        { label: "Engine bleed air pressure", value: "2 PSI", note: "VERY LOW", state: "bad" },
        { label: "Differential pressure", value: "1.2 PSI ▼", note: "FALLING", state: "bad" }
      ],
      options: [
        { text: "Outflow valve stuck closed", correct: false },
        { text: "Safety valve opened by mistake", correct: false },
        { text: "Bleed air failure", correct: true }
      ],
      explanation: "No air is coming from the engines, so there is nothing for the pack to cool and nothing to fill the cabin. With no new air going in, the pressure slowly leaks away and the cabin gets warm.",
      action: "Check the bleed air source first. Look at the engine bleed valve and its controls, then inspect the bleed air pipes for leaks, cracks or loose clamps. Read the bleed pressure and temperature sensors and the fault messages."
    },
    {
      title: "Scenario 3: Temperature control lost",
      symptoms: ["Cabin temperature control lost.", "Pressurisation partially maintained.", "Air quality affected."],
      readings: [
        { label: "Cabin temperature control", value: "No response", note: "FAULT", state: "bad" },
        { label: "Pack outlet temperature", value: "68 °C", note: "TOO HOT", state: "bad" },
        { label: "Differential pressure", value: "6.9 PSI", note: "LOWER THAN NORMAL", state: "warn" },
        { label: "Cabin air", value: "Haze and smell reported", note: "POOR QUALITY", state: "warn" }
      ],
      options: [
        { text: "Pack (ACM) fault", correct: true },
        { text: "Outflow valve stuck open", correct: false },
        { text: "Bleed air failure", correct: false }
      ],
      explanation: "Air is still reaching the cabin, so pressure is mostly held. But the air is not being cooled and cleaned properly, and the temperature cannot be controlled. That points to the pack, where the Air Cycle Machine does the cooling and conditioning.",
      action: "Check the pack first. Read the pack fault messages and the outlet temperature sensor. Then inspect the ACM and its heat exchangers for blockage or damage, look for oil or dirt in the air ducts, and check the pack control valves."
    }
  ];

  var faultList = $("fault-list");

  // Build one scenario card
  function buildFault(f, index) {
    var card = el("div", "fault-card");
    var bodyId = "fault-body-" + index;

    // The card header is a button that opens and closes the card
    var head = el("button", "fault-head");
    head.type = "button";
    head.setAttribute("aria-expanded", "false");
    head.setAttribute("aria-controls", bodyId);
    head.appendChild(el("span", "", f.title));
    var badge = el("span", "fault-badge", "");
    head.appendChild(badge);
    card.appendChild(head);

    var body = el("div", "fault-body");
    body.id = bodyId;
    body.hidden = true;

    body.appendChild(el("h3", "", "Symptoms"));
    var list = el("ul", "symptoms");
    f.symptoms.forEach(function (s) { list.appendChild(el("li", "", s)); });
    body.appendChild(list);

    // Instrument readings
    body.appendChild(el("h3", "", "Instrument readings"));
    var gauges = el("div", "gauges");
    f.readings.forEach(function (r) {
      var g = el("div", "gauge " + r.state);
      g.appendChild(el("span", "gauge-label", r.label));
      g.appendChild(el("span", "gauge-value", r.value));
      g.appendChild(el("span", "gauge-note", r.note));
      gauges.appendChild(g);
    });
    body.appendChild(gauges);

    // Question and three options
    body.appendChild(el("h3", "", "What is the likely fault?"));
    var options = el("div", "options");
    var feedback = el("div", "");
    feedback.setAttribute("role", "status");
    var solved = false;

    f.options.forEach(function (opt) {
      var b = el("button", "option", opt.text);
      b.type = "button";
      b.addEventListener("click", function () {
        if (solved) return;
        clear(feedback);
        if (opt.correct) {
          solved = true;
          b.classList.add("correct");
          Array.prototype.forEach.call(options.children, function (o) { o.disabled = true; });
          badge.textContent = "✔ Solved";
          feedback.className = "feedback good";
          feedback.appendChild(el("strong", "", "Correct! "));
          feedback.appendChild(document.createTextNode(f.explanation));
          // Maintenance action note shown after the correct answer
          var note = el("div", "action-note");
          note.appendChild(el("strong", "", "Maintenance Action"));
          note.appendChild(el("span", "", f.action));
          feedback.parentNode.appendChild(note);
        } else {
          b.classList.add("wrong");
          b.disabled = true;
          feedback.className = "feedback bad";
          feedback.textContent = "Not quite. Look at the readings again and try another answer.";
        }
      });
      options.appendChild(b);
    });
    body.appendChild(options);
    body.appendChild(feedback);
    card.appendChild(body);

    head.addEventListener("click", function () {
      var open = body.hidden;
      body.hidden = !open;
      head.setAttribute("aria-expanded", open ? "true" : "false");
      card.classList.toggle("open", open);
    });
    return card;
  }
  FAULTS.forEach(function (f, i) { faultList.appendChild(buildFault(f, i)); });

  /* ======================================================================
     5. COMPETENCY CHECK  (5 questions, one at a time, pass mark 4 of 5)
     ====================================================================== */
  var PASS_MARK = 4;

  // `correct` is the index of the right option; `topic` feeds the portal's weak-topics list
  var QUESTIONS = [
    {
      q: "Why is cabin pressurisation needed on high-altitude aircraft?",
      topic: "Why we pressurise",
      options: [
        "Air at high altitude is too thin to breathe safely",
        "It helps the aircraft fly faster",
        "It keeps the cabin cool",
        "It stops the engines from overheating"
      ],
      correct: 0,
      why: "At high altitude the air is too thin to breathe, so the cabin is kept under pressure."
    },
    {
      q: "What is the normal maximum cabin altitude for a pressurised aircraft?",
      topic: "Cabin altitude",
      options: ["4,000 feet", "15,000 feet", "8,000 feet", "35,000 feet"],
      correct: 2,
      why: "The cabin is normally kept at 8,000 feet or lower, even when the aircraft is much higher."
    },
    {
      q: "What component controls the release of air overboard to maintain cabin pressure?",
      topic: "System components",
      options: ["Pre-cooler", "Outflow valve", "Mix manifold", "Engine bleed valve"],
      correct: 1,
      why: "The outflow valve opens and closes to let air out and hold the cabin at the right pressure."
    },
    {
      q: "What does the Air Cycle Machine (ACM) do?",
      topic: "System components",
      options: [
        "Releases cabin air to the outside",
        "Stops the pressure from getting too high",
        "Stores spare air for emergencies",
        "Cools and conditions bleed air before it enters the cabin"
      ],
      correct: 3,
      why: "The ACM is part of the air conditioning pack. It cools and conditions the hot bleed air."
    },
    {
      q: "What would happen if the outflow valve was stuck fully open?",
      topic: "Faults",
      options: [
        "The cabin would become over-pressurised",
        "The cabin would depressurise – cabin altitude would rise to aircraft altitude",
        "The cabin would get much colder but stay pressurised",
        "Nothing, because the safety valve would close it"
      ],
      correct: 1,
      why: "Air would escape as fast as it is supplied, so the cabin pressure would fall to match the outside."
    }
  ];

  var quiz = $("quiz");
  var current = 0;      // index of the question being shown
  var results = [];     // [{ q, topic, correct }] for the portal tracker

  // Show question number `current`
  function showQuestion() {
    clear(quiz);
    var item = QUESTIONS[current];

    quiz.appendChild(el("p", "quiz-progress", "Question " + (current + 1) + " of " + QUESTIONS.length));
    var track = el("div", "progress-track");
    var fill = el("div", "progress-fill");
    fill.style.width = (current / QUESTIONS.length * 100) + "%";
    track.appendChild(fill);
    quiz.appendChild(track);

    var heading = el("h3", "quiz-question", item.q);
    heading.tabIndex = -1;
    quiz.appendChild(heading);

    var options = el("div", "options");
    var feedback = el("div", "");
    feedback.setAttribute("role", "status");
    var actions = el("div", "quiz-actions");

    item.options.forEach(function (text, i) {
      var b = el("button", "option", text);
      b.type = "button";
      b.addEventListener("click", function () {
        var right = i === item.correct;
        results.push({ q: item.q, topic: item.topic, correct: right });
        // Lock the answers and show which was right
        Array.prototype.forEach.call(options.children, function (o, n) {
          o.disabled = true;
          if (n === item.correct) o.classList.add("correct");
        });
        if (!right) b.classList.add("wrong");
        feedback.className = "feedback " + (right ? "good" : "bad");
        feedback.textContent = (right ? "Correct. " : "Not correct. ") + item.why;
        var last = current === QUESTIONS.length - 1;
        var next = el("button", "btn", last ? "See my score" : "Next question");
        next.type = "button";
        next.addEventListener("click", function () {
          current += 1;
          if (current < QUESTIONS.length) showQuestion(); else showResult();
        });
        actions.appendChild(next);
        next.focus();
      });
      options.appendChild(b);
    });

    quiz.appendChild(options);
    quiz.appendChild(feedback);
    quiz.appendChild(actions);
  }

  // Show the score and the pass / fail message
  function showResult() {
    clear(quiz);
    var score = results.filter(function (r) { return r.correct; }).length;
    var passed = score >= PASS_MARK;

    var box = el("div", "result");
    var title = el("h3", "", "Your result");
    title.tabIndex = -1;
    box.appendChild(title);
    box.appendChild(el("p", "score", score + " out of " + QUESTIONS.length));
    box.appendChild(el("p", "result-msg " + (passed ? "pass" : "fail"),
      passed
        ? "✔ PASS – Well done. You have shown you understand the cabin pressurisation system."
        : "✖ NOT YET – You need " + PASS_MARK + " out of " + QUESTIONS.length + " to pass. Review the lesson and try again."));
    box.appendChild(el("br"));
    var again = el("button", "btn", "Try Again");
    again.type = "button";
    again.addEventListener("click", function () {
      current = 0;
      results = [];
      showQuestion();
    });
    box.appendChild(again);
    quiz.appendChild(box);
    title.focus();

    // Save to the portal tracker (on this device only). Guarded: the page works without it.
    if (window.Tracker) {
      window.Tracker.quizResult(score, QUESTIONS.length, results);
      window.Tracker.complete();
    }
  }

  showQuestion();
})();
