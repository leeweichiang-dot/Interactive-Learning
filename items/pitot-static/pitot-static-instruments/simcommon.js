/*
 * Shared by the two simulation-style diagrams (Guided Learning and Fault
 * Investigation): where the three gauges sit, how readings turn into needle
 * angles, how numbers are formatted, and the pulse routes along the pipes.
 * All values are generic teaching values.
 */
window.SimCommon = (function () {
  "use strict";

  const GAUGES = {
    asi: { cx: 620, cy: 95 },
    alt: { cx: 620, cy: 230 },
    vsi: { cx: 620, cy: 365 }
  };

  // Needle angles in degrees, clockwise from 12 o'clock
  function asiDeg(v) { return -150 + 300 * Math.max(0, Math.min(400, v)) / 400; }
  function altDeg(v) { return 360 * (Math.max(0, Math.min(10000, v)) / 10000); }
  function vsiDeg(v) {   // zero is at 9 o'clock; climb swings up, descent swings down
    return -90 + Math.max(-3000, Math.min(3000, v)) / 3000 * 165;
  }

  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  function signed(n) {   // "|| 0" avoids "-0"
    const r = Math.round(n / 10) * 10 || 0;
    return (r > 0 ? "+" : "") + fmt(r);
  }

  // Pulse routes follow the drawn pipes (same shapes as the simulation diagram).
  const TAILS = { asi: "H534 V115 H564", alt: "H534 V230 H564", vsi: "H534 V365 H564" };
  function routes() {
    const list = [{ id: "pitot", color: "red", d: "M40 230 H464 a6 6 0 0 1 12 0 H515 V75 H564" }];
    Object.keys(TAILS).forEach(function (inst) {
      list.push({ id: "sr-" + inst, color: "blue", d: "M200 204 V216 H470 V244 " + TAILS[inst] });
      list.push({ id: "sl-" + inst, color: "blue", d: "M200 256 V244 " + TAILS[inst] });
    });
    return list;
  }

  return { GAUGES: GAUGES, asiDeg: asiDeg, altDeg: altDeg, vsiDeg: vsiDeg, fmt: fmt, signed: signed, routes: routes };
})();
