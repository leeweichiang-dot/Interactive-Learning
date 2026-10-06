/*
 * Landing Gear Systems: three sections shown as tabs.
 *   1. Components: where the gear is on a fighter, nose and main gear close-ups with
 *      clickable parts and cut-away pictures, and a 3-question check.
 *   2. Hydraulics: the whole gear hydraulic system, animated for GEAR DOWN / GEAR UP,
 *      with three actuating cylinders moving the gear legs.
 *   3. Indication: cockpit gear lights and handle, the gear moving on the aircraft,
 *      and six faults to practise on.
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
      where: "Every gear leg has one.",
      what: "This is the leg's shock absorber. Inside it are oil and gas. When the wheels hit the ground, the inner tube (the piston) is pushed up. The oil has to squeeze through a small hole, which slows the push down. The gas squashes like a spring, then pushes back.",
      why: "Landings are bumpy. The oleo strut soaks up the bump, so it doesn't damage the aircraft or hurt the pilot.",
      like: "the springs and shock absorbers on a car or a bike.",
      caption: "Cut in half: gas on top, oil below, and a small hole between them."
    },
    {
      id: "drag", label: "Drag brace", name: "Drag Brace",
      where: "Shown in the nose gear window, where you see it from the side. The main gears have one too.",
      what: "A strong bar that runs at an angle from the leg up to the aircraft. It stops the leg being pushed backwards or forwards. It has a hinge in the middle so it can fold when the gear goes up. When the gear is down, a lock holds it straight.",
      why: "When the wheels touch the runway and the brakes go on, the leg gets a big push backwards. The drag brace stops the leg folding over.",
      like: "a stick propping up a fence.",
      caption: "Seen from the side: the brace takes the push from braking."
    },
    {
      id: "side", label: "Side brace", name: "Side Brace",
      where: "Shown in the main gear window, where you see it from the front.",
      what: "A bar like the drag brace, but it stops the leg moving sideways. It also folds when the gear goes up, and a lock holds it straight when the gear is down.",
      why: "Turning on the ground, or landing in a side wind, pushes the wheels sideways. The side brace keeps the leg standing straight.",
      like: "the bar that stops a shelf wobbling from side to side.",
      caption: "Seen from the front: the brace takes the sideways push."
    },
    {
      id: "torque", label: "Torque links", name: "Torque Links",
      where: "On every gear leg, joining the top part of the leg to the bottom part.",
      what: "Two short arms joined by a hinge, like a knee. They join the top part of the leg to the bottom part (the piston). The piston can still slide up and down, but it can't turn round.",
      why: "Without them the wheels could twist and point the wrong way. On the nose gear they also pass on the steering, so the wheel turns when the pilot steers.",
      like: "your knee: it bends, but it doesn't twist.",
      caption: "The links let the piston slide, but stop it twisting."
    },
    {
      id: "wheel", label: "Wheel & tyre", name: "Wheels and Tyres",
      where: "The nose gear has a smaller wheel that steers. The main gears have bigger wheels with brakes inside.",
      what: "The wheels hold the aircraft up on the ground, and the tyres grip the runway. The main wheels have brakes inside them. The tyres are filled with nitrogen gas, not normal air.",
      why: "Tyres take a big hit on every landing. If the pressure is wrong, or a tyre is cut or worn, it could burst. That's why they are checked often. Nitrogen is used because it doesn't help a fire burn, and its pressure stays steady when it gets hot or cold.",
      like: "car tyres, but much stronger.",
      caption: "Cut through the middle: tyre, wheel, brakes and axle."
    },
    {
      id: "door", label: "Wheel well door", name: "Wheel Well Door",
      where: "Over each gear bay: one set for the nose gear and one for each main gear.",
      what: "A panel that covers the space where the gear is kept in flight (the wheel well). It opens to let the gear in or out, then closes again.",
      why: "A closed door keeps the bottom of the aircraft smooth, so air flows past easily. If a door doesn't open, the gear could hit it. If it doesn't close, the aircraft burns more fuel.",
      like: "a garage door that opens for the car and shuts behind it.",
      caption: "Door shut in flight, door open when the gear is down."
    },
    {
      id: "actuator", label: "Actuating cylinder", name: "Actuating Cylinder",
      where: "Each gear leg has its own, fixed between the aircraft and the leg.",
      what: "This is the 'muscle' that moves the gear. It is a tube with a piston and a rod inside. Fluid pushed in at one end pushes the rod out. Fluid pushed in at the other end pulls the rod back in. This swings the gear down or up.",
      why: "Landing gear is very heavy, too heavy to move by hand. The actuating cylinder uses fluid pressure to move it smoothly. You'll see it working in Section 2.",
      like: "the arm of a digger, which is moved the same way.",
      caption: "Cut in half: fluid in on one side pushes the piston and rod."
    }
  ];

  // Cross-section pictures shown in the explanation panel (fixed markup, no user content).
  const FIG_DEFS =
    '<defs>' +
    '<marker id="xa-w" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#f3f6fb"/></marker>' +
    '<marker id="xa-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#3ee06b"/></marker>' +
    '<marker id="xa-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#ff4b4b"/></marker>' +
    '<marker id="xa-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#ffb627"/></marker>' +
    '</defs>';

  const FIGURES = {
    oleo:
      '<rect x="120" y="20" width="90" height="10" class="x-metal"/>' +
      '<rect x="128" y="30" width="74" height="40" class="x-gas"/>' +
      '<rect x="128" y="70" width="74" height="72" class="x-oil"/>' +
      '<rect x="144" y="100" width="42" height="105" class="x-oil"/>' +
      '<rect x="128" y="88" width="30" height="6" class="x-dark"/><rect x="172" y="88" width="30" height="6" class="x-dark"/>' +
      '<rect x="136" y="100" width="8" height="113" class="x-chrome"/><rect x="186" y="100" width="8" height="113" class="x-chrome"/>' +
      '<rect x="136" y="205" width="58" height="8" class="x-chrome"/>' +
      '<rect x="120" y="20" width="8" height="125" class="x-metal"/><rect x="202" y="20" width="8" height="125" class="x-metal"/>' +
      '<line x1="165" y1="112" x2="165" y2="80" class="x-arrow" marker-end="url(#xa-w)"/>' +
      '<text x="165" y="55" class="x-in" text-anchor="middle">GAS</text>' +
      '<text x="165" y="135" class="x-in" text-anchor="middle">OIL</text>' +
      '<line x1="95" y1="210" x2="95" y2="150" class="x-arrow amber" marker-end="url(#xa-a)"/>' +
      '<text x="10" y="172" class="x-text">Bump from</text><text x="10" y="187" class="x-text">landing</text>' +
      '<line x1="210" y1="45" x2="226" y2="45" class="x-lead"/><text x="230" y="42" class="x-head">Gas</text><text x="230" y="56" class="x-text">acts like a spring</text>' +
      '<line x1="202" y1="91" x2="226" y2="91" class="x-lead"/><text x="230" y="88" class="x-head">Small hole</text><text x="230" y="102" class="x-text">slows the oil down</text>' +
      '<line x1="194" y1="175" x2="226" y2="175" class="x-lead"/><text x="230" y="172" class="x-head">Piston</text><text x="230" y="186" class="x-text">slides up on landing</text>',
    drag:
      '<rect x="0" y="10" width="360" height="20" class="x-body"/>' +
      '<text x="10" y="50" class="x-text">&#9664; front</text>' +
      '<rect x="110" y="30" width="22" height="140" class="x-metal"/>' +
      '<circle cx="121" cy="188" r="28" class="x-tyre"/><circle cx="121" cy="188" r="10" class="x-hub"/>' +
      '<polyline points="250,30 210,88 132,122" class="x-brace hl"/>' +
      '<rect x="201" y="80" width="18" height="16" rx="3" class="x-lock"/>' +
      '<line x1="40" y1="200" x2="88" y2="200" class="x-arrow red" marker-end="url(#xa-r)"/>' +
      '<text x="10" y="226" class="x-text">Braking pushes the leg back</text>' +
      '<line x1="226" y1="88" x2="244" y2="100" class="x-lead"/><text x="248" y="104" class="x-head">Hinge + lock</text><text x="248" y="118" class="x-text">folds to go up,</text><text x="248" y="132" class="x-text">locks straight</text>' +
      '<line x1="170" y1="104" x2="186" y2="140" class="x-lead"/><text x="160" y="154" class="x-head">Drag brace</text>',
    side:
      '<rect x="0" y="10" width="360" height="20" class="x-body"/>' +
      '<rect x="169" y="30" width="22" height="140" class="x-metal"/>' +
      '<line x1="140" y1="190" x2="220" y2="190" class="x-axle"/>' +
      '<rect x="134" y="164" width="28" height="52" rx="9" class="x-tyre"/><rect x="198" y="164" width="28" height="52" rx="9" class="x-tyre"/>' +
      '<polyline points="50,30 104,86 169,122" class="x-brace hl"/>' +
      '<rect x="95" y="78" width="18" height="16" rx="3" class="x-lock"/>' +
      '<line x1="340" y1="190" x2="236" y2="190" class="x-arrow red" marker-end="url(#xa-r)"/>' +
      '<text x="244" y="164" class="x-text">Sideways push</text><text x="244" y="178" class="x-text">(turning or wind)</text>' +
      '<line x1="60" y1="64" x2="76" y2="60" class="x-lead"/><text x="8" y="62" class="x-head">Side</text><text x="8" y="76" class="x-head">brace</text>' +
      '<line x1="104" y1="96" x2="104" y2="118" class="x-lead"/><text x="70" y="132" class="x-head">Lock</text>' +
      '<text x="8" y="208" class="x-text">The brace holds</text><text x="8" y="222" class="x-text">the leg upright</text>',
    torque:
      '<rect x="140" y="10" width="60" height="100" class="x-metal"/>' +
      '<rect x="152" y="100" width="36" height="105" class="x-chrome"/>' +
      '<polyline points="200,82 248,128 188,176" class="x-link"/>' +
      '<circle cx="200" cy="82" r="5" class="x-pin"/><circle cx="248" cy="128" r="6" class="x-pin"/><circle cx="188" cy="176" r="5" class="x-pin"/>' +
      '<line x1="120" y1="120" x2="120" y2="196" class="x-arrow green" marker-start="url(#xa-g)" marker-end="url(#xa-g)"/>' +
      '<text x="8" y="150" class="x-head good">Slides up</text><text x="8" y="164" class="x-head good">and down &#10003;</text>' +
      '<path d="M146 210 Q170 228 194 210" class="x-arrow red" marker-end="url(#xa-r)"/>' +
      '<text x="210" y="208" class="x-head bad">Can&#8217;t twist</text><text x="210" y="222" class="x-head bad">round &#10007;</text>' +
      '<line x1="252" y1="128" x2="270" y2="128" class="x-lead"/><text x="274" y="125" class="x-head">Torque</text><text x="274" y="139" class="x-head">links</text>' +
      '<text x="210" y="30" class="x-text">Top of the leg</text><text x="210" y="44" class="x-text">(fixed)</text>' +
      '<text x="8" y="40" class="x-text">Piston</text><text x="8" y="54" class="x-text">(moves)</text><line x1="58" y1="48" x2="150" y2="140" class="x-lead"/>',
    wheel:
      '<rect x="110" y="10" width="140" height="56" rx="20" class="x-tyre"/><rect x="122" y="22" width="116" height="44" rx="10" class="x-n2"/>' +
      '<rect x="110" y="154" width="140" height="56" rx="20" class="x-tyre"/><rect x="122" y="154" width="116" height="44" rx="10" class="x-n2"/>' +
      '<rect x="116" y="62" width="128" height="96" rx="4" class="x-rim"/>' +
      '<rect x="140" y="74" width="6" height="72" class="x-brake-a"/><rect x="150" y="74" width="6" height="72" class="x-brake-b"/>' +
      '<rect x="160" y="74" width="6" height="72" class="x-brake-a"/><rect x="170" y="74" width="6" height="72" class="x-brake-b"/>' +
      '<rect x="180" y="74" width="6" height="72" class="x-brake-a"/><rect x="190" y="74" width="6" height="72" class="x-brake-b"/>' +
      '<rect x="200" y="74" width="6" height="72" class="x-brake-a"/><rect x="210" y="74" width="6" height="72" class="x-brake-b"/>' +
      '<rect x="60" y="104" width="250" height="12" rx="3" class="x-chrome"/>' +
      '<line x1="44" y1="22" x2="112" y2="28" class="x-lead"/><text x="8" y="26" class="x-head">Tyre</text>' +
      '<line x1="84" y1="54" x2="140" y2="46" class="x-lead"/><text x="8" y="52" class="x-head">Nitrogen</text><text x="8" y="66" class="x-text">gas inside</text>' +
      '<line x1="244" y1="70" x2="268" y2="70" class="x-lead"/><text x="272" y="74" class="x-head">Wheel</text>' +
      '<line x1="216" y1="140" x2="268" y2="150" class="x-lead"/><text x="272" y="148" class="x-head">Brakes</text><text x="272" y="162" class="x-text">(discs)</text>' +
      '<line x1="40" y1="110" x2="60" y2="110" class="x-lead"/><text x="8" y="114" class="x-head">Axle</text>',
    door:
      '<rect x="10" y="20" width="160" height="50" class="x-body"/>' +
      '<rect x="50" y="46" width="80" height="24" class="x-bay"/><circle cx="90" cy="58" r="10" class="x-tyre"/>' +
      '<rect x="50" y="70" width="80" height="6" class="x-door"/>' +
      '<line x1="20" y1="96" x2="160" y2="96" class="x-arrow" marker-end="url(#xa-w)"/>' +
      '<line x1="20" y1="112" x2="160" y2="112" class="x-arrow" marker-end="url(#xa-w)"/>' +
      '<text x="90" y="140" class="x-text" text-anchor="middle">air flows past smoothly</text>' +
      '<text x="90" y="200" class="x-head" text-anchor="middle">GEAR UP:</text><text x="90" y="214" class="x-text" text-anchor="middle">door shut</text>' +
      '<rect x="190" y="20" width="160" height="50" class="x-body"/>' +
      '<rect x="230" y="46" width="80" height="24" class="x-bay"/>' +
      '<rect x="306" y="70" width="6" height="64" class="x-door"/>' +
      '<line x1="262" y1="60" x2="262" y2="140" class="x-leg"/><circle cx="262" cy="156" r="20" class="x-tyre"/>' +
      '<text x="270" y="200" class="x-head" text-anchor="middle">GEAR DOWN:</text><text x="270" y="214" class="x-text" text-anchor="middle">door open</text>' +
      '<text x="318" y="106" class="x-head">Door</text>',
    actuator:
      '<rect x="40" y="70" width="210" height="60" rx="6" class="x-metal"/>' +
      '<rect x="46" y="76" width="94" height="48" class="x-oil"/>' +
      '<rect x="152" y="76" width="92" height="48" class="x-out"/>' +
      '<rect x="140" y="74" width="12" height="52" class="x-chrome"/>' +
      '<rect x="152" y="92" width="178" height="16" rx="3" class="x-chrome"/>' +
      '<circle cx="336" cy="100" r="9" class="x-pin"/>' +
      '<rect x="54" y="36" width="12" height="36" class="x-metal"/><rect x="228" y="36" width="12" height="36" class="x-metal"/>' +
      '<line x1="60" y1="16" x2="60" y2="62" class="x-arrow blue" marker-end="url(#xa-w)"/>' +
      '<line x1="234" y1="62" x2="234" y2="16" class="x-arrow red" marker-end="url(#xa-r)"/>' +
      '<text x="74" y="22" class="x-head">Fluid in</text>' +
      '<text x="250" y="22" class="x-head">Fluid out</text>' +
      '<line x1="70" y1="100" x2="128" y2="100" class="x-arrow" marker-end="url(#xa-w)"/>' +
      '<line x1="146" y1="130" x2="146" y2="150" class="x-lead"/><text x="146" y="164" class="x-head" text-anchor="middle">Piston</text>' +
      '<line x1="290" y1="110" x2="290" y2="132" class="x-lead"/><text x="290" y="146" class="x-head" text-anchor="middle">Rod</text>' +
      '<line x1="270" y1="176" x2="340" y2="176" class="x-arrow amber" marker-end="url(#xa-a)"/>' +
      '<text x="8" y="182" class="x-text">The rod pushes out: the gear swings down.</text>' +
      '<text x="8" y="206" class="x-text">Send the fluid to the other end and the</text>' +
      '<text x="8" y="220" class="x-text">rod pulls back in: the gear swings up.</text>'
  };

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
    $("info-fig").innerHTML = '<svg class="xsec-svg" viewBox="0 0 360 230" role="img" aria-label="' +
      part.name + ' cut-away picture">' + FIG_DEFS + FIGURES[part.id] + '</svg>';
    $("info-fig-cap").textContent = part.caption;
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
      explain: "The oleo strut uses oil and gas to soak up the bump of landing, like the shock absorbers on a car."
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
      explain: "The torque links let the piston slide up and down but stop it turning round, so the wheels keep pointing the right way."
    },
    {
      q: "Which part uses hydraulic pressure to move the landing gear up and down?",
      topic: "Actuating cylinder",
      options: ["Drag brace", "Oleo strut", "Actuating cylinder", "Wheel well door"],
      answer: 2,
      explain: "Fluid pushes the piston inside the actuating cylinder, and its rod swings the gear leg."
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

  const STAGE_MS = 2200;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // Runs fn(eased progress 0..1) every frame for ms milliseconds.
  function animate(ms, fn) {
    return new Promise((resolve) => {
      if (reduceMotion || ms <= 0) { fn(1); resolve(); return; }
      const start = performance.now();
      function frame(now) {
        const t = Math.min(1, (now - start) / ms);
        fn(ease(t));
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  /* ----- Flow patterns: moving stripes used inside the cylinders ----- */
  (function makePatterns() {
    const defs = $("hyd-defs");
    [["blue", "#3ea6ff", "#9fd2ff"], ["red", "#ff4b4b", "#ffa3a3"]].forEach(([name, base, stripe]) => {
      [["r", 16], ["l", -16]].forEach(([dir, dx]) => {
        const pat = svgEl("pattern", { id: "flow-" + name + "-" + dir, width: 16, height: 40, patternUnits: "userSpaceOnUse" }, defs);
        svgEl("rect", { width: 16, height: 40, fill: base }, pat);
        svgEl("rect", { x: 0, width: 5, height: 40, fill: stripe, opacity: 0.8 }, pat);
        if (!reduceMotion) {
          svgEl("animateTransform", {
            attributeName: "patternTransform", type: "translate",
            from: "0 0", to: dx + " 0", dur: "0.5s", repeatCount: "indefinite"
          }, pat);
        }
      });
    });
  })();

  /* ----- Three actuating cylinders, each joined to a gear leg ----- */
  // The rod pushes a short crank on the leg. Crank angle psi goes from -135deg (gear up,
  // leg lying flat in its bay) to -45deg (gear down, leg hanging straight down).
  const ACT_ROWS = [
    { id: "nose", name: "NOSE GEAR", cy: 100 },
    { id: "left", name: "LEFT MAIN", cy: 260 },
    { id: "right", name: "RIGHT MAIN", cy: 420 }
  ];
  const PIVOT_X = 780, CRANK = 30, LEG = 90, PISTON_W = 12;
  const ROD_LEN = Math.hypot(PIVOT_X + CRANK * Math.cos(-0.75 * Math.PI) - 618, CRANK + CRANK * Math.sin(-0.75 * Math.PI));

  const actuators = ACT_ROWS.map((row) => {
    const layer = $("actuators");
    const cy = row.cy;
    const g = svgEl("g", { class: "act-row" }, layer);
    svgEl("rect", { x: 768, y: cy + 12, width: 124, height: 36, rx: 8, class: "bay" }, g);
    svgEl("rect", { x: 600, y: cy - 18, width: 100, height: 36, rx: 6, class: "cylinder" }, g);
    const cap = svgEl("rect", { x: 602, y: cy - 15, width: 4, height: 30, class: "chamber" }, g);
    const rodc = svgEl("rect", { x: 618, y: cy - 15, width: 80, height: 30, class: "chamber" }, g);
    const piston = svgEl("rect", { x: 606, y: cy - 16, width: PISTON_W, height: 32, rx: 2, class: "piston" }, g);
    const rod = svgEl("line", { class: "rod" }, g);
    const crank = svgEl("line", { class: "crank" }, g);
    const leg = svgEl("line", { class: "leg" }, g);
    const wheel = svgEl("circle", { r: 13, class: "leg-wheel" }, g);
    svgEl("circle", { cx: PIVOT_X, cy: cy + 30, r: 5, class: "joint" }, g);
    const t1 = svgEl("text", { x: 625, y: cy - 25, class: "svg-tiny", "text-anchor": "middle" }, g);
    t1.textContent = "down side";
    const t2 = svgEl("text", { x: 680, y: cy - 25, class: "svg-tiny", "text-anchor": "middle" }, g);
    t2.textContent = "up side";
    const name = svgEl("text", { x: 905, y: cy - 12, class: "svg-label", "text-anchor": "middle" }, g);
    name.textContent = row.name;
    const status = svgEl("text", { x: 905, y: cy + 4, class: "svg-small mono", "text-anchor": "middle" }, g);
    return { row, cy, cap, rodc, piston, rod, crank, leg, wheel, status, p: 0 };
  });

  // p: 0 = gear up, 1 = gear down.
  function setActuator(a, p) {
    a.p = p;
    const psi = (-135 + 90 * p) * Math.PI / 180;
    const px = PIVOT_X, py = a.cy + 30;
    const cx = px + CRANK * Math.cos(psi), cyy = py + CRANK * Math.sin(psi);
    const pistonRight = cx - Math.sqrt(ROD_LEN * ROD_LEN - (cyy - a.cy) * (cyy - a.cy));
    const pistonX = pistonRight - PISTON_W;
    a.piston.setAttribute("x", pistonX.toFixed(1));
    a.cap.setAttribute("width", Math.max(0, pistonX - 602).toFixed(1));
    a.rodc.setAttribute("x", pistonRight.toFixed(1));
    a.rodc.setAttribute("width", Math.max(0, 698 - pistonRight).toFixed(1));
    setLine(a.rod, pistonRight, a.cy, cx, cyy);
    setLine(a.crank, px, py, cx, cyy);
    const alpha = psi + 0.75 * Math.PI;
    const ex = px + LEG * Math.cos(alpha), ey = py + LEG * Math.sin(alpha);
    setLine(a.leg, px, py, ex, ey);
    a.wheel.setAttribute("cx", ex.toFixed(1));
    a.wheel.setAttribute("cy", ey.toFixed(1));
  }

  function setLine(line, x1, y1, x2, y2) {
    line.setAttribute("x1", x1.toFixed(1)); line.setAttribute("y1", y1.toFixed(1));
    line.setAttribute("x2", x2.toFixed(1)); line.setAttribute("y2", y2.toFixed(1));
  }

  // kind: null (idle fluid), "blue" or "red"; dir "r" or "l"; still: solid colour, no movement.
  function setChamber(rect, kind, dir, still) {
    rect.classList.remove("blue", "red");
    rect.style.fill = "";
    if (!kind) return;
    if (still) { rect.classList.add(kind); return; }
    // Inline style, so it beats the stylesheet's idle colour.
    rect.style.fill = "url(#flow-" + kind + "-" + dir + ")";
  }

  /* ----- Pipes, gauge, valve ----- */
  const downLines = Array.from(document.querySelectorAll("#down-lines .pipe"));
  const upLines = Array.from(document.querySelectorAll("#up-lines .pipe"));
  const hydPipes = ["pipe-supply", "pipe-pressure", "pipe-return", "pipe-gauge",
    "pass-down-p", "pass-down-r", "pass-up-p", "pass-up-r"].map($).concat(downLines, upLines);
  const hyd = { pos: "up", running: false, done: { down: false, up: false }, psi: 0 };

  function setPipe(pipe, kind, reverse) {
    pipe.classList.remove("pressure", "return", "rev");
    if (kind) pipe.classList.add(kind);
    if (reverse) pipe.classList.add("rev");
  }

  function setGauge(psi) {
    hyd.psi = psi;
    $("gauge-needle").setAttribute("transform", "rotate(" + (-120 + 240 * psi / 3000).toFixed(1) + " 300 180)");
    $("gauge-value").textContent = Math.round(psi / 10) * 10 + " psi";
  }

  function resetFlow() {
    hydPipes.forEach((p) => setPipe(p, null));
    $("valve-down").setAttribute("opacity", "0");
    $("valve-up").setAttribute("opacity", "0");
    $("impeller").classList.remove("spin");
    $("hyd-svg").classList.remove("still");
    actuators.forEach((a) => { setChamber(a.cap, null); setChamber(a.rodc, null); });
    document.querySelectorAll("#hyd-svg .focus").forEach((n) => n.classList.remove("focus"));
  }

  function stageText(dir) {
    const down = dir === "down";
    return [
      {
        title: "The reservoir stores the fluid",
        text: "The reservoir is a tank that holds the hydraulic fluid (a special oil). It feeds fluid to the pump, and the used fluid comes back to it."
      },
      {
        title: "The pump pushes the fluid hard",
        text: "The engine turns the pump. The pump pushes the fluid out very hard: about 3,000 psi, roughly 100 times the pressure in a car tyre. Watch the gauge go up."
      },
      {
        title: "The filter and valves keep it clean and safe",
        text: "The filter cleans the fluid, because dirt can jam the valves. The check valve lets fluid go one way only, so it can't run back into the pump. The relief valve is a safety valve: if the pressure gets too high, it opens and lets some fluid go back."
      },
      {
        title: "The selector valve picks the way: GEAR " + (down ? "DOWN" : "UP"),
        text: down
          ? "The pilot moved the gear handle to DOWN. The selector valve works like a railway switch. It sends the fluid (blue) to the \"down\" side of all three actuating cylinders, and lets the other side drain back."
          : "The pilot moved the gear handle to UP. The selector valve switches over. Now the fluid (blue) goes to the \"up\" side of all three actuating cylinders, and the \"down\" side drains back."
      },
      {
        title: down ? "The cylinders push the gear down" : "The cylinders pull the gear up",
        text: down
          ? "Look inside each cylinder. Blue fluid flows in behind the piston and pushes it along. The rod pushes the gear leg, which swings down and locks. The fluid in front of the piston (red) is pushed out."
          : "Look inside each cylinder. Blue fluid flows in on the rod side and pushes the piston back. The rod pulls the gear leg up into its bay, where it locks. The fluid behind the piston (red) is pushed out."
      },
      {
        title: "The fluid goes back to the reservoir",
        text: "The pushed-out fluid flows back along the return line to the reservoir, ready to use again. The fluid goes round in a loop: it is never used up."
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

  function focusStage(n) {
    document.querySelectorAll("#hyd-svg .focus").forEach((node) => node.classList.remove("focus"));
    const target = document.querySelector('#hyd-svg [data-stage="' + n + '"]') ||
      document.querySelector('#hyd-svg [data-stage-label="' + n + '"]');
    if (target) target.classList.add("focus");
    document.querySelectorAll("#stages .stage").forEach((li, i) => {
      li.classList.toggle("current", i === n - 1);
      li.classList.toggle("done", i < n - 1);
    });
    $("hyd-status").textContent = "Stage " + n + " of 6: " + stageText(hyd.dir)[n - 1].title + ".";
  }

  function setActStatus(text) {
    actuators.forEach((a) => { a.status.textContent = text; });
  }

  async function runHydraulics(dir) {
    if (hyd.running) return;
    if (hyd.pos === dir) {
      $("hyd-status").textContent = "The gear is already " + dir.toUpperCase() + ". Press GEAR " +
        (dir === "down" ? "UP" : "DOWN") + " to move it the other way.";
      return;
    }
    const down = dir === "down";
    hyd.running = true;
    hyd.dir = dir;
    $("hyd-down").disabled = true;
    $("hyd-up").disabled = true;
    resetFlow();
    renderStages(dir);
    $("valve-text").textContent = "NEUTRAL";

    focusStage(1);
    setPipe($("pipe-supply"), "pressure");
    await wait(STAGE_MS);

    focusStage(2);
    $("impeller").classList.add("spin");
    setPipe($("pipe-pressure"), "pressure");
    setPipe($("pipe-gauge"), "pressure");
    const from = hyd.psi;
    await animate(STAGE_MS * 0.8, (t) => setGauge(from + (3000 - from) * t));
    await wait(STAGE_MS * 0.2);

    focusStage(3);
    await wait(STAGE_MS);

    focusStage(4);
    $("valve-text").textContent = down ? "DOWN" : "UP";
    $(down ? "valve-down" : "valve-up").setAttribute("opacity", "1");
    setPipe($(down ? "pass-down-p" : "pass-up-p"), "pressure");
    (down ? downLines : upLines).forEach((p) => setPipe(p, "pressure"));
    await wait(STAGE_MS);

    // 5. Inside the cylinders: blue fills the working side, red is pushed out the other.
    focusStage(5);
    (down ? upLines : downLines).forEach((p) => setPipe(p, "return", true));
    setPipe($(down ? "pass-down-r" : "pass-up-r"), "return");
    setPipe($("pipe-return"), "return");
    setActStatus("MOVING");
    actuators.forEach((a) => {
      setChamber(down ? a.cap : a.rodc, "blue", down ? "r" : "l");
      setChamber(down ? a.rodc : a.cap, "red", down ? "r" : "l");
    });
    await Promise.all(actuators.map((a, i) =>
      wait(i * 200).then(() => animate(STAGE_MS * 1.3, (t) => setActuator(a, down ? t : 1 - t)))
    ));
    setActStatus(down ? "DOWN & LOCKED" : "UP & LOCKED");

    focusStage(6);
    await wait(STAGE_MS);

    document.querySelectorAll("#stages .stage").forEach((li) => {
      li.classList.remove("current");
      li.classList.add("done");
    });
    document.querySelectorAll("#hyd-svg .focus").forEach((n) => n.classList.remove("focus"));
    $("hyd-svg").classList.add("still");
    $("impeller").classList.remove("spin");
    actuators.forEach((a) => {
      setChamber(down ? a.cap : a.rodc, "blue", null, true);
      setChamber(down ? a.rodc : a.cap, null);
    });
    hyd.pos = dir;
    hyd.done[dir] = true;
    $("hyd-status").textContent = "Done: all three gears are " + (down ? "DOWN" : "UP") +
      " and locked. The pistons can't go any further, so the fluid stops moving. The pressure stays on to hold them.";
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
  hyd.dir = "down";
  renderStages("down");
  actuators.forEach((a) => setActuator(a, 0));
  setActStatus("UP & LOCKED");
  setGauge(0);

  /* ================= Section 3: indication ================= */

  const GEARS = ["nose", "left", "right"];
  const GEAR_NAMES = { nose: "nose gear", left: "left main gear", right: "right main gear" };
  // Each gear: p (0 = up, 1 = down) and lock ("up", "down" or null while moving / not locked).
  const sim = {
    handle: "up",
    gear: { nose: { p: 0, lock: "up" }, left: { p: 0, lock: "up" }, right: { p: 0, lock: "up" } },
    doors: 0,              // 0 = shut, 1 = open
    moving: 0,             // animations running
    busy: false,
    lampTest: false,
    // Fault flags
    hydraulics: true,
    jammed: {},            // gear stuck in its bay (until emergency extension)
    stall: {},             // gear stops short of locking down (next extension only)
    stuckDown: {},         // gear won't come up
    bulb: {},              // blown green bulb
    doorStuck: false,      // doors stay open on the next retraction
    fault: null,
    done: { down: false, up: false }
  };
  const lamps = { red: $("lamp-red"), nose: $("lamp-nose"), left: $("lamp-left"), right: $("lamp-right") };

  /* ----- Drawing the aircraft ----- */
  function renderJet() {
    const g = sim.gear;
    const n = g.nose.p;
    $("jg-nose").setAttribute("transform", "translate(260 188) scale(1 " + (0.06 + 0.94 * n).toFixed(3) + ") translate(-260 -188)");
    $("jg-left").setAttribute("transform", "rotate(" + (90 * g.left.p - 90).toFixed(1) + " 176 166)");
    $("jg-right").setAttribute("transform", "rotate(" + (90 - 90 * g.right.p).toFixed(1) + " 344 166)");
    GEARS.forEach((k) => {
      $("jg-" + k).style.opacity = (0.35 + 0.65 * g[k].p).toFixed(2);
      const label = $("jl-" + k);
      label.classList.toggle("locked-down", g[k].lock === "down");
      label.classList.toggle("not-locked", g[k].lock === null && sim.moving === 0);
    });
    $("jd-left").setAttribute("transform", "rotate(" + (100 * sim.doors).toFixed(1) + " 246 189)");
    $("jd-right").setAttribute("transform", "rotate(" + (-100 * sim.doors).toFixed(1) + " 274 189)");
  }

  /* ----- What the lights show (worked out from the gear, like real sensors) ----- */
  function lightsShow() {
    if (sim.lampTest) {
      return { red: true, nose: !sim.bulb.nose, left: !sim.bulb.left, right: !sim.bulb.right };
    }
    const out = { red: false };
    GEARS.forEach((k) => {
      out[k] = sim.gear[k].lock === "down" && !sim.bulb[k];
      if (sim.gear[k].lock !== sim.handle) out.red = true;
    });
    if (sim.handle === "up" && sim.doors > 0.02) out.red = true;
    return out;
  }

  const IND_STATES = {
    test: { label: "LAMP TEST", cls: "", row: null,
      text: "Every bulb should light up now. A bulb that stays dark has failed, and could hide a warning." },
    transit: { label: "IN TRANSIT", cls: "bad", row: "transit",
      text: "Red light on: the gear is moving. Wait for it to finish." },
    unsafe: { label: "UNSAFE", cls: "bad", row: "unsafe",
      text: "The red light is staying on: a gear is not where the handle says it should be. Do NOT land like this." },
    down: { label: "DOWN AND LOCKED", cls: "ok", row: "down",
      text: "Three greens and no red: all three legs are down and locked. Safe to land." },
    up: { label: "UP AND LOCKED", cls: "", row: "up",
      text: "All lights off with the handle UP: the gear is tucked away and locked. Normal for flight." },
    check: { label: "CHECK THE LIGHTS", cls: "bad", row: "none",
      text: "No red light, but a green is missing. A bulb may have failed. Do a lamp test before you trust it." }
  };

  function indicationKey(L) {
    if (sim.lampTest) return "test";
    if (sim.moving > 0 && L.red) return "transit";
    if (L.red) return "unsafe";
    const greens = GEARS.filter((k) => L[k]).length;
    if (sim.handle === "down") return greens === 3 ? "down" : "check";
    return "up";
  }

  function renderInd() {
    const L = lightsShow();
    Object.keys(lamps).forEach((k) => lamps[k].classList.toggle("on", !!L[k]));
    $("handle").classList.toggle("down", sim.handle === "down");
    $("handle-btn").setAttribute("aria-label", "Gear handle, now " + sim.handle.toUpperCase() + ": click to move it");
    renderJet();

    const s = IND_STATES[indicationKey(L)];
    const value = $("ind-state");
    value.textContent = s.label;
    value.className = "readout-value " + s.cls;
    if (!sim.message) $("ind-explain").textContent = s.text;
    document.querySelectorAll(".lights-table tbody tr").forEach((tr) => {
      tr.classList.toggle("match", tr.dataset.row === s.row);
    });

    // The backup way down: offered when the handle is DOWN but a gear isn't locked down.
    const needsEmergency = sim.handle === "down" && sim.moving === 0 &&
      GEARS.some((k) => sim.gear[k].lock !== "down");
    $("ind-emergency").hidden = !(needsEmergency && !sim.busy);
    $("ind-reset").hidden = !sim.fault;
    ["ind-down", "ind-up", "ind-fault", "ind-test", "ind-emergency", "ind-reset"].forEach((id) => { $(id).disabled = sim.busy; });
  }

  // Shows a one-off note in the readout until the next state change.
  function note(text) {
    sim.message = true;
    $("ind-explain").textContent = text;
  }

  // Moves a gear (or the doors) to a new position over ms milliseconds.
  function move(target, key, to, ms) {
    const from = target[key];
    sim.moving++;
    return animate(ms, (t) => { target[key] = from + (to - from) * t; renderInd(); })
      .then(() => { sim.moving--; renderInd(); });
  }

  const MOVE_MS = { nose: 1700, right: 2000, left: 2300 };

  async function extend(emergency) {
    sim.handle = "down";
    renderInd();
    if (!sim.hydraulics && !emergency) return;            // nothing to push the gear
    if (sim.doors < 1) await move(sim, "doors", 1, emergency ? 1200 : 500);
    await Promise.all(GEARS.map((k) => {
      const g = sim.gear[k];
      if (g.lock === "down") return null;
      if (sim.jammed[k] && !emergency) return null;        // uplock won't let go
      g.lock = null;
      const stop = emergency ? 1 : (sim.stall[k] !== undefined ? sim.stall[k] : 1);
      return move(g, "p", stop, (emergency ? 1.6 : 1) * MOVE_MS[k]).then(() => {
        if (stop === 1) g.lock = "down";
      });
    }));
    if (emergency) { sim.jammed = {}; sim.stall = {}; }
    renderInd();
  }

  async function retract() {
    sim.handle = "up";
    renderInd();
    if (!sim.hydraulics) return;
    await Promise.all(GEARS.map((k) => {
      const g = sim.gear[k];
      if (g.lock === "up" || sim.stuckDown[k]) return null;
      g.lock = null;
      return move(g, "p", 0, MOVE_MS[k]).then(() => { g.lock = "up"; });
    }));
    const allUp = GEARS.every((k) => sim.gear[k].lock === "up");
    if (allUp && !sim.doorStuck) await move(sim, "doors", 0, 600);
    sim.doorStuck = false;
    renderInd();
  }

  async function run(action) {
    if (sim.busy) return;
    sim.busy = true;
    sim.message = false;
    renderInd();
    await action();
    sim.busy = false;
    renderInd();
  }

  function gearDown() {
    if (sim.handle === "down" && GEARS.every((k) => sim.gear[k].lock === "down") && !sim.busy) {
      note("The gear is already down and locked. Press GEAR UP to raise it.");
      return;
    }
    run(async () => { await extend(false); checkNormal("down"); });
  }

  function gearUp() {
    if (sim.handle === "up" && GEARS.every((k) => sim.gear[k].lock === "up") && sim.doors === 0 && !sim.busy) {
      note("The gear is already up and locked. Press GEAR DOWN to lower it.");
      return;
    }
    run(async () => { await retract(); checkNormal("up"); });
  }

  function checkNormal(dir) {
    const key = indicationKey(lightsShow());
    if (sim.fault && (key === "down" || key === "up")) {
      note("Problem solved: the lights now show " + IND_STATES[key].label + ". In real life, still report the fault after landing.");
    }
    if (key === dir) sim.done[dir] = true;
    updateIndProgress();
  }

  function lampTest() {
    run(async () => {
      sim.lampTest = true;
      renderInd();
      await wait(1800);
      sim.lampTest = false;
      const blown = GEARS.filter((k) => sim.bulb[k]);
      note(blown.length
        ? "The " + blown.map((k) => k.toUpperCase()).join(" and ") + " light didn't come on in the lamp test: that bulb has failed. The gear itself may be fine."
        : "All the bulbs work.");
    });
  }

  function updateIndProgress() {
    const d = sim.done;
    const msg = $("ind-progress");
    if (d.down && d.up) {
      msg.textContent = "Section 3 complete. Press \"Simulate a fault\" to practise spotting problems.";
      completeSection(3);
      return;
    }
    let text = "To complete this section: run a normal GEAR DOWN and a normal GEAR UP.";
    if (d.down) text = "Good. Now run GEAR UP to finish this section.";
    if (d.up) text = "Good. Now run GEAR DOWN to finish this section.";
    if (sim.fault) text += " (If the fault stops you, press Reset to clear it.)";
    msg.textContent = text;
  }

  /* ----- Faults ----- */
  function snap(state) {
    sim.handle = state;
    const p = state === "down" ? 1 : 0;
    GEARS.forEach((k) => { sim.gear[k].p = p; sim.gear[k].lock = state; });
    sim.doors = p;
  }

  function clearFaults() {
    sim.hydraulics = true;
    sim.jammed = {}; sim.stall = {}; sim.stuckDown = {}; sim.bulb = {};
    sim.doorStuck = false;
    sim.fault = null;
  }

  const FAULTS = [
    {
      title: "Left main gear not locked",
      start: "up",
      setup() { sim.stall.left = 0.85; },
      // Happens once: recycling the gear (UP, then DOWN) clears it.
      action: async () => { await extend(false); sim.stall = {}; },
      see: "Red light stays on. NOSE and RIGHT are green, LEFT is dark.",
      means: "The left main gear came down, but it hasn't locked. Look at the aircraft: the left leg is not quite straight.",
      todo: "Don't land. Put the handle UP, then DOWN again (this is called \"recycling\" the gear). If it still won't lock, use the emergency extension. Report it after landing.",
      tryit: "Try it: press GEAR UP, then GEAR DOWN."
    },
    {
      title: "Nose gear stuck up",
      start: "up",
      setup() { sim.jammed.nose = true; },
      action: () => extend(false),
      see: "Red light stays on. LEFT and RIGHT are green, NOSE is dark.",
      means: "The nose gear is stuck in its bay: the lock holding it up didn't let go.",
      todo: "Don't land. Try recycling the gear once. If it's still stuck, use the emergency extension: it releases the locks and lets the gear drop by its own weight.",
      tryit: "Try it: press Emergency extension."
    },
    {
      title: "Hydraulic failure",
      start: "up",
      setup() { sim.hydraulics = false; },
      action: () => extend(false),
      see: "Red light on, no greens, and nothing changes. On the aircraft, nothing moves.",
      means: "The hydraulic system has lost its pressure (for example, a pump has failed or fluid has leaked out). Nothing is pushing the gear.",
      todo: "Use the emergency extension to get the gear down. Without hydraulics it can't come up again, so plan to land. Report the failure.",
      tryit: "Try it: press Emergency extension."
    },
    {
      title: "Blown bulb",
      start: "up",
      setup() { sim.bulb.right = true; },
      action: () => extend(false),
      see: "Red light is off. NOSE and LEFT are green, but RIGHT is dark.",
      means: "Look at the aircraft: all three gears are really down and locked. The RIGHT green bulb has failed.",
      todo: "Press Lamp test. If the RIGHT light still won't come on, the bulb is blown. Check the gear another way (for example, ask the control tower to look) and report the bulb.",
      tryit: "Try it: press Lamp test."
    },
    {
      title: "Right main gear won't come up",
      start: "down",
      setup() { sim.stuckDown.right = true; },
      action: () => retract(),
      see: "The handle is UP, the red light is on, and the RIGHT green stays on.",
      means: "The right main gear is still down and locked. It didn't come up after take-off.",
      todo: "Don't fly fast with a gear down: it can be damaged. Put the handle back DOWN, check for three greens, and come back to land. Report it.",
      tryit: "Try it: press GEAR DOWN."
    },
    {
      title: "Gear door stuck open",
      start: "down",
      setup() { sim.doorStuck = true; },
      action: () => retract(),
      see: "The handle is UP, all greens are off, but the red light stays on.",
      means: "The gear is up, but a gear door hasn't closed. Look at the aircraft: the nose gear doors are still open.",
      todo: "Fly slowly, because fast air can tear an open door off. Try recycling the gear (DOWN, then UP). Report it after landing.",
      tryit: "Try it: press GEAR DOWN, then GEAR UP."
    }
  ];
  let faultOrder = [];
  let faultCount = 0;

  function nextFault() {
    if (!faultOrder.length) {
      faultOrder = FAULTS.map((_, i) => i);
      for (let i = faultOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [faultOrder[i], faultOrder[j]] = [faultOrder[j], faultOrder[i]];
      }
      // Don't repeat the fault just shown.
      if (sim.lastFault !== undefined && faultOrder[0] === sim.lastFault) faultOrder.push(faultOrder.shift());
    }
    return faultOrder.shift();
  }

  function simulateFault() {
    if (sim.busy) return;
    const index = nextFault();
    const f = FAULTS[index];
    sim.lastFault = index;
    faultCount++;
    clearFaults();
    snap(f.start);
    f.setup();
    sim.fault = f;

    $("fault-kicker").textContent = "Fault " + faultCount + " (" + FAULTS.length + " different faults to find). " +
      (f.start === "up" ? "You are flying in to land and select GEAR DOWN." : "You have just taken off and select GEAR UP.");
    $("fault-title").textContent = f.title;
    $("fault-see").textContent = f.see;
    $("fault-means").textContent = f.means;
    $("fault-do").textContent = f.todo;
    $("fault-try").textContent = f.tryit;
    $("fault-card").hidden = false;
    $("ind-fault").textContent = "Simulate another fault";
    updateIndProgress();
    run(f.action);
  }

  function resetSim() {
    if (sim.busy) return;
    clearFaults();
    snap("up");
    $("fault-card").hidden = true;
    sim.message = false;
    updateIndProgress();
    renderInd();
  }

  $("ind-down").addEventListener("click", gearDown);
  $("ind-up").addEventListener("click", gearUp);
  $("ind-test").addEventListener("click", lampTest);
  $("ind-fault").addEventListener("click", simulateFault);
  $("ind-emergency").addEventListener("click", () => run(async () => {
    note("Emergency extension: the locks are released and the gear falls by its own weight. It's slower than normal.");
    await extend(true);
    checkNormal("down");
  }));
  $("ind-reset").addEventListener("click", resetSim);

  const handleBtn = $("handle-btn");
  function toggleHandle() {
    if (sim.handle === "up") gearDown(); else gearUp();
  }
  onActivate(handleBtn, toggleHandle);

  renderInd();

  /* ================= Start ================= */
  renderProgress();
  showTab(1);
})();
