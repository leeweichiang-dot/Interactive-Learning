/*
 * Landing Gear Systems: three sections shown as tabs.
 *   1. Components: clickable labelled diagram + a 3-question check.
 *   2. Hydraulics: animated fluid flow for GEAR DOWN / GEAR UP.
 *   3. Indication: cockpit gear lights and handle.
 * A section counts as complete when the trainee has done its activity.
 * When all three are complete the item is marked done in the tracker.
 */
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= Progress and tabs ================= */

  const sectionDone = { 1: false, 2: false, 3: false };
  let trackerCompleted = false;

  function completeSection(n) {
    if (sectionDone[n]) return;
    sectionDone[n] = true;
    renderProgress();
  }

  function renderProgress() {
    const count = Object.values(sectionDone).filter(Boolean).length;
    $("progress-count").textContent = count + " of 3";
    $("progress-bar").setAttribute("aria-valuenow", String(count));
    document.querySelectorAll(".progress-seg").forEach((seg) => {
      seg.classList.toggle("done", sectionDone[seg.dataset.seg]);
    });
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("done", !!sectionDone[tab.dataset.tab]);
    });

    const status = $("summary-status");
    if (count === 3) {
      status.textContent = "All three sections complete. Well done! Keep these key points in mind.";
      if (!trackerCompleted && window.Tracker) window.Tracker.complete();
      trackerCompleted = true;
    } else {
      const left = [1, 2, 3].filter((n) => !sectionDone[n]).map((n) => "Section " + n).join(", ");
      status.textContent = count + " of 3 sections complete. Still to do: " + left + ".";
    }
  }

  const tabs = Array.from(document.querySelectorAll(".tab"));

  function showTab(n) {
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === String(n);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      $("sec-" + tab.dataset.tab).hidden = !on;
    });
    window.scrollTo(0, 0);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => showTab(tab.dataset.tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      showTab(next.dataset.tab);
    });
  });
  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.dataset.goto));
  });

  /* ================= Section 1: components ================= */

  const PARTS = [
    {
      id: "oleo", label: "Oleo strut", name: "Shock Absorber (Oleo Strut)",
      where: "Every gear leg has one: the nose gear and both main gears.",
      what: "The main leg of the landing gear, with a built-in shock absorber. Inside are oil and compressed gas (usually nitrogen). On landing, the lower tube (the shiny piston) slides up into the upper tube. The oil is forced through a small hole, which slows the movement, and the gas acts like a spring.",
      why: "Landing is a hard bump. Without the oleo strut that shock would go straight into the aircraft's structure and the pilot. It also smooths out bumps when the aircraft moves on the ground.",
      like: "the suspension on a car or a mountain bike's front fork."
    },
    {
      id: "drag", label: "Drag brace", name: "Drag Brace",
      where: "Shown on the nose gear window, because you see it best from the side. The main gears have one too.",
      what: "A strong diagonal bar that holds the gear leg against forces from the front and back. It usually has a hinge in the middle so it can fold when the gear retracts, and it locks straight when the gear is down.",
      why: "When the wheels hit the runway and the brakes are used, huge forces try to push the leg backwards. The drag brace stops the leg from folding over.",
      like: "a prop leaning against a fence to stop it falling over."
    },
    {
      id: "side", label: "Side brace", name: "Side Brace",
      where: "Shown on the main gear window, because you see it best from the front.",
      what: "A bar that holds the gear leg against sideways forces. Like the drag brace, it often folds in the middle for retraction and has a lock that holds it straight when the gear is down.",
      why: "Turning on the ground or landing in a crosswind pushes the wheels sideways. The side brace keeps the leg upright so it doesn't collapse to the side.",
      like: "the diagonal bar that stops a bookshelf wobbling sideways."
    },
    {
      id: "torque", label: "Torque links", name: "Torque Links",
      where: "On the nose gear and both main gears, joining the upper and lower parts of the strut.",
      what: "Two short arms joined by a hinge, like a pair of scissors or a knee. They connect the upper part of the strut to the lower piston, letting the piston slide up and down but stopping it from twisting round.",
      why: "Without them the lower part of the strut could rotate freely and the wheels would point the wrong way. On the nose gear they also pass the steering movement down to the wheels.",
      like: "your knee: it bends forward and back but doesn't twist sideways."
    },
    {
      id: "wheel", label: "Wheel & tyre", name: "Wheels and Tyres",
      where: "The nose gear has a smaller wheel that steers. The main gears have bigger wheels with the brakes inside.",
      what: "The wheels carry the aircraft's full weight on the ground. The tyres grip the runway for braking and steering. Aircraft tyres are filled with nitrogen gas instead of air.",
      why: "Tyres take a huge load every landing. Wrong pressure, cuts or worn tread can cause a burst tyre on landing, so they are checked often. Nitrogen is used because it doesn't help a fire burn and its pressure changes less with temperature.",
      like: "car tyres, but built to carry many tonnes and land at high speed."
    },
    {
      id: "door", label: "Wheel well door", name: "Wheel Well Door",
      where: "Over each wheel well: one set for the nose gear and one for each main gear.",
      what: "A panel that covers the wheel well (the space in the aircraft where the gear is stored when it is up). It opens to let the gear move and closes again afterwards.",
      why: "A closed door makes the underside smooth, which cuts drag (air resistance) and noise. If a door doesn't open properly the gear could hit it; if it doesn't close, the aircraft uses more fuel.",
      like: "a garage door that opens for the car and closes behind it."
    },
    {
      id: "actuator", label: "Actuating cylinder", name: "Actuating Cylinder",
      where: "Each gear leg has its own, fixed between the aircraft's structure and the leg.",
      what: "The 'muscle' that moves the gear. It is a tube with a piston and rod inside. Hydraulic fluid pushed into one end slides the rod out; fluid pushed into the other end pulls the rod back in. This swings the gear leg down or up.",
      why: "Landing gear is very heavy, far too heavy to move by hand. The actuating cylinder uses hydraulic pressure to raise and lower it smoothly. You'll see it working in Section 2.",
      like: "the arm of an excavator digger, which is also moved by hydraulic cylinders."
    }
  ];

  // Labels on each close-up window. x, y: top-left of the label; ax, ay: the point it points at.
  const WINDOW_LABELS = {
    nose: [
      { id: "door", x: 250, y: 6, ax: 381, ay: 130 },
      { id: "actuator", x: 8, y: 168, ax: 105, ay: 111 },
      { id: "drag", x: 262, y: 190, ax: 245, ay: 166 },
      { id: "oleo", x: 262, y: 235, ax: 224, ay: 225 },
      { id: "torque", x: 8, y: 240, ax: 166, ay: 255 },
      { id: "wheel", x: 8, y: 345, ax: 172, ay: 365 }
    ],
    main: [
      { id: "door", x: 250, y: 6, ax: 401, ay: 140 },
      { id: "side", x: 8, y: 190, ax: 110, ay: 133 },
      { id: "actuator", x: 224, y: 205, ax: 275, ay: 113 },
      { id: "oleo", x: 8, y: 240, ax: 186, ay: 215 },
      { id: "torque", x: 262, y: 250, ax: 238, ay: 260 },
      { id: "wheel", x: 268, y: 350, ax: 252, ay: 345 }
    ]
  };

  // Labels on the fighter pictures, which jump to a close-up window.
  const LOCATE_LABELS = [
    { layer: "jet-side-labels", gear: "nose", text: "Nose landing gear", x: 104, y: 302, ax: 190, ay: 282 },
    { layer: "jet-side-labels", gear: "main", text: "Main landing gear", x: 434, y: 302, ax: 520, ay: 288 },
    { layer: "jet-top-labels", gear: "nose", text: "Nose gear", x: -300, y: 236, ax: -178, ay: 191 },
    { layer: "jet-top-labels", gear: "main", text: "Left main", x: -302, y: 572, ax: -212, ay: 550 },
    { layer: "jet-top-labels", gear: "main", text: "Right main", x: -156, y: 572, ax: -118, ay: 550 }
  ];

  const seen = new Set();
  const chipsBox = $("parts-list");

  function svgEl(tag, attrs, parent) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(node);
    return node;
  }

  function onActivate(node, fn) {
    node.addEventListener("click", fn);
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); }
    });
  }

  // Draws a clickable pill label with a dashed leader line to (ax, ay).
  // Leaders go in their own layer underneath, so no line crosses a label.
  function addPill(layer, spec) {
    let leaders = layer.querySelector(".leaders");
    if (!leaders) leaders = svgEl("g", { class: "leaders" }, layer);
    const h = spec.h || 30;
    const leader = svgEl("line", { x1: spec.x, y1: spec.y + h / 2, x2: spec.ax, y2: spec.ay, class: "leader" }, leaders);
    svgEl("circle", { cx: spec.ax, cy: spec.ay, r: 3.5, class: "leader-dot" }, leaders);

    const g = svgEl("g", { class: "label-pill" + (spec.cls ? " " + spec.cls : ""), tabindex: "0", role: "button", "aria-label": spec.aria }, layer);
    const rect = svgEl("rect", { x: spec.x, y: spec.y, width: 0, height: h, rx: h / 2 }, g);
    let textX = spec.x + 14;
    if (spec.num) {
      svgEl("circle", { cx: spec.x + 15, cy: spec.y + h / 2, r: 10, class: "num" }, g);
      const num = svgEl("text", { x: spec.x + 15, y: spec.y + h / 2 + 4.5, "text-anchor": "middle", class: "num-text" }, g);
      num.textContent = String(spec.num);
      textX = spec.x + 30;
    }
    const t = svgEl("text", { x: textX, y: spec.y + h / 2 + 5, class: "pill-text" }, g);
    t.textContent = spec.text;
    // Size the pill to its text (falls back to an estimate if the SVG isn't laid out yet).
    const w = (textX - spec.x) + 12 + (t.getComputedTextLength() || spec.text.length * 9);
    rect.setAttribute("width", w);
    leader.setAttribute("x1", spec.x + w / 2);
    onActivate(g, spec.onSelect);
    return g;
  }

  Object.keys(WINDOW_LABELS).forEach((win) => {
    const layer = document.querySelector('.gear-labels[data-window="' + win + '"]');
    WINDOW_LABELS[win].forEach((spot) => {
      const index = PARTS.findIndex((p) => p.id === spot.id);
      const part = PARTS[index];
      const g = addPill(layer, {
        x: spot.x, y: spot.y, ax: spot.ax, ay: spot.ay, num: index + 1,
        text: part.label, aria: part.name, onSelect: () => selectPart(part.id)
      });
      g.dataset.label = part.id;
    });
  });

  PARTS.forEach((part, i) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "part-chip";
    chip.dataset.chip = part.id;
    chip.textContent = (i + 1) + ". " + part.name;
    chip.addEventListener("click", () => selectPart(part.id));
    chipsBox.appendChild(chip);
  });

  document.querySelectorAll(".gear-svg [data-part]").forEach((node) => {
    node.addEventListener("click", () => selectPart(node.dataset.part));
  });

  /* ----- Fighter location pictures ----- */

  function goToGear(which) {
    const win = $("win-" + which);
    win.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    win.classList.remove("flash");
    void win.offsetWidth; // restart the flash animation
    win.classList.add("flash");
  }

  LOCATE_LABELS.forEach((spot) => {
    const name = spot.gear === "nose" ? "Nose landing gear" : "Main landing gear";
    addPill($(spot.layer), {
      x: spot.x, y: spot.y, ax: spot.ax, ay: spot.ay, text: spot.text,
      h: spot.layer === "jet-top-labels" ? 36 : 32, cls: "locate-pill",
      aria: spot.text + ": show the " + name.toLowerCase() + " close-up",
      onSelect: () => goToGear(spot.gear)
    });
  });
  document.querySelectorAll("[data-goto-gear]").forEach((node) => {
    node.addEventListener("click", () => goToGear(node.dataset.gotoGear));
  });

  function selectPart(id) {
    const part = PARTS.find((p) => p.id === id);
    if (!part) return;
    seen.add(id);

    document.querySelectorAll(".gear-svg [data-part]").forEach((node) => {
      node.classList.toggle("hl", node.dataset.part === id);
    });
    document.querySelectorAll(".label-pill[data-label]").forEach((node) => {
      node.classList.toggle("active", node.dataset.label === id);
      node.classList.toggle("seen", seen.has(node.dataset.label));
    });
    document.querySelectorAll(".part-chip").forEach((node) => {
      node.classList.toggle("active", node.dataset.chip === id);
      node.classList.toggle("seen", seen.has(node.dataset.chip));
    });

    $("info-empty").hidden = true;
    $("info-body").hidden = false;
    $("info-title").textContent = part.name;
    $("info-where").textContent = part.where;
    $("info-what").textContent = part.what;
    $("info-why").textContent = part.why;
    $("info-like").textContent = part.like;
    $("explored-count").textContent = String(seen.size);
    $("explored-count-2").textContent = String(seen.size);

    const panel = $("info-panel");
    panel.classList.remove("flash");
    void panel.offsetWidth; // restart the flash animation
    panel.classList.add("flash");

    // The panel sits below both windows: bring it into view if it's off screen.
    const box = panel.getBoundingClientRect();
    if (box.top > window.innerHeight - 120 || box.bottom < 0) {
      panel.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  /* ----- Section 1 quiz ----- */

  const QUESTIONS = [
    {
      q: "Which part absorbs the shock when the aircraft lands?",
      topic: "Oleo strut",
      options: ["Torque links", "Oleo strut", "Wheel well door", "Side brace"],
      answer: 1,
      explain: "The oleo strut uses oil and compressed gas to cushion the landing, like a car's suspension."
    },
    {
      q: "What do the torque links do?",
      topic: "Torque links",
      options: [
        "Pump hydraulic fluid to the gear",
        "Stop the strut's piston twisting, so the wheels stay lined up",
        "Cover the wheel well in flight",
        "Keep the tyres inflated"
      ],
      answer: 1,
      explain: "The torque links let the piston slide up and down but stop it rotating, so the wheels keep pointing the right way."
    },
    {
      q: "Which part uses hydraulic pressure to move the landing gear up and down?",
      topic: "Actuating cylinder",
      options: ["Drag brace", "Oleo strut", "Actuating cylinder", "Wheel well door"],
      answer: 2,
      explain: "Hydraulic fluid pushes the piston inside the actuating cylinder, and its rod moves the gear leg."
    }
  ];

  let quizAnswers = [];

  function renderQuiz() {
    quizAnswers = new Array(QUESTIONS.length).fill(null);
    const box = $("quiz");
    box.textContent = "";
    $("quiz-result").hidden = true;

    QUESTIONS.forEach((question, qi) => {
      const wrap = document.createElement("div");
      wrap.className = "question";
      const p = document.createElement("p");
      p.className = "question-text";
      p.textContent = (qi + 1) + ". " + question.q;
      wrap.appendChild(p);

      const opts = document.createElement("div");
      opts.className = "options";
      const feedback = document.createElement("p");
      feedback.className = "feedback";
      feedback.setAttribute("aria-live", "polite");

      question.options.forEach((text, oi) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "option";
        b.textContent = text;
        b.addEventListener("click", () => {
          const correct = oi === question.answer;
          quizAnswers[qi] = correct;
          opts.querySelectorAll(".option").forEach((o, k) => {
            o.disabled = true;
            if (k === question.answer) o.classList.add("correct");
          });
          if (!correct) b.classList.add("wrong");
          feedback.className = "feedback " + (correct ? "good" : "bad");
          feedback.textContent = (correct ? "Correct. " : "Not quite. ") + question.explain;
          checkQuizDone();
        });
        opts.appendChild(b);
      });

      wrap.appendChild(opts);
      wrap.appendChild(feedback);
      box.appendChild(wrap);
    });
  }

  function checkQuizDone() {
    if (quizAnswers.some((a) => a === null)) return;
    const score = quizAnswers.filter(Boolean).length;
    const total = QUESTIONS.length;
    $("quiz-score").textContent = "You scored " + score + " out of " + total + ". " +
      (score === total ? "Excellent: Section 1 complete!" : "Section 1 complete. Explore the parts again and retry to improve your score.");
    $("quiz-result").hidden = false;

    if (window.Tracker) {
      window.Tracker.quizResult(score, total, QUESTIONS.map((question, i) => ({
        q: "Gear parts: " + question.q,
        topic: question.topic,
        correct: quizAnswers[i]
      })));
    }
    completeSection(1);
  }

  $("quiz-retry").addEventListener("click", renderQuiz);
  renderQuiz();

  /* ================= Section 2: hydraulics ================= */

  const PISTON_TRAVEL = 100; // SVG units the piston moves between gear UP and gear DOWN
  const STAGE_MS = 2300;
  const hyd = { pos: "up", running: false, done: { down: false, up: false }, offset: 0 };
  const pipes = ["pipe-supply", "pipe-pressure", "pipe-a", "pipe-b", "pipe-return",
    "pass-down-p", "pass-down-r", "pass-up-p", "pass-up-r"].map($);

  function stageText(dir) {
    const down = dir === "down";
    return [
      {
        title: "The reservoir supplies the fluid",
        text: "The reservoir is a storage tank for hydraulic fluid. It keeps the pump supplied so it never runs dry, and has room for the fluid that comes back."
      },
      {
        title: "The pump puts the fluid under pressure",
        text: "The pump (driven by an engine or an electric motor) pushes the fluid out at high pressure, often around 3,000 psi: roughly 100 times the pressure in a car tyre. That pressure does the heavy lifting."
      },
      {
        title: "The selector valve chooses the direction: GEAR " + (down ? "DOWN" : "UP"),
        text: down
          ? "The gear handle was moved to DOWN. The selector valve works like a railway points switch: it sends the pressure (blue) to the \"down\" side of the actuating cylinder, and connects the other side to the return line."
          : "The gear handle was moved to UP. The selector valve switches its paths over: pressure (blue) now goes to the \"up\" side of the actuating cylinder, and the \"down\" side is connected to the return line."
      },
      {
        title: down ? "The actuating cylinder extends" : "The actuating cylinder retracts",
        text: down
          ? "Fluid under pressure pushes the piston. The rod slides out and pushes the gear leg down until it locks in place. At the same time, fluid on the other side of the piston is squeezed out (red)."
          : "Fluid under pressure pushes the piston the other way. The rod slides in and pulls the gear leg up into the wheel well, where it locks. Fluid on the \"down\" side is squeezed out (red)."
      },
      {
        title: "Fluid returns to the reservoir",
        text: "The squeezed-out fluid flows back along the return line (red) into the reservoir, ready to be used again. The fluid goes round and round in a closed loop and is never used up."
      }
    ];
  }

  function renderStages(dir) {
    const list = $("stages");
    list.textContent = "";
    stageText(dir).forEach((s) => {
      const li = document.createElement("li");
      li.className = "stage";
      const h = document.createElement("h3");
      h.textContent = s.title;
      const p = document.createElement("p");
      p.textContent = s.text;
      li.append(h, p);
      list.appendChild(li);
    });
  }

  function setPipe(pipe, kind, reverse) {
    pipe.classList.remove("pressure", "return", "rev");
    if (kind) pipe.classList.add(kind);
    if (reverse) pipe.classList.add("rev");
  }

  function resetFlow() {
    pipes.forEach((p) => setPipe(p, null));
    $("valve-down").setAttribute("opacity", "0");
    $("valve-up").setAttribute("opacity", "0");
    $("impeller").classList.remove("spin");
    $("hyd-svg").classList.remove("still");
    document.querySelectorAll("#hyd-svg .focus").forEach((n) => n.classList.remove("focus"));
  }

  function focusStage(n) {
    document.querySelectorAll("#hyd-svg .focus").forEach((node) => node.classList.remove("focus"));
    const target = document.querySelector('#hyd-svg [data-stage="' + n + '"]') ||
      document.querySelector('#hyd-svg [data-stage-label="' + n + '"]');
    if (target) target.classList.add("focus");
    document.querySelectorAll("#stages .stage").forEach((li, i) => {
      li.classList.toggle("current", i === n - 1);
      li.classList.toggle("done", i < n - 1);
    });
  }

  function setPiston(offset) {
    hyd.offset = offset;
    $("piston-group").setAttribute("transform", "translate(" + offset.toFixed(1) + " 0)");
  }

  function movePiston(to, ms) {
    return new Promise((resolve) => {
      const from = hyd.offset;
      if (reduceMotion) { setPiston(to); resolve(); return; }
      const start = performance.now();
      function frame(now) {
        const t = Math.min(1, (now - start) / ms);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setPiston(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function runHydraulics(dir) {
    if (hyd.running) return;
    if (hyd.pos === dir) {
      $("hyd-status").textContent = "The gear is already " + dir.toUpperCase() + ". Press GEAR " +
        (dir === "down" ? "UP" : "DOWN") + " to move it the other way.";
      return;
    }
    const down = dir === "down";
    hyd.running = true;
    $("hyd-down").disabled = true;
    $("hyd-up").disabled = true;
    resetFlow();
    renderStages(dir);
    $("valve-text").textContent = "NEUTRAL";
    $("mini-gear-text").textContent = "GEAR MOVING";

    // 1. Reservoir feeds the pump
    focusStage(1);
    $("hyd-status").textContent = "Stage 1 of 5: fluid leaves the reservoir.";
    setPipe($("pipe-supply"), "pressure");
    await wait(STAGE_MS);

    // 2. Pump pressurises
    focusStage(2);
    $("hyd-status").textContent = "Stage 2 of 5: the pump pressurises the fluid.";
    $("impeller").classList.add("spin");
    setPipe($("pipe-pressure"), "pressure");
    await wait(STAGE_MS);

    // 3. Selector valve routes pressure
    focusStage(3);
    $("hyd-status").textContent = "Stage 3 of 5: selector valve set to GEAR " + dir.toUpperCase() + ".";
    $("valve-text").textContent = down ? "DOWN" : "UP";
    $(down ? "valve-down" : "valve-up").setAttribute("opacity", "1");
    setPipe($(down ? "pass-down-p" : "pass-up-p"), "pressure");
    setPipe($(down ? "pipe-a" : "pipe-b"), "pressure");
    await wait(STAGE_MS);

    // 4. Actuator moves; the other side is pushed out at the same time
    focusStage(4);
    $("hyd-status").textContent = "Stage 4 of 5: the actuating cylinder " + (down ? "extends" : "retracts") + ".";
    setPipe($(down ? "pipe-b" : "pipe-a"), "return", true);
    setPipe($(down ? "pass-down-r" : "pass-up-r"), "return");
    setPipe($("pipe-return"), "return");
    await movePiston(down ? PISTON_TRAVEL : 0, STAGE_MS);

    // 5. Return to reservoir
    focusStage(5);
    $("hyd-status").textContent = "Stage 5 of 5: fluid returns to the reservoir.";
    await wait(STAGE_MS);

    document.querySelectorAll("#stages .stage").forEach((li) => {
      li.classList.remove("current");
      li.classList.add("done");
    });
    document.querySelectorAll("#hyd-svg .focus").forEach((n) => n.classList.remove("focus"));
    $("hyd-svg").classList.add("still");
    $("impeller").classList.remove("spin");
    hyd.pos = dir;
    hyd.done[dir] = true;
    $("mini-gear-text").textContent = down ? "GEAR DOWN" : "GEAR UP";
    $("hyd-status").textContent = "Done: gear " + (down ? "DOWN" : "UP") +
      " and locked. The piston has reached the end of its travel, so the fluid stops moving.";
    hyd.running = false;
    $("hyd-down").disabled = false;
    $("hyd-up").disabled = false;

    if (hyd.done.down && hyd.done.up) {
      completeSection(2);
    } else {
      $("hyd-status").textContent += " Now try GEAR " + (down ? "UP" : "DOWN") + " to complete this section.";
    }
  }

  $("hyd-down").addEventListener("click", () => runHydraulics("down"));
  $("hyd-up").addEventListener("click", () => runHydraulics("up"));
  renderStages("down");
  setPiston(0);

  /* ================= Section 3: indication ================= */

  const ind = { pos: "up", busy: false, done: { down: false, up: false }, timers: [] };
  const lamps = { red: $("lamp-red"), nose: $("lamp-nose"), left: $("lamp-left"), right: $("lamp-right") };

  const IND_STATES = {
    up: { label: "UP AND LOCKED", cls: "", row: "up",
      text: "All lights off with the handle UP: the gear is tucked away and locked. Normal for flight." },
    transitDown: { label: "IN TRANSIT", cls: "bad", row: "transit",
      text: "Red light on: the gear is moving down. Each green comes on as its leg locks. Wait for all three." },
    transitUp: { label: "IN TRANSIT", cls: "bad", row: "transit",
      text: "Red light on: the gear is moving up into the wheel wells. Wait for the light to go out." },
    down: { label: "DOWN AND LOCKED", cls: "ok", row: "down",
      text: "Three greens and no red: all three legs are down and locked. Safe to land." },
    fault: { label: "UNSAFE: LEFT MAIN", cls: "bad", row: "unsafe",
      text: "Only two greens and the red stays on: the left main gear has not locked. Do NOT land. Try GEAR UP then GEAR DOWN again (recycle), and follow the checklist." },
    test: { label: "LAMP TEST", cls: "", row: null,
      text: "Every light is switched on to prove no bulb has failed. A blown bulb could hide a warning." }
  };

  function setLamps(state) {
    Object.keys(lamps).forEach((k) => lamps[k].classList.toggle("on", !!state[k]));
  }

  function showIndState(key) {
    const s = IND_STATES[key];
    const value = $("ind-state");
    value.textContent = s.label;
    value.className = "readout-value " + s.cls;
    $("ind-explain").textContent = s.text;
    document.querySelectorAll(".lights-table tbody tr").forEach((tr) => {
      tr.classList.toggle("match", tr.dataset.row === s.row);
    });
  }

  function setHandle(down) {
    $("handle").classList.toggle("down", down);
    $("handle-btn").setAttribute("aria-label", "Gear handle, now " + (down ? "DOWN" : "UP") + ": click to move it");
  }

  function setIndButtons(disabled) {
    ["ind-down", "ind-up", "ind-fault", "ind-test"].forEach((id) => { $(id).disabled = disabled; });
  }

  function later(ms, fn) { ind.timers.push(setTimeout(fn, ms)); }

  function startSequence() {
    ind.busy = true;
    setIndButtons(true);
  }

  function endSequence() {
    ind.busy = false;
    ind.timers = [];
    setIndButtons(false);
    updateIndProgress();
  }

  function gearDown(withFault) {
    if (ind.busy) return;
    if (ind.pos === "down" && !withFault) {
      $("ind-explain").textContent = "The gear is already down and locked (three greens). Press GEAR UP to raise it.";
      return;
    }
    startSequence();
    setHandle(true);
    setLamps({ red: true });
    showIndState("transitDown");
    later(1600, () => setLamps({ red: true, nose: true }));
    later(2300, () => setLamps({ red: true, nose: true, right: true }));
    if (withFault) {
      later(3600, () => {
        ind.pos = "fault";
        showIndState("fault");
        endSequence();
      });
    } else {
      later(2900, () => {
        setLamps({ nose: true, left: true, right: true });
        ind.pos = "down";
        ind.done.down = true;
        showIndState("down");
        endSequence();
      });
    }
  }

  function gearUp() {
    if (ind.busy) return;
    if (ind.pos === "up") {
      $("ind-explain").textContent = "The gear is already up and locked (all lights off). Press GEAR DOWN to lower it.";
      return;
    }
    startSequence();
    setHandle(false);
    setLamps({ red: true });
    showIndState("transitUp");
    later(3000, () => {
      setLamps({});
      ind.pos = "up";
      ind.done.up = true;
      showIndState("up");
      endSequence();
    });
  }

  function lampTest() {
    if (ind.busy) return;
    startSequence();
    const before = ind.pos;
    setLamps({ red: true, nose: true, left: true, right: true });
    showIndState("test");
    later(1800, () => {
      if (before === "down") { setLamps({ nose: true, left: true, right: true }); showIndState("down"); }
      else if (before === "fault") { setLamps({ red: true, nose: true, right: true }); showIndState("fault"); }
      else { setLamps({}); showIndState("up"); }
      endSequence();
    });
  }

  function updateIndProgress() {
    const d = ind.done;
    const msg = $("ind-progress");
    if (d.down && d.up) {
      msg.textContent = "Section 3 complete. Try \"Simulate a fault\" to see an unsafe indication.";
      completeSection(3);
    } else if (d.down) {
      msg.textContent = "Good. Now run GEAR UP to finish this section.";
    } else if (d.up) {
      msg.textContent = "Good. Now run GEAR DOWN to finish this section.";
    }
  }

  $("ind-down").addEventListener("click", () => gearDown(false));
  $("ind-up").addEventListener("click", gearUp);
  $("ind-fault").addEventListener("click", () => {
    if (ind.busy) return;
    if (ind.pos !== "up") {
      $("ind-explain").textContent = "Raise the gear first (GEAR UP), then simulate the fault on the way down.";
      return;
    }
    gearDown(true);
  });
  $("ind-test").addEventListener("click", lampTest);

  const handleBtn = $("handle-btn");
  function toggleHandle() {
    if (ind.pos === "up") gearDown(false); else gearUp();
  }
  handleBtn.addEventListener("click", toggleHandle);
  handleBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleHandle(); }
  });

  setHandle(false);
  showIndState("up");

  /* ================= Start ================= */
  renderProgress();
  showTab(1);
})();
