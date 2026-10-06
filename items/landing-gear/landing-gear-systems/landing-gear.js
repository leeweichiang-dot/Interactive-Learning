/*
 * Landing Gear Systems: three sections shown as tabs.
 *   1. Components: where the gear is on a fighter, nose and main gear close-ups with
 *      clickable parts and animated cut-away pictures, and a 3-question check.
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
      caption: "Cut in half: watch the piston slide up when the aircraft lands."
    },
    {
      id: "drag", label: "Drag brace", name: "Drag Brace",
      where: "Shown in the nose gear window, where you see it from the side. The main gears have one too.",
      what: "A strong bar that runs at an angle from the leg up to the aircraft. It stops the leg being pushed backwards or forwards. It has a hinge in the middle so it can fold when the gear goes up. When the gear is down, a lock holds it straight.",
      why: "When the wheels touch the runway and the brakes go on, the leg gets a big push backwards. The drag brace stops the leg folding over.",
      like: "a stick propping up a fence.",
      caption: "Seen from the side: the brace holds the leg, then folds to let it go up."
    },
    {
      id: "side", label: "Side brace", name: "Side Brace",
      where: "Shown in the main gear window, where you see it from the front.",
      what: "A bar like the drag brace, but it stops the leg moving sideways. It also folds when the gear goes up, and a lock holds it straight when the gear is down.",
      why: "Turning on the ground, or landing in a side wind, pushes the wheels sideways. The side brace keeps the leg standing straight.",
      like: "the bar that stops a shelf wobbling from side to side.",
      caption: "Seen from the front: the brace holds the leg, then folds to let it go up."
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
      caption: "Cut through the middle: the tyre squashes on landing, then the brakes squeeze."
    },
    {
      id: "door", label: "Wheel well door", name: "Wheel Well Door",
      where: "Over each gear bay: one set for the nose gear and one for each main gear.",
      what: "A panel that covers the space where the gear is kept in flight (the wheel well). It opens to let the gear in or out, then closes again.",
      why: "A closed door keeps the bottom of the aircraft smooth, so air flows past easily. If a door doesn't open, the gear could hit it. If it doesn't close, the aircraft burns more fuel.",
      like: "a garage door that opens for the car and shuts behind it.",
      caption: "The door opens and closes around the gear. Watch the airflow."
    },
    {
      id: "actuator", label: "Actuating cylinder", name: "Actuating Cylinder",
      where: "Each gear leg has its own, fixed between the aircraft and the leg.",
      what: "This is the 'muscle' that moves the gear. It is a tube with a piston and a rod inside. Fluid pushed in at one end pushes the rod out. Fluid pushed in at the other end pulls the rod back in. This swings the gear down or up.",
      why: "Landing gear is very heavy, too heavy to move by hand. The actuating cylinder uses fluid pressure to move it smoothly. You'll see it working in Section 2.",
      like: "the arm of a digger, which is moved the same way.",
      caption: "Cut in half: fluid pushes the piston one way, then the other."
    }
  ];

  /* ----- Animated cut-away pictures for the explanation panel ----- */
  // Each scene draws itself once with build(svg) and returns update(t) and step(t),
  // where t runs from 0 to 1 over one loop of the animation.

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const span = (t, a, b) => smooth((t - a) / (b - a));     // 0 before a, 1 after b
  const wave = (x) => (1 - Math.cos(2 * Math.PI * clamp01(x))) / 2;   // 0 -> 1 -> 0
  const deg = (d) => d * Math.PI / 180;

  function el(parent, tag, attrs, text) {
    const node = svgEl(tag, attrs || {}, parent);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function at(node, attrs) {
    Object.keys(attrs).forEach((k) => {
      const v = attrs[k];
      node.setAttribute(k, typeof v === "number" ? v.toFixed(1) : v);
    });
  }
  function lineTo(node, a, b) { at(node, { x1: a.x, y1: a.y, x2: b.x, y2: b.y }); }

  function addMarkers(svg) {
    const defs = el(svg, "defs");
    [["w", "#f3f6fb"], ["g", "#3ee06b"], ["r", "#ff4b4b"], ["a", "#ffb627"], ["b", "#3ea6ff"]].forEach(([k, c]) => {
      const m = el(defs, "marker", { id: "xa-" + k, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: "auto-start-reverse" });
      el(m, "path", { d: "M0 0 L10 5 L0 10 Z", fill: c });
    });
  }
  function arrow(parent, cls, mk, a, b) {
    const n = el(parent, "line", { class: "x-arrow " + cls, "marker-end": "url(#xa-" + mk + ")" });
    if (a) lineTo(n, a, b);
    return n;
  }
  function label(parent, x, y, head, sub, anchor) {
    const o = anchor ? { "text-anchor": anchor } : {};
    el(parent, "text", Object.assign({ x: x, y: y, class: "x-head" }, o), head);
    if (sub) el(parent, "text", Object.assign({ x: x, y: y + 14, class: "x-text" }, o), sub);
  }

  // Knee of a folding brace: the point K with |A-K| = l1 and |K-B| = l2, on the given side of A-B.
  function knee(A, l1, B, l2, side) {
    const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const mx = A.x + a * dx / d, my = A.y + a * dy / d;
    const k1 = { x: mx - h * dy / d, y: my + h * dx / d };
    const k2 = { x: mx + h * dy / d, y: my - h * dx / d };
    const cross = (k) => Math.sign(dx * (k.y - A.y) - dy * (k.x - A.x));
    return cross(k1) === side ? k1 : k2;
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const sideOf = (A, B, K) => Math.sign((B.x - A.x) * (K.y - A.y) - (B.y - A.y) * (K.x - A.x));
  const along = (P, len, angle) => ({ x: P.x + len * Math.cos(deg(angle)), y: P.y + len * Math.sin(deg(angle)) });

  // Gear that swings up and back down, used by the two brace scenes.
  // Returns progress up (0 = down and locked, 1 = up) and whether the brace lock is engaged.
  function retractCycle(t) {
    const up = t < 0.24 ? 0 : t < 0.5 ? span(t, 0.24, 0.5) : t < 0.62 ? 1 : t < 0.88 ? 1 - span(t, 0.62, 0.88) : 0;
    const locked = t < 0.2 || t >= 0.92;
    return { up, locked };
  }

  const SCENES = {
    oleo: {
      period: 5200,
      build(svg) {
        el(svg, "rect", { x: 120, y: 20, width: 90, height: 10, class: "x-metal" });
        const gas = el(svg, "rect", { x: 128, y: 30, width: 74, height: 40, class: "x-gas" });
        const oil = el(svg, "rect", { x: 128, y: 70, width: 74, height: 72, class: "x-oil" });
        const gasText = el(svg, "text", { x: 165, y: 54, class: "x-in", "text-anchor": "middle" }, "GAS");
        const piston = el(svg, "g");
        el(piston, "rect", { x: 144, y: 100, width: 42, height: 105, class: "x-oil" });
        el(piston, "rect", { x: 136, y: 100, width: 8, height: 113, class: "x-chrome" });
        el(piston, "rect", { x: 186, y: 100, width: 8, height: 113, class: "x-chrome" });
        el(piston, "rect", { x: 136, y: 205, width: 58, height: 8, class: "x-chrome" });
        el(piston, "rect", { x: 136, y: 96, width: 22, height: 6, class: "x-dark" });
        el(piston, "rect", { x: 172, y: 96, width: 22, height: 6, class: "x-dark" });
        el(piston, "text", { x: 165, y: 165, class: "x-in", "text-anchor": "middle" }, "OIL");
        el(svg, "rect", { x: 120, y: 20, width: 8, height: 125, class: "x-metal" });
        el(svg, "rect", { x: 202, y: 20, width: 8, height: 125, class: "x-metal" });
        const flow = arrow(svg, "", "w");
        const bump = arrow(svg, "amber", "a", { x: 95, y: 212 }, { x: 95, y: 150 });
        el(svg, "text", { x: 10, y: 172, class: "x-text" }, "Bump from");
        el(svg, "text", { x: 10, y: 187, class: "x-text" }, "landing");
        el(svg, "line", { x1: 210, y1: 40, x2: 226, y2: 40, class: "x-lead" });
        label(svg, 230, 37, "Gas", "acts like a spring");
        const holeLead = el(svg, "line", { class: "x-lead" });
        label(svg, 230, 88, "Small hole", "slows the oil down");
        const pistonLead = el(svg, "line", { class: "x-lead" });
        label(svg, 230, 172, "Piston", "slides in and out");

        const squash = (t) => (t < 0.3 ? smooth(t / 0.3) : t < 0.45 ? 1 : t < 0.85 ? 1 - span(t, 0.45, 0.85) : 0);
        return {
          update(t) {
            const c = squash(t), off = 35 * c;
            const gasH = 40 - 22 * c;
            at(gas, { height: gasH });
            at(oil, { y: 30 + gasH, height: 112 - gasH });
            at(gasText, { y: 30 + gasH / 2 + 4 });
            piston.setAttribute("transform", "translate(0 " + (-off).toFixed(1) + ")");
            const holeY = 99 - off;
            const squashing = t < 0.3, stretching = t >= 0.45 && t < 0.85;
            if (squashing) lineTo(flow, { x: 165, y: holeY + 18 }, { x: 165, y: holeY - 16 });
            else lineTo(flow, { x: 165, y: holeY - 16 }, { x: 165, y: holeY + 18 });
            flow.style.opacity = squashing || stretching ? 1 : 0;
            bump.style.opacity = squashing ? 1 : 0.15;
            lineTo(holeLead, { x: 226, y: 91 }, { x: 190, y: holeY });
            lineTo(pistonLead, { x: 226, y: 175 }, { x: 194, y: 175 - off });
          },
          step(t) {
            if (t < 0.3) return "Touch-down! The bump pushes the piston up. Oil is forced up through the small hole, which slows the push down.";
            if (t < 0.45) return "The gas at the top is squashed, like a spring being pressed.";
            if (t < 0.85) return "The squashed gas pushes back. The leg stretches out again, and the oil flows back down through the hole.";
            return "Ready for the next bump.";
          }
        };
      }
    },

    drag: {
      period: 8000,
      build(svg) {
        el(svg, "rect", { x: 0, y: 10, width: 360, height: 20, class: "x-body" });
        el(svg, "rect", { x: 150, y: 30, width: 170, height: 62, class: "x-baydash" });
        el(svg, "text", { x: 10, y: 50, class: "x-text" }, "◀ front");
        const P = { x: 121, y: 30 }, A = { x: 250, y: 30 };
        const B0 = { x: 121, y: 122 }, K0 = { x: 210, y: 88 };
        const l1 = dist(A, K0), l2 = dist(K0, B0), side = sideOf(A, B0, K0);
        const leg = el(svg, "line", { class: "x-legbar" });
        const tyre = el(svg, "circle", { r: 26, class: "x-tyre" });
        const hub = el(svg, "circle", { r: 9, class: "x-hub" });
        const brace = el(svg, "polyline", { class: "x-brace hl" });
        const lock = el(svg, "rect", { width: 18, height: 14, rx: 3, class: "x-lock" });
        el(svg, "circle", { cx: P.x, cy: P.y, r: 5, class: "x-pin" });
        const push = arrow(svg, "red", "r", { x: 30, y: 200 }, { x: 80, y: 200 });
        const pushText = el(svg, "text", { x: 8, y: 226, class: "x-text" }, "Braking pushes the leg back");
        const braceLead = el(svg, "line", { class: "x-lead" });
        el(svg, "text", { x: 190, y: 182, class: "x-head" }, "Drag brace");
        const lockLead = el(svg, "line", { class: "x-lead" });
        label(svg, 262, 118, "Hinge + lock");

        return {
          update(t) {
            const { up, locked } = retractCycle(t);
            const ang = 90 - 78 * up;
            const B = along(P, 92, ang), E = along(P, 150, ang);
            const K = knee(A, l1, B, l2, side);
            lineTo(leg, P, E);
            at(tyre, { cx: E.x, cy: E.y }); at(hub, { cx: E.x, cy: E.y });
            brace.setAttribute("points", [A, K, B].map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" "));
            const rot = Math.atan2(B.y - K.y, B.x - K.x) * 180 / Math.PI;
            at(lock, { x: K.x - 9, y: K.y - 7 });
            lock.setAttribute("transform", "rotate(" + rot.toFixed(1) + " " + K.x.toFixed(1) + " " + K.y.toFixed(1) + ")");
            lock.classList.toggle("open", !locked);
            const down = up === 0;
            push.style.opacity = down && t < 0.2 ? 0.4 + 0.6 * wave((t % 0.1) / 0.1) : 0;
            pushText.style.opacity = down && t < 0.2 ? 1 : 0;
            lineTo(braceLead, { x: 214, y: 172 }, { x: (K.x + B.x) / 2, y: (K.y + B.y) / 2 });
            lineTo(lockLead, { x: 258, y: 114 }, K);
          },
          step(t) {
            if (t < 0.2) return "Gear down. When the brakes push the leg backwards (red arrow), the locked drag brace stops it folding.";
            if (t < 0.24) return "To raise the gear, the lock lets go of the hinge.";
            if (t < 0.5) return "The brace folds at its hinge as the gear swings up into its bay.";
            if (t < 0.62) return "Gear up and tucked away for flight.";
            if (t < 0.88) return "Lowering: the gear swings down and the brace opens out straight…";
            return "…and the lock clicks in, holding the brace straight again.";
          }
        };
      }
    },

    side: {
      period: 8000,
      build(svg) {
        el(svg, "rect", { x: 0, y: 10, width: 360, height: 20, class: "x-body" });
        el(svg, "rect", { x: 22, y: 30, width: 190, height: 52, class: "x-baydash" });
        el(svg, "text", { x: 352, y: 50, class: "x-text", "text-anchor": "end" }, "wing tip ▶");
        const P = { x: 200, y: 30 }, A = { x: 60, y: 30 };
        const B0 = { x: 200, y: 110 }, K0 = { x: 115, y: 80 };
        const l1 = dist(A, K0), l2 = dist(K0, B0), side = sideOf(A, B0, K0);
        const legG = el(svg, "g");
        el(legG, "rect", { x: 191, y: 30, width: 18, height: 128, class: "x-metal" });
        el(legG, "line", { x1: 160, y1: 162, x2: 240, y2: 162, class: "x-axle" });
        el(legG, "rect", { x: 150, y: 138, width: 24, height: 50, rx: 8, class: "x-tyre" });
        el(legG, "rect", { x: 226, y: 138, width: 24, height: 50, rx: 8, class: "x-tyre" });
        const brace = el(svg, "polyline", { class: "x-brace hl" });
        const lock = el(svg, "rect", { width: 18, height: 14, rx: 3, class: "x-lock" });
        el(svg, "circle", { cx: P.x, cy: P.y, r: 5, class: "x-pin" });
        const push = arrow(svg, "red", "r", { x: 340, y: 163 }, { x: 262, y: 163 });
        const pushText = el(svg, "g");
        el(pushText, "text", { x: 262, y: 136, class: "x-text" }, "Sideways push");
        el(pushText, "text", { x: 262, y: 150, class: "x-text" }, "(turning or wind)");
        const braceLead = el(svg, "line", { class: "x-lead" });
        label(svg, 8, 196, "Side brace");
        const lockLead = el(svg, "line", { class: "x-lead" });
        el(svg, "text", { x: 8, y: 220, class: "x-head" }, "Hinge + lock");

        return {
          update(t) {
            const { up, locked } = retractCycle(t);
            const ang = 90 + 82 * up;                 // swings in towards the body
            const B = along(P, 80, ang);
            const K = knee(A, l1, B, l2, side);
            legG.setAttribute("transform", "rotate(" + (ang - 90).toFixed(1) + " 200 30)");
            brace.setAttribute("points", [A, K, B].map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" "));
            const rot = Math.atan2(B.y - K.y, B.x - K.x) * 180 / Math.PI;
            at(lock, { x: K.x - 9, y: K.y - 7 });
            lock.setAttribute("transform", "rotate(" + rot.toFixed(1) + " " + K.x.toFixed(1) + " " + K.y.toFixed(1) + ")");
            lock.classList.toggle("open", !locked);
            const showPush = up === 0 && t < 0.2;
            push.style.opacity = showPush ? 0.4 + 0.6 * wave((t % 0.1) / 0.1) : 0;
            pushText.style.opacity = showPush ? 1 : 0;
            lineTo(braceLead, { x: 40, y: 186 }, { x: (A.x + K.x) / 2, y: (A.y + K.y) / 2 });
            lineTo(lockLead, { x: 60, y: 210 }, K);
          },
          step(t) {
            if (t < 0.2) return "Gear down. A sideways push (turning, or a side wind) tries to fold the leg. The locked side brace holds it upright.";
            if (t < 0.24) return "To raise the gear, the lock lets go of the hinge.";
            if (t < 0.5) return "The side brace folds, and the gear swings in sideways into its bay.";
            if (t < 0.62) return "Gear up and tucked away for flight.";
            if (t < 0.88) return "Lowering: the gear swings out and down, and the brace opens out straight…";
            return "…and the lock clicks in, holding the leg upright again.";
          }
        };
      }
    },

    torque: {
      period: 7000,
      build(svg) {
        el(svg, "rect", { x: 140, y: 10, width: 60, height: 100, class: "x-metal" });
        const U = { x: 200, y: 82 }, L0 = { x: 188, y: 176 }, E0 = { x: 248, y: 128 };
        const lu = dist(U, E0), ll = dist(E0, L0), side = sideOf(U, L0, E0);
        const piston = el(svg, "g");
        el(piston, "rect", { x: 152, y: 100, width: 36, height: 105, class: "x-chrome" });
        el(svg, "rect", { x: 140, y: 96, width: 60, height: 14, class: "x-metal" });
        const links = el(svg, "polyline", { class: "x-link" });
        el(svg, "circle", { cx: U.x, cy: U.y, r: 5, class: "x-pin" });
        const pinE = el(svg, "circle", { r: 6, class: "x-pin" });
        const pinL = el(svg, "circle", { r: 5, class: "x-pin" });
        const slide = el(svg, "g");
        el(slide, "line", { x1: 120, y1: 122, x2: 120, y2: 194, class: "x-arrow green", "marker-start": "url(#xa-g)", "marker-end": "url(#xa-g)" });
        el(slide, "text", { x: 8, y: 150, class: "x-head good" }, "Slides up");
        el(slide, "text", { x: 8, y: 164, class: "x-head good" }, "and down ✓");
        const twist = el(svg, "g");
        el(twist, "path", { d: "M146 214 Q170 230 194 214", class: "x-arrow red", "marker-end": "url(#xa-r)" });
        el(twist, "text", { x: 214, y: 208, class: "x-head bad" }, "Can’t twist");
        el(twist, "text", { x: 214, y: 222, class: "x-head bad" }, "round ✗");
        const blocked = el(svg, "text", { x: 286, y: 178, class: "x-head bad", "text-anchor": "middle" }, "HELD!");
        const linkLead = el(svg, "line", { class: "x-lead" });
        label(svg, 290, 118, "Torque", null);
        el(svg, "text", { x: 290, y: 132, class: "x-head" }, "links");
        label(svg, 214, 30, "Top of the leg", "(fixed)");
        label(svg, 8, 40, "Piston", "(moves)");

        return {
          update(t) {
            let c = 0, jx = 0, slideOn = 0, twistOn = 0;
            if (t < 0.5) { c = wave(t / 0.5); slideOn = 1; }
            else { twistOn = wave((t - 0.5) / 0.5); jx = 2.5 * Math.sin((t - 0.5) * Math.PI * 24) * twistOn; }
            const off = 36 * c;
            piston.setAttribute("transform", "translate(" + jx.toFixed(1) + " " + (-off).toFixed(1) + ")");
            const L = { x: L0.x + jx, y: L0.y - off };
            const E = knee(U, lu, L, ll, side);
            links.setAttribute("points", [U, E, L].map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" "));
            at(pinE, { cx: E.x, cy: E.y }); at(pinL, { cx: L.x, cy: L.y });
            links.classList.toggle("strain", twistOn > 0.3);
            slide.style.opacity = 0.25 + 0.75 * slideOn;
            twist.style.opacity = 0.25 + 0.75 * twistOn;
            blocked.style.opacity = twistOn > 0.3 ? 1 : 0;
            lineTo(linkLead, { x: 286, y: 122 }, E);
          },
          step(t) {
            if (t < 0.5) return "As the strut squashes and stretches, the piston slides up and down. The torque links fold and open like a knee.";
            return "Now something tries to twist the wheel round. The links hold the piston, so it can only wobble a tiny bit: it can't turn.";
          }
        };
      }
    },

    wheel: {
      period: 7000,
      build(svg) {
        el(svg, "line", { x1: 60, y1: 212, x2: 300, y2: 212, class: "x-ground" });
        const tyreB = el(svg, "rect", { rx: 20, class: "x-tyre" });
        const n2B = el(svg, "rect", { rx: 10, class: "x-n2" });
        const wheel = el(svg, "g");
        el(wheel, "rect", { x: 110, y: 10, width: 140, height: 56, rx: 20, class: "x-tyre" });
        el(wheel, "rect", { x: 122, y: 22, width: 116, height: 44, rx: 10, class: "x-n2" });
        el(wheel, "rect", { x: 116, y: 62, width: 128, height: 96, rx: 4, class: "x-rim" });
        const discs = [];
        for (let i = 0; i < 8; i++) discs.push(el(wheel, "rect", { y: 74, width: 6, height: 72, class: i % 2 ? "x-brake-b" : "x-brake-a" }));
        const heat = el(wheel, "rect", { x: 132, y: 72, width: 96, height: 76, rx: 6, class: "x-heat" });
        el(wheel, "rect", { x: 60, y: 104, width: 250, height: 12, rx: 3, class: "x-chrome" });
        const squeeze = el(wheel, "g");
        arrow(squeeze, "red", "r", { x: 118, y: 88 }, { x: 134, y: 88 });
        arrow(squeeze, "red", "r", { x: 242, y: 88 }, { x: 226, y: 88 });
        const hot = el(wheel, "text", { x: 180, y: 70, class: "x-head bad", "text-anchor": "middle" }, "HOT!");
        el(svg, "line", { x1: 44, y1: 22, x2: 112, y2: 28, class: "x-lead" }); label(svg, 8, 26, "Tyre");
        el(svg, "line", { x1: 84, y1: 54, x2: 140, y2: 46, class: "x-lead" }); label(svg, 8, 52, "Nitrogen", "gas inside");
        el(svg, "line", { x1: 244, y1: 70, x2: 268, y2: 70, class: "x-lead" }); label(svg, 272, 74, "Wheel");
        el(svg, "line", { x1: 216, y1: 140, x2: 268, y2: 150, class: "x-lead" }); label(svg, 272, 148, "Brakes", "(discs)");
        el(svg, "line", { x1: 40, y1: 110, x2: 60, y2: 110, class: "x-lead" }); label(svg, 8, 114, "Axle");
        el(svg, "text", { x: 304, y: 216, class: "x-text" }, "runway");

        return {
          update(t) {
            const k = t < 0.45 ? wave(t / 0.45) : 0;
            const b = t >= 0.5 ? wave((t - 0.5) / 0.5) : 0;
            const sink = 8 * k;
            wheel.setAttribute("transform", "translate(0 " + sink.toFixed(1) + ")");
            at(tyreB, { x: 110 - 5 * k, y: 154 + sink, width: 140 + 10 * k, height: 56 - sink });
            at(n2B, { x: 122 - 5 * k, y: 154 + sink, width: 116 + 10 * k, height: 44 - 0.9 * sink });
            const gap = 10 - 3 * b;
            discs.forEach((d, i) => at(d, { x: 180 + (i - 3.5) * gap - 3 }));
            heat.style.opacity = (0.6 * b).toFixed(2);
            squeeze.style.opacity = b > 0.05 ? 1 : 0;
            hot.style.opacity = b > 0.5 ? 1 : 0;
          },
          step(t) {
            if (t < 0.45) return "Landing: the tyre hits the runway and squashes a little. The nitrogen inside acts like a cushion.";
            if (t < 0.5) return "Rolling along the runway…";
            return "Braking: the brakes squeeze the discs together. The rubbing slows the wheel down, and the discs get very hot.";
          }
        };
      }
    },

    door: {
      period: 9000,
      build(svg) {
        const air = [el(svg, "path", { class: "x-air" }), el(svg, "path", { class: "x-air" })];
        el(svg, "text", { x: 10, y: 172, class: "x-text" }, "airflow →");
        el(svg, "rect", { x: 10, y: 20, width: 340, height: 50, class: "x-body" });
        el(svg, "rect", { x: 222, y: 40, width: 90, height: 30, class: "x-bay" });
        el(svg, "text", { x: 130, y: 50, class: "x-text", "text-anchor": "middle" }, "aircraft body");
        const P = { x: 296, y: 52 }, H = { x: 312, y: 70 };
        const leg = el(svg, "line", { class: "x-leg" });
        const tyre = el(svg, "circle", { r: 12, class: "x-tyre" });
        const door = el(svg, "line", { class: "x-door-line" });
        el(svg, "circle", { cx: H.x, cy: H.y, r: 4, class: "x-pin" });
        const doorText = el(svg, "text", { class: "x-head" }, "Door");
        const state = el(svg, "text", { x: 180, y: 226, class: "x-head", "text-anchor": "middle" });

        function timeline(t) {
          const gear = t < 0.12 ? 1 : t < 0.32 ? 1 - span(t, 0.12, 0.32) : t < 0.68 ? 0 : t < 0.88 ? span(t, 0.68, 0.88) : 1;
          const open = t < 0.32 ? 1 : t < 0.42 ? 1 - span(t, 0.32, 0.42) : t < 0.58 ? 0 : t < 0.68 ? span(t, 0.58, 0.68) : 1;
          return { gear, open };
        }
        return {
          update(t) {
            const { gear, open } = timeline(t);
            const E = along(P, 62, 180 - 90 * gear);
            lineTo(leg, P, E);
            at(tyre, { cx: E.x, cy: E.y });
            const D = along(H, 90, 180 - 90 * open);
            lineTo(door, H, D);
            at(doorText, { x: (H.x + D.x) / 2 + 10, y: (H.y + D.y) / 2 + 20 });
            const rough = Math.max(open, gear);
            air.forEach((p, i) => {
              const y0 = 186 + i * 18;
              let d = "M10 " + y0;
              for (let x = 20; x <= 350; x += 10) {
                const wob = x > 210 ? rough * 7 * Math.sin(x / 9 + t * 60 + i * 2) : 0;
                d += " L" + x + " " + (y0 + wob).toFixed(1);
              }
              p.setAttribute("d", d);
              p.classList.toggle("rough", rough > 0.05);
            });
            state.textContent = open > 0.02 ? "Door open: rough air, more drag" : "Door shut: smooth air";
            state.setAttribute("class", "x-head " + (open > 0.02 ? "bad" : "good"));
          },
          step(t) {
            if (t < 0.12) return "Gear down, door open. The open bay makes the air rough (wavy lines), which slows the aircraft.";
            if (t < 0.32) return "After take-off, the gear swings up into its bay…";
            if (t < 0.42) return "…then the door closes behind it.";
            if (t < 0.58) return "Door shut: the bottom of the aircraft is smooth, so the air flows past easily.";
            if (t < 0.68) return "Before landing, the door opens first, so the gear won't hit it…";
            return "…then the gear swings down.";
          }
        };
      }
    },

    actuator: {
      period: 7000,
      build(svg) {
        el(svg, "rect", { x: 30, y: 70, width: 200, height: 60, rx: 6, class: "x-metal" });
        const left = el(svg, "rect", { x: 36, y: 76, height: 48 });
        const right = el(svg, "rect", { y: 76, height: 48 });
        const piston = el(svg, "rect", { y: 74, width: 12, height: 52, class: "x-chrome" });
        const rod = el(svg, "rect", { y: 92, width: 190, height: 16, rx: 3, class: "x-chrome" });
        const eye = el(svg, "circle", { cy: 100, r: 9, class: "x-pin" });
        el(svg, "rect", { x: 44, y: 36, width: 12, height: 36, class: "x-metal" });
        el(svg, "rect", { x: 204, y: 36, width: 12, height: 36, class: "x-metal" });
        const portL = el(svg, "line", { class: "x-arrow" });
        const portR = el(svg, "line", { class: "x-arrow" });
        const textL = el(svg, "text", { x: 62, y: 22, class: "x-head" });
        const textR = el(svg, "text", { x: 222, y: 22, class: "x-head" });
        const push = arrow(svg, "", "w");
        const pistonLead = el(svg, "line", { class: "x-lead" });
        const pistonText = el(svg, "text", { y: 164, class: "x-head", "text-anchor": "middle" }, "Piston");
        const rodText = el(svg, "text", { y: 146, class: "x-head", "text-anchor": "middle" }, "Rod");
        const status = el(svg, "text", { x: 180, y: 200, class: "x-head", "text-anchor": "middle" });
        const statusSub = el(svg, "text", { x: 180, y: 216, class: "x-text", "text-anchor": "middle" });

        return {
          update(t) {
            const out = t < 0.4 ? span(t, 0, 0.4) : t < 0.5 ? 1 : t < 0.9 ? 1 - span(t, 0.5, 0.9) : 0;
            const extending = t < 0.45, moving = (t < 0.4) || (t >= 0.5 && t < 0.9);
            const px = 40 + 80 * out, pr = px + 12;
            at(left, { width: px - 36 });
            at(right, { x: pr, width: 224 - pr });
            at(piston, { x: px });
            at(rod, { x: pr });
            at(eye, { cx: pr + 194 });
            left.setAttribute("class", extending ? "x-oil" : "x-out");
            right.setAttribute("class", extending ? "x-out" : "x-oil");
            // Ports: blue arrow = fluid in, red arrow = fluid out.
            const inL = extending;
            lineTo(portL, inL ? { x: 50, y: 14 } : { x: 50, y: 64 }, inL ? { x: 50, y: 64 } : { x: 50, y: 14 });
            lineTo(portR, inL ? { x: 210, y: 64 } : { x: 210, y: 14 }, inL ? { x: 210, y: 14 } : { x: 210, y: 64 });
            portL.setAttribute("class", "x-arrow " + (inL ? "blue" : "red"));
            portR.setAttribute("class", "x-arrow " + (inL ? "red" : "blue"));
            portL.setAttribute("marker-end", "url(#xa-" + (inL ? "b" : "r") + ")");
            portR.setAttribute("marker-end", "url(#xa-" + (inL ? "r" : "b") + ")");
            portL.style.opacity = portR.style.opacity = moving ? 1 : 0.3;
            textL.textContent = inL ? "Fluid in" : "Fluid out";
            textR.textContent = inL ? "Fluid out" : "Fluid in";
            if (extending) lineTo(push, { x: Math.max(44, px - 46), y: 100 }, { x: px - 6, y: 100 });
            else lineTo(push, { x: Math.min(224, pr + 52), y: 116 }, { x: pr + 6, y: 116 });
            push.style.opacity = moving ? 1 : 0;
            lineTo(pistonLead, { x: px + 6, y: 130 }, { x: px + 6, y: 150 });
            at(pistonText, { x: px + 6 });
            at(rodText, { x: pr + 150 });
            status.textContent = moving ? (extending ? "Rod sliding OUT: gear going DOWN ▼" : "Rod sliding IN: gear coming UP ▲")
              : (extending ? "Gear DOWN" : "Gear UP");
            statusSub.textContent = moving ? "fluid pushes on the piston" : "the fluid holds it there";
          },
          step(t) {
            if (t < 0.45) return "Fluid is pushed in at the left end (blue). It pushes the piston, the rod slides out, and the gear swings DOWN. Fluid on the other side is squeezed out (red).";
            return "Now the fluid is sent to the right end instead. It pushes the piston back, the rod slides in, and the gear swings UP.";
          }
        };
      }
    }
  };

  // Plays the scene for the chosen part. Pauses when Section 1 isn't on screen.
  const figAnim = { scene: null, period: 6000, t: 0, playing: !reduceMotion, last: 0, stepText: "" };

  function drawFigure() {
    if (!figAnim.scene) return;
    figAnim.scene.update(figAnim.t);
    $("fig-scrub").value = String(Math.round(figAnim.t * 1000));
    const s = figAnim.scene.step(figAnim.t);
    if (s !== figAnim.stepText) { figAnim.stepText = s; $("fig-step").textContent = s; }
  }

  function figureLoop(now) {
    requestAnimationFrame(figureLoop);
    const dt = now - figAnim.last;
    figAnim.last = now;
    if (!figAnim.playing || !figAnim.scene || $("sec-1").hidden) return;
    figAnim.t = (figAnim.t + dt / figAnim.period) % 1;
    drawFigure();
  }

  function setPlaying(on) {
    figAnim.playing = on;
    $("fig-play").textContent = on ? "❚❚ Pause" : "▶ Play";
    $("fig-play").setAttribute("aria-pressed", on ? "false" : "true");
  }

  function showFigure(part) {
    const box = $("info-fig");
    box.textContent = "";
    const svg = el(box, "svg", { class: "xsec-svg", viewBox: "0 0 360 230", role: "img", "aria-label": part.name + ": moving cut-away picture" });
    addMarkers(svg);
    const scene = SCENES[part.id];
    figAnim.scene = scene.build(svg);
    figAnim.period = scene.period;
    figAnim.t = 0;
    figAnim.stepText = "";
    drawFigure();
  }

  $("fig-play").addEventListener("click", () => setPlaying(!figAnim.playing));
  $("fig-scrub").addEventListener("input", () => {
    setPlaying(false);
    figAnim.t = Number($("fig-scrub").value) / 1000;
    drawFigure();
  });
  setPlaying(figAnim.playing);
  requestAnimationFrame((now) => { figAnim.last = now; figureLoop(now); });

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
    showFigure(part);
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
