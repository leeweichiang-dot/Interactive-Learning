/*
 * Fault Investigation (section 4).
 *
 * A beginner activity about how a problem in one pressure path can change what
 * the instruments show. The trainee picks a condition, studies the diagram,
 * predicts the indications, and only then sees a conceptual explanation.
 *
 * It is educational and diagnostic only: no maintenance steps, no aircraft data.
 * Needle values after the reveal are illustrative, generic teaching numbers.
 * Nothing is scored or saved.
 *
 * The diagram is a copy of the Guided Learning diagram (built by guided.js), so
 * this file must load after guided.js.
 */
(function () {
  "use strict";

  const root = document.getElementById("faults");
  const source = document.getElementById("simSvg");
  if (!root || !source || !window.PressurePulses || !window.SimCommon) return;
  const C = window.SimCommon;
  const NS = "http://www.w3.org/2000/svg";
  const $ = function (id) { return document.getElementById(id); };
  const section = root.closest(".step");

  /* ---------- The situation shown and the conditions ---------- */

  // Reference situation: after a steady climb at a steady speed (teaching values).
  const BASE = { ias: 250, alt: 8000, vs: 1500 };
  const ALL_STATIC = ["sr-asi", "sl-asi", "sr-alt", "sl-alt", "sr-vsi", "sl-vsi"];
  const ALL_ROUTES = ["pitot"].concat(ALL_STATIC);

  const INSTRUMENT = { asi: "Airspeed indicator", alt: "Altimeter", vsi: "Vertical speed indicator" };
  const SOURCE = { pitot: "Pitot (total) pressure", static: "Static pressure", none: "Neither: no pressure source is affected" };
  const EXTRA = { none: "None of them", all: "All of them (nothing is faulty)" };
  const REMINDER = "Actual indications depend on aircraft design, system configuration and approved technical documentation.";

  const CONDITIONS = [
    {
      id: "normal",
      tab: "1. Normal system",
      title: "Normal system",
      summary: "Both pressure paths are open. This is the picture to compare the other conditions with.",
      faulty: [], marks: [],
      diagram: "No fault is marked. Red pulses travel from the pitot tube to the airspeed indicator. Blue pulses travel from both static ports to all three instruments.",
      routes: function () { return ALL_ROUTES; },
      answer: { source: "none", instruments: ["none"], unaffected: ["all"], evidence: "e1" },
      evidence: [
        { id: "e1", text: "Pulses flow normally along the red and blue lines to the instruments." },
        { id: "e2", text: "The pulses stop before they reach the airspeed indicator." },
        { id: "e3", text: "A blocked marker is shown on a static port." }
      ],
      result: function () { return { ias: BASE.ias, alt: BASE.alt, vs: BASE.vs, affected: [] }; },
      explanation: [
        "With both pressure paths open, each instrument gets the pressure it needs. The airspeed indicator compares pitot pressure with static pressure. The altimeter and vertical speed indicator use static pressure only.",
        "In this example the instruments show a steady speed, a height of about 8,000 ft and a climb. Keep this normal picture in mind when you look at the faults."
      ]
    },
    {
      id: "pitot-inlet",
      tab: "2. Pitot inlet blocked",
      title: "Pitot inlet blocked",
      summary: "The front opening (inlet) of the pitot tube is blocked. Total pressure cannot get in.",
      faulty: ["tube"], marks: ["inlet"],
      diagram: "A blocked marker sits on the pitot inlet. No red pulses leave the pitot tube. Blue pulses still reach all three instruments.",
      routes: function () { return ALL_STATIC; },
      answer: { source: "pitot", instruments: ["asi"], unaffected: ["alt", "vsi"], evidence: "e1" },
      evidence: [
        { id: "e2", text: "Blue pulses stop at the static ports." },
        { id: "e1", text: "A blocked marker sits on the pitot inlet, and no red pulses leave the pitot tube." },
        { id: "e3", text: "The pulses flow normally on every line." }
      ],
      result: function () { return { ias: 0, alt: BASE.alt, vs: BASE.vs, affected: ["asi"] }; },
      explanation: [
        "The airspeed indicator needs total pressure from the pitot tube. With the inlet blocked, fresh total pressure cannot get in.",
        "Pressure already inside the pitot line may leak out through the small drain opening. The airspeed indication may then fall toward zero. Or it may stop responding to changes in speed. What happens depends on the design.",
        "The altimeter and vertical speed indicator use only static pressure. So a pitot fault does not directly affect them."
      ]
    },
    {
      id: "pitot-drain",
      tab: "3. Pitot drain opening blocked",
      title: "Pitot drain opening blocked",
      summary: "The small drain opening of the pitot tube is blocked. The main inlet is still open.",
      faulty: ["tube", "drain"], marks: ["drain"],
      diagram: "A blocked marker sits on the drain opening. Water slowly collects there. Red pulses still travel to the airspeed indicator. Blue pulses still reach all three instruments.",
      routes: function () { return ALL_ROUTES; },
      answer: { source: "pitot", instruments: ["asi"], unaffected: ["alt", "vsi"], evidence: "e1" },
      evidence: [
        { id: "e2", text: "No pulses leave the pitot tube." },
        { id: "e3", text: "The blue pulses stop at the static ports." },
        { id: "e1", text: "The red pulses still reach the airspeed indicator, but the drain is marked blocked and moisture collects there." }
      ],
      result: function () { return { ias: BASE.ias, alt: BASE.alt, vs: BASE.vs, affected: ["asi"] }; },
      explanation: [
        "The drain opening lets water leave the pitot tube. The inlet is still open. So total pressure still reaches the airspeed indicator. The indication may look normal at first.",
        "If water collects, it may later disturb the pressure in the pitot line. The airspeed indication may become unsteady or wrong. The needles stay normal now because the effect may not show straight away.",
        "The altimeter and vertical speed indicator use static pressure, so they are not directly affected."
      ]
    },
    {
      id: "static-blocked",
      tab: "4. Static source blocked",
      title: "Static source blocked",
      summary: "The static ports are blocked, so outside air pressure cannot reach the static line.",
      faulty: ["portL", "portR"], marks: ["portL", "portR"],
      diagram: "Blocked markers sit on both static ports. No blue pulses leave the ports. Red pulses still travel from the pitot tube to the airspeed indicator.",
      routes: function () { return ["pitot"]; },
      answer: { source: "static", instruments: ["asi", "alt", "vsi"], unaffected: ["none"], evidence: "e1" },
      evidence: [
        { id: "e3", text: "Pulses flow normally on every line." },
        { id: "e2", text: "The red pulses stop at the pitot inlet." },
        { id: "e1", text: "Blocked markers sit on both static ports, and no blue pulses reach any instrument." }
      ],
      result: function () { return { ias: 210, alt: 5000, vs: 0, affected: ["asi", "alt", "vsi"] }; },
      explanation: [
        "All three instruments use static pressure. If the ports are blocked, the static line holds the old pressure. It no longer follows the real outside pressure.",
        "In a climb, the altimeter may stay at the earlier height. The vertical speed indicator may read near zero. The airspeed indicator compares pitot pressure with the trapped static pressure. So it may read lower than the real speed.",
        "All three instruments depend on static pressure. None of them is fully free of this fault."
      ]
    },
    {
      id: "heater",
      tab: "5. Pitot heating unavailable",
      title: "Pitot heating unavailable",
      summary: "The pitot heater is not working. The heater normally helps stop ice blocking the inlet.",
      faulty: ["heaterEl"], marks: [], heater: true, icing: true,
      diagram: "The heater is shown off. In icing conditions, ice builds on the inlet and the red pulses fade out. In dry air the pulses keep flowing. Blue pulses always reach all three instruments.",
      routes: function () { return ALL_ROUTES; },
      answer: { source: "pitot", instruments: ["asi"], unaffected: ["alt", "vsi"], evidence: "e1" },
      evidence: [
        { id: "e1", text: "The heater is shown off. In icing conditions, ice builds on the inlet and the red pulses fade out." },
        { id: "e2", text: "Blocked markers sit on the static ports." },
        { id: "e3", text: "The blue pulses stop and the red pulses are unaffected." }
      ],
      result: function (s) { return s.icing ? { ias: 0, alt: BASE.alt, vs: BASE.vs, affected: ["asi"] } : { ias: BASE.ias, alt: BASE.alt, vs: BASE.vs, affected: [] }; },
      explanation: [
        "A pitot heater keeps the inlet warm so ice cannot build up. In dry air with no ice, the airspeed indication may not be affected.",
        "In icing conditions (cold, wet air), ice may block the inlet. The pitot tube then acts like a blocked inlet. The airspeed indication may become wrong or stop responding.",
        "The altimeter and vertical speed indicator use static pressure, so they are not directly affected."
      ]
    }
  ];

  /* ---------- Copy the simulation diagram and add the fault marks ---------- */

  const svg = source.cloneNode(true);
  const needle = { asi: svg.querySelector("#needleAsi"), alt: svg.querySelector("#needleAlt"), vsi: svg.querySelector("#needleVsi") };
  const value = { asi: svg.querySelector("#valAsi"), alt: svg.querySelector("#valAlt"), vsi: svg.querySelector("#valVsi") };
  const airGroup = svg.querySelector("#simAir");
  const airLabel = svg.querySelector("#simAirLabel");
  const dotLayer = svg.querySelector("#simDots");
  while (dotLayer.firstChild) dotLayer.removeChild(dotLayer.firstChild);
  const titleEl = svg.querySelector("title"), descEl = svg.querySelector("desc");
  svg.querySelectorAll("[id]").forEach(function (e) { e.removeAttribute("id"); });
  svg.classList.remove("has-sel");
  svg.querySelectorAll(".rel, .dimmed").forEach(function (e) { e.classList.remove("rel", "dimmed"); });
  svg.querySelectorAll("[data-dim]").forEach(function (e) { e.removeAttribute("data-dim"); });
  titleEl.id = "fdTitle";
  descEl.id = "fdDesc";
  titleEl.textContent = "Fault investigation: pitot-static system and three instruments";
  descEl.textContent = "A generic training aircraft. It shows a pitot tube, a heater, a drain opening, two static ports, pressure lines and three instruments. Fault markers and moving pulses change with the chosen condition. A text description of the diagram is announced when you choose a condition.";
  svg.setAttribute("aria-labelledby", "fdTitle fdDesc");
  svg.setAttribute("aria-describedby", "fCompare");
  svg.removeAttribute("id");
  Array.from(svg.querySelectorAll("text")).forEach(function (t) {
    if (t.textContent.indexOf("Generic training aircraft") === 0) t.textContent = "Simulated values. Generic training aircraft.";
  });
  airGroup.setAttribute("opacity", "1");
  airLabel.textContent = "Airflow";

  function add(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    (parent || svg).insertBefore(e, parent ? null : dotLayer);
    return e;
  }
  function cross(parent, r) {
    add("line", { x1: -r, y1: -r, x2: r, y2: r }, parent);
    add("line", { x1: -r, y1: r, x2: r, y2: -r }, parent);
  }

  // Heater coil on the pitot tube, and a small drain opening under it
  const heater = add("path", { "class": "heater", "data-el": "heaterEl", d: "M44 230 l4 -7 l6 14 l6 -14 l6 14 l6 -14 l4 7" });
  const drain = add("path", { "class": "heater drain", "data-el": "drain", d: "M82 233 V250" });
  add("circle", { "class": "drain-hole", cx: 82, cy: 253, r: 3 });
  const heaterText = add("text", { "class": "tiny", x: 44, y: 214 });
  heaterText.textContent = "Heater";
  const drainText = add("text", { "class": "tiny", x: 92, y: 268 });
  drainText.textContent = "Drain opening";

  // Blockage markers (a circle with a cross), shown only for the matching condition
  const MARK_AT = { inlet: [34, 230, 9, 4.5], drain: [82, 256, 7, 3.5], portR: [200, 204, 12, 6], portL: [200, 256, 12, 6] };
  const marks = {};
  Object.keys(MARK_AT).forEach(function (k) {
    const m = MARK_AT[k];
    const g = add("g", { "class": "fmark", transform: "translate(" + m[0] + " " + m[1] + ")", visibility: "hidden" });
    add("circle", { r: m[2] }, g);
    cross(g, m[3]);
    marks[k] = g;
  });
  // Ice on the inlet and moisture at the drain build up slowly
  const ice = add("circle", { "class": "ice", cx: 36, cy: 230, r: 0, visibility: "hidden" });
  const water = add("ellipse", { "class": "water", cx: 82, cy: 263, rx: 0, ry: 0, visibility: "hidden" });

  // Each dial gives two readings: the actual one (dark needle) and the one shown with the fault
  // (amber needle with an open ring). The shown reading stays hidden until the prediction is submitted.
  const shown = {}, shownValue = {};
  Object.keys(INSTRUMENT).forEach(function (k) {
    const g = C.GAUGES[k];
    const group = needle[k].parentNode;
    const names = Array.from(group.querySelectorAll("text")).filter(function (t) {
      return !t.classList.contains("num") && !t.classList.contains("unit") && !t.classList.contains("val");
    });
    const top = g.cy - (names.length === 2 ? 48 : 40);
    names.forEach(function (t, i) { t.setAttribute("y", top + i * 17); });
    const labelY = top + (names.length - 1) * 17 + 19;   // lines are spaced so no text box touches another
    const textAt = function (cls, y, text) {
      const t = document.createElementNS(NS, "text");
      t.setAttribute("class", cls); t.setAttribute("x", 686); t.setAttribute("y", y);
      t.textContent = text;
      group.appendChild(t);
      return t;
    };
    textAt("lab", labelY, "Actual");
    value[k].setAttribute("y", labelY + 19);   // the existing value text becomes the actual value
    textAt("lab", labelY + 41, "Shown with fault");
    shownValue[k] = textAt("val shown", labelY + 60, "");
    const amber = document.createElementNS(NS, "g");
    amber.setAttribute("class", "shown-needle");
    amber.setAttribute("visibility", "hidden");
    const line = document.createElementNS(NS, "line");
    line.setAttribute("class", "needle");
    line.setAttribute("x1", g.cx); line.setAttribute("y1", g.cy); line.setAttribute("x2", g.cx); line.setAttribute("y2", g.cy - 24);
    const ring = document.createElementNS(NS, "circle");
    ring.setAttribute("class", "ring-tip");
    ring.setAttribute("cx", g.cx); ring.setAttribute("cy", g.cy - 21); ring.setAttribute("r", 3);
    amber.appendChild(line); amber.appendChild(ring);
    group.insertBefore(amber, needle[k]);   // under the dark needle, so a match shows as an amber edge
    shown[k] = amber;
  });

  // "May be affected" flags beside each instrument (shown after the reveal)
  const flags = {};
  Object.keys(INSTRUMENT).forEach(function (k) {
    const y = shownValue[k].getAttribute("y");
    flags[k] = add("text", { "class": "flag", x: 686, y: Number(y) + 17, visibility: "hidden" });
    flags[k].textContent = "May be affected";
  });

  $("fSvgHolder").appendChild(svg);

  const faultEls = Array.from(svg.querySelectorAll("[data-el]"));
  const gaugeEl = { asi: svg.querySelector('[data-el="asi"]'), alt: svg.querySelector('[data-el="alt"]'), vsi: svg.querySelector('[data-el="vsi"]') };
  const pulses = window.PressurePulses(dotLayer, window.SimCommon.routes(), { spacing: 150, fade: 16 });

  /* ---------- State ---------- */

  const tabs = Array.from($("fTabs").querySelectorAll("button"));
  const form = $("fForm");
  const submitBtn = $("fSubmit");
  const revealEl = $("fReveal");
  const pauseBtn = $("fPause");
  const resetBtn = $("fReset");
  const icingBox = $("fIcing");
  const icingRow = $("fIcingRow");
  const reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return Boolean(reduceQuery && reduceQuery.matches); }

  const FLOW_SPEED = 65, SPACING = 150, ICE_SECS = 9, WATER_SECS = 12, NEEDLE_SECS = 1.2;
  let idx = 0;
  let revealed = false;
  let icing = true;
  let paused = false;
  let flowDist = 0, buildT = 0;
  let cur = { ias: BASE.ias, alt: BASE.alt, vs: BASE.vs };
  let anim = null;
  let frame = 0, last = 0;

  function cond() { return CONDITIONS[idx]; }

  /* ---------- Drawing ---------- */

  function turn(g, gauge, deg) {
    g.setAttribute("transform", "rotate(" + deg.toFixed(1) + " " + gauge.cx + " " + gauge.cy + ")");
  }
  const FORMAT = {
    asi: function (v) { return C.fmt(v) + " kt"; },
    alt: function (v) { return C.fmt(Math.round(v / 10) * 10) + " ft"; },
    vsi: function (v) { return C.signed(v) + " ft/min"; }
  };
  const KEY = { asi: "ias", alt: "alt", vsi: "vs" };
  const DEG = { asi: C.asiDeg, alt: C.altDeg, vsi: C.vsiDeg };

  function showNeedles() {
    Object.keys(INSTRUMENT).forEach(function (k) {
      const g = C.GAUGES[k];
      // Actual reading: the true (simulated) flight values. They never change in this activity.
      turn(needle[k], g, DEG[k](BASE[KEY[k]]));
      value[k].textContent = FORMAT[k](BASE[KEY[k]]);
      // Reading shown with the fault: only after the prediction is submitted
      shown[k].setAttribute("visibility", revealed ? "visible" : "hidden");
      if (revealed) turn(shown[k], g, DEG[k](cur[KEY[k]]));
      shownValue[k].textContent = revealed ? FORMAT[k](cur[KEY[k]]) : "Predict first";
      shownValue[k].classList.toggle("pending", !revealed);   // grey until there is a reading to show
    });
  }

  // The same two readings as a table, with the effect in words (not colour alone)
  function effect(k, actual, shownReading) {
    if (Math.abs(shownReading - actual) <= (k === "asi" ? 3 : 30)) return "Same as actual";
    if (k === "vsi" && shownReading === 0) return "Shows no climb";
    const much = Math.abs(shownReading - actual) / Math.max(1, Math.abs(actual)) >= 0.5 ? "Much " : "";
    return (much ? "Much lower" : shownReading < actual ? "Lower" : "Higher") + " than actual";
  }
  function renderCompare(res) {
    const body = $("fCompareBody");
    body.textContent = "";
    Object.keys(INSTRUMENT).forEach(function (k) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = INSTRUMENT[k];
      tr.appendChild(th);
      const cells = [
        FORMAT[k](BASE[KEY[k]]),
        res ? FORMAT[k](res[KEY[k]]) : "Hidden until you submit your prediction",
        res ? effect(k, BASE[KEY[k]], res[KEY[k]]) : "Not shown yet"
      ];
      cells.forEach(function (text) { const td = document.createElement("td"); td.textContent = text; tr.appendChild(td); });
      body.appendChild(tr);
    });
    $("fCompareCaption").textContent = res
      ? "Instrument readings (simulated). The values shown with the fault are illustrative, not real aircraft data."
      : "Instrument readings (simulated). The reading shown with the fault stays hidden until you submit your prediction.";
  }

  function buildLevel() {   // 0 to 1: how far ice or moisture has built up
    const c = cond();
    if (c.id === "heater" && icing) return reduced() ? 1 : Math.min(1, buildT / ICE_SECS);
    if (c.id === "pitot-drain") return reduced() ? 1 : Math.min(1, buildT / WATER_SECS);
    return 0;
  }

  function drawFlow() {
    const c = cond();
    const level = buildLevel();
    const strength = {};
    if (c.id === "heater" && icing) strength.pitot = 1 - level * level;   // red pulses fade as ice builds
    pulses.draw(c.routes({ icing: icing }), reduced() ? SPACING * 0.45 : flowDist, strength);
    const iceOn = c.id === "heater" && icing && level > 0;
    ice.setAttribute("r", (11 * level).toFixed(1));
    ice.setAttribute("visibility", iceOn ? "visible" : "hidden");
    const waterOn = c.id === "pitot-drain" && level > 0;
    water.setAttribute("rx", (9 * level).toFixed(1));
    water.setAttribute("ry", (4 * level).toFixed(1));
    water.setAttribute("visibility", waterOn ? "visible" : "hidden");
  }

  function applyCondition() {
    const c = cond();
    faultEls.forEach(function (el) { el.classList.toggle("faulty", c.faulty.indexOf(el.dataset.el) !== -1); });
    Object.keys(marks).forEach(function (k) { marks[k].setAttribute("visibility", c.marks.indexOf(k) !== -1 ? "visible" : "hidden"); });
    heater.classList.toggle("off", Boolean(c.heater));
    heaterText.textContent = c.heater ? "Heater off" : "Heater";
    heaterText.classList.toggle("faulty-text", Boolean(c.heater));
    drainText.classList.toggle("faulty-text", c.faulty.indexOf("drain") !== -1);
    icingRow.hidden = !c.heater;
    icingBox.checked = icing;
  }

  function showFlags(affected) {
    Object.keys(INSTRUMENT).forEach(function (k) {
      const on = affected.indexOf(k) !== -1;
      flags[k].setAttribute("visibility", on ? "visible" : "hidden");
      gaugeEl[k].classList.toggle("affected", on);
    });
  }

  function diagramText() {
    const c = cond();
    let text = c.diagram;
    if (c.heater && !icing) text = "The heater is shown off, but there is no ice, so the pulses keep flowing on every line.";
    $("fDiagramText").textContent = "Diagram for " + c.title + ". " + text;
  }

  function setTarget(t) {
    const target = { ias: t.ias, alt: t.alt, vs: t.vs };
    if (reduced()) { anim = null; cur = target; showNeedles(); return; }
    anim = { from: { ias: cur.ias, alt: cur.alt, vs: cur.vs }, to: target, t: 0 };
    kick();
  }

  /* ---------- Animation loop ---------- */

  function flowRunning() { return !paused && !reduced(); }
  function loop(now) {
    frame = 0;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (flowRunning()) { flowDist += FLOW_SPEED * dt; buildT += dt; }
    if (anim) {
      anim.t += dt;
      const k = Math.min(1, anim.t / NEEDLE_SECS), e = k * k * (3 - 2 * k);
      ["ias", "alt", "vs"].forEach(function (key) { cur[key] = anim.from[key] + (anim.to[key] - anim.from[key]) * e; });
      showNeedles();
      if (k >= 1) anim = null;
    }
    drawFlow();
    if (flowRunning() || anim) frame = requestAnimationFrame(loop);
  }
  function kick() {
    if (frame || reduced() || (paused && !anim) || (section && section.hidden)) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }
  function stopLoop() { cancelAnimationFrame(frame); frame = 0; }

  function updatePauseButton() {
    pauseBtn.textContent = paused ? "Resume animation" : "Pause animation";
    pauseBtn.disabled = reduced();
    $("fMotionNote").textContent = reduced() ? "Motion is off because your device asks for reduced motion. Pulses are shown still, and any build-up is shown at its final stage." : "";
  }

  /* ---------- Prediction form ---------- */

  function fieldset(legend, name, type, options) {
    const fs = document.createElement("fieldset");
    fs.className = "f-q";
    const lg = document.createElement("legend");
    lg.textContent = legend;
    fs.appendChild(lg);
    options.forEach(function (opt) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = type;
      input.name = name;
      input.value = opt.value;
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + opt.label));
      fs.appendChild(label);
    });
    return fs;
  }

  function buildForm() {
    const c = cond();
    form.querySelectorAll("fieldset").forEach(function (f) { f.remove(); });
    const q1 = fieldset("1. Which pressure source is affected?", "q1", "radio",
      Object.keys(SOURCE).map(function (k) { return { value: k, label: SOURCE[k] }; }));
    const instruments = Object.keys(INSTRUMENT).map(function (k) { return { value: k, label: INSTRUMENT[k] }; })
      .concat([{ value: "none", label: "None of them" }]);
    const q2 = fieldset("2. Which instruments depend on that source?", "q2", "checkbox", instruments);
    const q3 = fieldset("3. Which instrument is likely to remain unaffected?", "q3", "radio",
      Object.keys(INSTRUMENT).map(function (k) { return { value: k, label: INSTRUMENT[k] }; })
        .concat([{ value: "none", label: EXTRA.none }, { value: "all", label: EXTRA.all }]));
    const q4 = fieldset("4. What evidence in the diagram supports your answer?", "q4", "radio",
      c.evidence.map(function (e) { return { value: e.id, label: e.text }; }));
    [q1, q2, q3, q4].forEach(function (fs) { form.insertBefore(fs, form.querySelector(".f-actions")); });
    submitBtn.disabled = true;
  }

  function picked(name) {
    const el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }
  function pickedAll(name) {
    return Array.from(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (e) { return e.value; });
  }
  function complete() {
    return picked("q1") !== null && pickedAll("q2").length > 0 && picked("q3") !== null && picked("q4") !== null;
  }
  form.addEventListener("change", function () { if (!revealed) submitBtn.disabled = !complete(); });

  const ORDER = ["asi", "alt", "vsi", "none", "all"];
  function inOrder(list) { return list.slice().sort(function (a, b) { return ORDER.indexOf(a) - ORDER.indexOf(b); }); }
  function names(list, dict) { return inOrder(list).map(function (k) { return dict[k] || k; }).join(", "); }
  function sentence(text) { return /[.!?]$/.test(text) ? text : text + "."; }
  const ALL_NAMES = Object.assign({}, INSTRUMENT, { none: "None of them", all: "All of them" });

  function review() {
    const c = cond(), a = c.answer;
    const mine = { q1: picked("q1"), q2: inOrder(pickedAll("q2")), q3: picked("q3"), q4: picked("q4") };
    const rightQ2 = inOrder(a.instruments);
    const evidenceText = function (id) { return c.evidence.filter(function (e) { return e.id === id; })[0].text; };
    return [
      { q: "Pressure source affected", ok: mine.q1 === a.source, yours: SOURCE[mine.q1], likely: SOURCE[a.source] },
      { q: "Instruments that depend on it", ok: mine.q2.join() === rightQ2.join(), yours: names(mine.q2, ALL_NAMES), likely: names(rightQ2, ALL_NAMES) },
      { q: "Instrument likely to remain unaffected", ok: a.unaffected.indexOf(mine.q3) !== -1, yours: ALL_NAMES[mine.q3], likely: names(a.unaffected, ALL_NAMES).replace(", ", " or ") },
      { q: "Evidence in the diagram", ok: mine.q4 === a.evidence, yours: evidenceText(mine.q4), likely: evidenceText(a.evidence) }
    ];
  }

  function reveal() {
    const c = cond();
    revealed = true;
    form.querySelectorAll("input").forEach(function (i) { i.disabled = true; });
    submitBtn.disabled = true;
    const res = c.result({ icing: icing });

    $("fExplainTitle").textContent = "What is happening: " + c.title;
    const body = $("fExplainBody");
    body.textContent = "";
    c.explanation.forEach(function (t) { const p = document.createElement("p"); p.textContent = t; body.appendChild(p); });
    if (window.Terms) window.Terms.markElement(body);

    let affected = res.affected.length ? names(res.affected, INSTRUMENT) : "None directly";
    if (c.heater && !icing) affected = "None in dry air. The airspeed indicator may be affected if ice forms.";
    $("fAffected").textContent = "Instruments that may be affected: " + sentence(affected);

    const list = $("fReview");
    list.textContent = "";
    review().forEach(function (r) {
      const li = document.createElement("li");
      li.className = r.ok ? "ok" : "diff";
      const strong = document.createElement("strong");
      strong.textContent = (r.ok ? "Matches the likely answer: " : "Different from the likely answer: ") + r.q;
      li.appendChild(strong);
      const detail = document.createElement("span");
      detail.textContent = "Your answer: " + sentence(r.yours) + (r.ok ? "" : " Likely answer: " + sentence(r.likely));
      li.appendChild(detail);
      list.appendChild(li);
    });

    revealEl.hidden = false;
    $("fRevealNeedles").textContent = "On each dial, the dark needle is the actual reading. The amber needle with the open ring is the reading shown with this fault. The values are illustrative generic numbers, not data for any real aircraft.";
    showFlags(res.affected);
    renderCompare(res);
    showNeedles();
    setTarget(res);
    $("fExplainTitle").focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!revealed && complete()) reveal();
  });

  /* ---------- Controls ---------- */

  function setCondition(i) {
    idx = i;
    revealed = false;
    icing = true;
    flowDist = 0;
    buildT = 0;
    anim = null;
    cur = { ias: BASE.ias, alt: BASE.alt, vs: BASE.vs };
    tabs.forEach(function (t, k) { t.setAttribute("aria-pressed", String(k === i)); });
    $("fTitle").textContent = cond().title;
    $("fSummary").textContent = cond().summary;
    revealEl.hidden = true;
    showFlags([]);
    applyCondition();
    buildForm();
    renderCompare(null);
    showNeedles();
    drawFlow();
    diagramText();
    updatePauseButton();
    kick();
  }

  tabs.forEach(function (t, i) {
    t.textContent = CONDITIONS[i].tab;
    t.addEventListener("click", function () { setCondition(i); });
  });
  resetBtn.addEventListener("click", function () {
    paused = false;
    setCondition(0);
    tabs[0].focus();
  });
  pauseBtn.addEventListener("click", function () {
    paused = !paused;
    updatePauseButton();
    if (paused) stopLoop(); else kick();
  });
  icingBox.addEventListener("change", function () {
    icing = icingBox.checked;
    buildT = 0;
    diagramText();
    if (revealed) {
      const res = cond().result({ icing: icing });
      showFlags(res.affected);
      renderCompare(res);
      setTarget(res);
      $("fAffected").textContent = "Instruments that may be affected: " + sentence(icing ? names(res.affected, INSTRUMENT) : "None in dry air. The airspeed indicator may be affected if ice forms");
    }
    drawFlow();
    kick();
  });

  // Stop while the section is hidden; follow the reduced-motion setting
  if (section && window.MutationObserver) {
    new MutationObserver(function () {
      if (section.hidden) { stopLoop(); return; }
      drawFlow();   // measured now that the section is visible
      kick();
    }).observe(section, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (reduceQuery) {
    const onChange = function () {
      stopLoop();
      if (reduced() && anim) { cur = anim.to; anim = null; showNeedles(); }
      updatePauseButton();
      drawFlow();
      kick();
    };
    if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", onChange);
    else if (reduceQuery.addListener) reduceQuery.addListener(onChange);
  }

  setCondition(0);
})();
