/*
 * Guided Learning (section 3, Flight Simulation).
 *
 * Five short scenarios. Each is a list of steps: one short instruction at a time,
 * the part being explained is highlighted, one step asks "What should happen
 * next?" and gives feedback straight away. Nothing is scored or saved.
 * All numbers are teaching values, and flight time is sped up.
 */
(function () {
  "use strict";

  const root = document.getElementById("guided");
  if (!root || !window.PressurePulses || !window.SimCommon) return;
  const $ = function (id) { return document.getElementById(id); };

  const svg = $("simSvg");
  const tabs = Array.from($("gTabs").querySelectorAll("button"));
  const countEl = $("gCount");
  const instructionEl = $("gInstruction");
  const nowEl = $("gNow");
  const questionEl = $("gQuestion");
  const promptEl = $("gPrompt");
  const optionsEl = $("gOptions");
  const feedbackEl = $("gFeedback");
  const doneEl = $("gDone");
  const stateEl = $("gState");
  const summaryEl = $("gSummary");
  const groundEl = $("gGround");
  const startBtn = $("gStart");
  const pauseBtn = $("gPause");
  const resumeBtn = $("gResume");
  const restartBtn = $("gRestart");
  const nextBtn = $("gNext");

  /* ---------- Teaching values ---------- */

  const CRUISE = 250;          // knots
  const FLOW_SPEED = 65;       // diagram pixels per second for the pulses
  const SPACING = 150, FADE = 16;

  // Altitude gain follows a short ramp-up then a steady rate, so height and
  // vertical speed agree with each other.
  const RAMP = 0.12;
  function rampDone(p) { return p < RAMP ? (p * p) / (2 * RAMP) : p - RAMP / 2; }
  const RAMP_TOTAL = rampDone(1);
  function rise(p) { return rampDone(p) / RAMP_TOTAL; }              // 0 to 1
  function rate(p) { return Math.min(1, p / RAMP); }                 // 0 to 1
  function wobble(p) { return 2 * Math.sin(p * Math.PI * 4); }       // "about" constant speed

  const FLOW_PITOT = ["pitot"];
  const FLOW_STATIC = ["sr-alt", "sl-alt", "sr-vsi", "sl-vsi"];

  const PITOT_PART = ["tube", "linePitot"];
  const STATIC_PART = ["portL", "portR", "lineSR", "lineSL", "lineTrunk", "bus"];

  const SCENARIOS = [
    {
      tab: "1. Stationary",
      title: "Aircraft stationary on the ground",
      goal: "See what the instruments show when nothing is moving.",
      state: function (p, g) { return { ias: 0, alt: g, vs: 0 }; },
      steps: [
        { text: "The aircraft is parked. No air is moving past the pitot tube.", hl: PITOT_PART.concat(["asi"]) },
        {
          text: "Look at the three instruments. Nothing is changing.",
          hl: ["asi", "alt", "vsi"],
          q: {
            prompt: "The aircraft stays parked. What should the instruments show?",
            options: [
              { label: "Airspeed shows a small speed, because the engine is running.", feedback: "Not quite. Engine power does not move the airspeed needle. It only reads pressure from air moving past the pitot tube." },
              { label: "Airspeed zero, vertical speed zero, and the altimeter shows the airfield height.", correct: true, feedback: "Correct. With no airflow, pitot pressure equals static pressure, so airspeed is zero. Static pressure is steady, so vertical speed is zero. The altimeter turns static pressure into the airfield height." },
              { label: "Vertical speed shows a small climb.", feedback: "Not quite. Vertical speed shows static pressure changing. Parked, the pressure is steady, so it reads zero." }
            ]
          }
        },
        { text: "The altimeter shows the airfield height, worked out from static pressure. Try changing the airfield height below.", hl: STATIC_PART.concat(["brAlt", "alt"]) }
      ]
    },
    {
      tab: "2. Accelerates",
      title: "Aircraft accelerates",
      goal: "See how the airspeed indicator responds as the aircraft speeds up.",
      state: function (p, g) { const s = p * p * (3 - 2 * p); return { ias: 160 * s, alt: g, vs: 0 }; },
      steps: [
        { text: "The aircraft is at the start of its take-off run. Airspeed is zero.", hl: ["asi"] },
        {
          text: "The pilot adds power. The aircraft will speed up along the runway.",
          hl: PITOT_PART.concat(["asi"]),
          q: {
            prompt: "The aircraft speeds up. Which instruments should change?",
            options: [
              { label: "Airspeed, altitude and vertical speed all change.", feedback: "Not quite. Speeding up along the ground does not change static pressure, so the altimeter and vertical speed stay the same." },
              { label: "Only the airspeed indicator changes.", correct: true, feedback: "Correct. Faster air pushes harder into the pitot tube, so total pressure rises above static pressure. Only the airspeed indicator uses that difference." },
              { label: "Only the altimeter changes.", feedback: "Not quite. The altimeter reads static pressure, and that stays the same while the aircraft stays at one height." }
            ]
          }
        },
        { text: "Watch the pulses travel from the pitot tube to the airspeed indicator as the speed rises.", hl: PITOT_PART.concat(["asi"]), motion: { from: 0, to: 1, secs: 16 }, flow: FLOW_PITOT },
        { text: "Altitude and vertical speed did not move. Static pressure stayed the same.", hl: STATIC_PART.concat(["alt", "vsi"]) }
      ]
    },
    {
      tab: "3. Climbs",
      title: "Aircraft climbs at constant airspeed",
      goal: "See how falling static pressure moves the altimeter and the vertical speed indicator.",
      state: function (p, g) { return { ias: CRUISE + wobble(p), alt: g + 4000 * rise(p), vs: 2000 * rate(p) }; },
      steps: [
        { text: "The aircraft flies level at a steady speed.", hl: ["asi", "alt"] },
        {
          text: "The pilot raises the nose and climbs at the same speed.",
          hl: STATIC_PART.concat(["alt", "vsi"]),
          q: {
            prompt: "Choose the best prediction.",
            options: [
              { label: "Airspeed rises, because the aircraft is going up.", feedback: "Not quite. The pitot tube still feels the same airflow, so airspeed stays about the same." },
              { label: "The altimeter reading falls, because the air pressure falls.", feedback: "Not quite. Pressure does fall, but the altimeter turns lower pressure into a greater height, so its reading rises." },
              { label: "The altimeter rises, vertical speed shows a climb, and airspeed stays about the same.", correct: true, feedback: "Correct. Static pressure falls as height increases. The altimeter shows the greater height, and the vertical speed indicator shows how fast the pressure is falling. Airflow past the pitot tube is unchanged." }
            ]
          }
        },
        { text: "Watch the static pressure path to the altimeter and the vertical speed indicator.", hl: STATIC_PART.concat(["brAlt", "brVsi", "alt", "vsi"]), motion: { from: 0, to: 1, secs: 18 }, flow: FLOW_STATIC },
        { text: "Airspeed stayed about the same. Height changes the static pressure, not the airflow at the pitot tube.", hl: PITOT_PART.concat(["asi"]) }
      ]
    },
    {
      tab: "4. Levels off",
      title: "Aircraft levels off",
      goal: "See what the instruments do when the climb stops.",
      state: function (p, g) { const q = 1 - (1 - p) * (1 - p); return { ias: CRUISE + wobble(p), alt: g + 4000 + 400 * q, vs: 2000 * (1 - p) }; },
      steps: [
        { text: "The aircraft is climbing. The altimeter is rising and vertical speed shows a climb.", hl: ["alt", "vsi"] },
        {
          text: "The pilot levels off and stops climbing.",
          hl: STATIC_PART.concat(["alt", "vsi"]),
          q: {
            prompt: "Choose the best prediction.",
            options: [
              { label: "The altimeter stops rising and holds its reading. Vertical speed moves back toward zero.", correct: true, feedback: "Correct. Once the height stops changing, static pressure stops changing. Vertical speed returns toward zero and the altimeter holds the new height." },
              { label: "The altimeter falls back to the airfield height.", feedback: "Not quite. The altimeter shows the height where the aircraft is now. It does not go back to the ground reading." },
              { label: "Vertical speed stays at the climb value.", feedback: "Not quite. Vertical speed shows how fast static pressure is changing. When the pressure stops changing, the reading falls toward zero." }
            ]
          }
        },
        { text: "Watch the altimeter settle while the vertical speed needle returns toward zero.", hl: STATIC_PART.concat(["brAlt", "brVsi", "alt", "vsi"]), motion: { from: 0, to: 1, secs: 14 }, flow: FLOW_STATIC },
        { text: "The altimeter keeps the new height. Vertical speed is zero because static pressure is steady.", hl: ["alt", "vsi"] }
      ]
    },
    {
      tab: "5. Descends",
      title: "Aircraft descends",
      goal: "See that a descent shows as a negative vertical speed.",
      state: function (p, g) { return { ias: CRUISE + wobble(p), alt: g + 4400 - 3000 * rise(p), vs: -1500 * rate(p) }; },
      steps: [
        { text: "The aircraft flies level. Vertical speed is zero.", hl: ["alt", "vsi"] },
        {
          text: "The pilot lowers the nose and descends.",
          hl: STATIC_PART.concat(["alt", "vsi"]),
          q: {
            prompt: "Choose the best prediction.",
            options: [
              { label: "Vertical speed stays at zero, because airspeed is the same.", feedback: "Not quite. Vertical speed does not depend on airspeed. It shows static pressure changing, and that changes in a descent." },
              { label: "The altimeter reading falls and vertical speed shows a descent.", correct: true, feedback: "Correct. Static pressure rises as the aircraft goes lower. The altimeter turns higher pressure into a lower height, and the vertical speed indicator shows the rising pressure as a negative reading." },
              { label: "The altimeter reading rises, because static pressure rises.", feedback: "Not quite. Static pressure does rise in a descent, but higher pressure means lower height, so the altimeter reading falls." }
            ]
          }
        },
        { text: "Watch the static pressure path. The altimeter falls and vertical speed goes negative.", hl: STATIC_PART.concat(["brAlt", "brVsi", "alt", "vsi"]), motion: { from: 0, to: 1, secs: 18 }, flow: FLOW_STATIC },
        { text: "A negative vertical speed means a descent. It returns to zero when the pilot levels off.", hl: ["vsi"] }
      ]
    }
  ];

  /* ---------- Gauges ---------- */

  const NS = "http://www.w3.org/2000/svg";
  const GAUGES = window.SimCommon.GAUGES;
  const ASI_DEG = window.SimCommon.asiDeg, ALT_DEG = window.SimCommon.altDeg, VSI_DEG = window.SimCommon.vsiDeg;
  const fmt = window.SimCommon.fmt, signed = window.SimCommon.signed;

  function polar(g, radius, deg) {   // deg is clockwise from 12 o'clock
    const a = (deg - 90) * Math.PI / 180;
    return [g.cx + radius * Math.cos(a), g.cy + radius * Math.sin(a)];
  }
  function mark(group, g, r1, r2, deg, major) {
    const a = polar(g, r1, deg), b = polar(g, r2, deg);
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", a[0].toFixed(1)); line.setAttribute("y1", a[1].toFixed(1));
    line.setAttribute("x2", b[0].toFixed(1)); line.setAttribute("y2", b[1].toFixed(1));
    line.setAttribute("class", major ? "tick major" : "tick");
    group.appendChild(line);
  }
  function label(group, g, radius, deg, text, cls) {
    const p = polar(g, radius, deg);
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", p[0].toFixed(1)); t.setAttribute("y", p[1].toFixed(1));
    t.setAttribute("class", cls || "num");
    t.textContent = text;
    group.appendChild(t);
  }

  function buildDials() {
    const asi = $("marksAsi"), alt = $("marksAlt"), vsi = $("marksVsi");
    const NUM = 34;   // radius of the scale numbers
    for (let v = 0; v <= 400; v += 25) {
      const major = v % 100 === 0;
      mark(asi, GAUGES.asi, major ? 44 : 48, 52, ASI_DEG(v), major);
      if (major) label(asi, GAUGES.asi, NUM, ASI_DEG(v), String(v));
    }
    label(asi, GAUGES.asi, 16, 180, "kt", "unit");
    for (let v = 0; v < 10000; v += 500) {
      const major = v % 1000 === 0;
      mark(alt, GAUGES.alt, major ? 44 : 48, 52, ALT_DEG(v), major);
      if (major) label(alt, GAUGES.alt, NUM, ALT_DEG(v), String(v / 1000));
    }
    label(alt, GAUGES.alt, 14, 180, "x1000 ft", "unit");
    for (let v = -3000; v <= 3000; v += 500) {
      const major = v % 1000 === 0;
      mark(vsi, GAUGES.vsi, major ? 44 : 48, 52, VSI_DEG(v), major);
      if (major) label(vsi, GAUGES.vsi, NUM + 2, VSI_DEG(v), String(Math.abs(v) / 1000));
    }
    label(vsi, GAUGES.vsi, 15, 0, "CLIMB", "unit");
    label(vsi, GAUGES.vsi, 15, 180, "DESCENT", "unit");
  }

  function turn(id, g, deg) {
    $(id).setAttribute("transform", "rotate(" + deg.toFixed(1) + " " + g.cx + " " + g.cy + ")");
  }
  /* ---------- Highlighting ---------- */

  const els = Array.from(svg.querySelectorAll("[data-el]"));
  const dimGroups = Array.from(svg.querySelectorAll("[data-dim]"));
  const NAMES = {
    tube: "Pitot tube", linePitot: "Pitot pressure line",
    portL: "Static ports", portR: "Static ports",
    lineSR: "Static pressure line", lineSL: "Static pressure line", lineTrunk: "Static pressure line",
    bus: "Static pressure line", brAsi: "Static pressure line", brAlt: "Static pressure line", brVsi: "Static pressure line",
    asi: "Airspeed indicator", alt: "Altimeter", vsi: "Vertical speed indicator"
  };
  const NAME_ORDER = ["Pitot tube", "Pitot pressure line", "Static ports", "Static pressure line",
    "Airspeed indicator", "Altimeter", "Vertical speed indicator"];

  function highlight(list) {
    svg.classList.toggle("has-sel", list.length > 0);
    els.forEach(function (el) { el.classList.toggle("rel", list.indexOf(el.dataset.el) !== -1); });
    dimGroups.forEach(function (group) {
      const main = group.querySelector("[data-el]");
      group.classList.toggle("dimmed", list.length > 0 && !main.classList.contains("rel"));
    });
    const names = NAME_ORDER.filter(function (n) { return list.some(function (id) { return NAMES[id] === n; }); });
    nowEl.textContent = names.length ? "Now explaining: " + names.join(", ") : "";
  }

  /* ---------- Pressure pulses ---------- */

  const ROUTES = window.SimCommon.routes();
  const pulses = window.PressurePulses($("simDots"), ROUTES, { spacing: SPACING, fade: FADE });

  /* ---------- Scenario engine ---------- */

  const reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return Boolean(reduceQuery && reduceQuery.matches); }

  let scn = 0;           // current scenario
  let stepIdx = -1;      // -1 = not started
  let p = 0;             // scenario progress, 0 to 1
  let motion = null;     // { from, to, secs, t } while a step's motion is playing
  let paused = false;
  let answered = false;
  let flowDist = 0;
  let frame = 0, last = 0;

  function ground() { return Number(groundEl.value); }
  function current() { return SCENARIOS[scn]; }
  function step() { return stepIdx >= 0 ? current().steps[stepIdx] : null; }
  function flowIds() { const s = step(); return s && s.flow ? s.flow : []; }
  function animating() { return !reduced() && (motion !== null || flowIds().length > 0); }

  function showState() {
    const s = current().state(p, ground());
    turn("needleAsi", GAUGES.asi, ASI_DEG(s.ias));
    turn("needleAlt", GAUGES.alt, ALT_DEG(s.alt));
    turn("needleVsi", GAUGES.vsi, VSI_DEG(s.vs));
    $("valAsi").textContent = fmt(s.ias) + " kt";
    $("valAlt").textContent = fmt(Math.round(s.alt / 10) * 10) + " ft";
    $("valVsi").textContent = signed(s.vs) + " ft/min";
    // Air only moves past the pitot tube when the aircraft is moving
    const airflow = s.ias > 1 ? Math.min(1, 0.3 + s.ias / 250) : 0;
    $("simAir").setAttribute("opacity", airflow.toFixed(2));
    $("simAirLabel").textContent = airflow ? "Airflow" : "No airflow";
    return s;
  }

  function showPulses() {
    pulses.draw(flowIds(), reduced() ? SPACING * 0.45 : flowDist);
  }

  function announce(s) {
    summaryEl.textContent = "Airspeed " + fmt(s.ias) + " knots. Altitude " + fmt(Math.round(s.alt / 10) * 10) +
      " feet. Vertical speed " + signed(s.vs) + " feet per minute.";
  }

  function updateControls() {
    const s = step();
    const total = current().steps.length;
    const canPause = animating() && !paused;
    startBtn.disabled = stepIdx !== -1;
    pauseBtn.disabled = !canPause;
    resumeBtn.disabled = reduced() || !paused;
    restartBtn.disabled = stepIdx === -1;
    nextBtn.disabled = stepIdx === -1 || stepIdx >= total - 1 || Boolean(s && s.q && !answered);
    let text;
    if (stepIdx === -1) text = "Press Start";
    else if (paused) text = "Paused";
    else if (motion) text = "Running";
    else if (s.q && !answered) text = "Choose an answer, then press Next Step";
    else if (stepIdx >= total - 1) text = "Scenario complete";
    else text = "Press Next Step";
    if (reduced()) text = "Motion is off (reduced-motion setting). Each step jumps straight to its result. " + text;
    stateEl.textContent = text;
  }

  function tick(now) {
    frame = 0;
    if (paused || reduced()) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    let finished = false;
    if (motion) {
      motion.t += dt;
      const k = Math.min(1, motion.t / motion.secs);
      p = motion.from + (motion.to - motion.from) * k;
      if (k >= 1) { motion = null; finished = true; }
    }
    if (flowIds().length) flowDist += FLOW_SPEED * dt;
    const s = showState();
    showPulses();
    if (finished) { announce(s); updateControls(); }
    if (animating()) frame = requestAnimationFrame(tick);
  }

  function kick() {
    if (frame || paused || reduced() || !animating()) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function stopLoop() { cancelAnimationFrame(frame); frame = 0; }

  function clearQuestion() {
    questionEl.hidden = true;
    optionsEl.textContent = "";
    feedbackEl.textContent = "";
    feedbackEl.className = "g-feedback";
  }

  function buildQuestion(q) {
    promptEl.textContent = q.prompt;
    optionsEl.textContent = "";
    feedbackEl.textContent = "";
    feedbackEl.className = "g-feedback";
    q.options.forEach(function (opt) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = opt.label;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        Array.from(optionsEl.children).forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        answered = true;
        feedbackEl.textContent = opt.feedback;
        feedbackEl.className = "g-feedback " + (opt.correct ? "good" : "try");
        updateControls();
      });
      optionsEl.appendChild(b);
    });
    questionEl.hidden = false;
  }

  function goStep(i) {
    if (motion) { p = motion.to; motion = null; }   // skip the rest of any motion
    stepIdx = i;
    paused = false;
    answered = false;
    flowDist = 0;
    const s = step();
    const total = current().steps.length;
    countEl.textContent = "Step " + (i + 1) + " of " + total;
    instructionEl.textContent = s.text;
    highlight(s.hl || []);
    clearQuestion();
    if (s.q) buildQuestion(s.q);
    doneEl.hidden = i < total - 1;
    if (s.motion) {
      if (reduced()) p = s.motion.to;
      else { p = s.motion.from; motion = { from: s.motion.from, to: s.motion.to, secs: s.motion.secs, t: 0 }; }
    }
    announce(showState());
    showPulses();
    updateControls();
    kick();
  }

  function loadScenario(i) {
    stopLoop();
    scn = i;
    stepIdx = -1;
    p = 0;
    motion = null;
    paused = false;
    answered = false;
    flowDist = 0;
    tabs.forEach(function (t, k) { t.setAttribute("aria-pressed", String(k === i)); });
    $("gTitle").textContent = current().title;
    countEl.textContent = "Not started";
    instructionEl.textContent = "Goal: " + current().goal + " Press Start to begin.";
    clearQuestion();
    doneEl.hidden = true;
    highlight([]);
    announce(showState());
    showPulses();
    updateControls();
  }

  tabs.forEach(function (t, i) {
    t.textContent = SCENARIOS[i].tab;
    t.addEventListener("click", function () { loadScenario(i); });
  });
  startBtn.addEventListener("click", function () { if (stepIdx === -1) goStep(0); });
  nextBtn.addEventListener("click", function () {
    if (!nextBtn.disabled) goStep(stepIdx + 1);
  });
  pauseBtn.addEventListener("click", function () {
    paused = true;
    stopLoop();
    updateControls();
  });
  resumeBtn.addEventListener("click", function () {
    paused = false;
    updateControls();
    kick();
  });
  restartBtn.addEventListener("click", function () {
    loadScenario(scn);
    goStep(0);
  });
  groundEl.addEventListener("change", function () {
    // Stationary scenario has no motion, so just refresh it. Others start again.
    if (scn === 0 && stepIdx !== -1) announce(showState());
    else loadScenario(scn);
  });

  // Pause when the section is hidden, and react to the reduced-motion setting
  const section = root.closest(".step");
  if (section && window.MutationObserver) {
    new MutationObserver(function () {
      if (section.hidden && animating() && !paused) { paused = true; stopLoop(); updateControls(); }
    }).observe(section, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (reduceQuery) {
    const onChange = function () {
      stopLoop();
      if (reduced() && motion) { p = motion.to; motion = null; }
      paused = false;
      announce(showState());
      showPulses();
      updateControls();
      kick();
    };
    if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", onChange);
    else if (reduceQuery.addListener) reduceQuery.addListener(onChange);
  }

  buildDials();
  loadScenario(0);
})();
