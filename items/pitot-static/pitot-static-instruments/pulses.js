/*
 * Pressure pulses: small beads that travel along SVG paths.
 *
 *   const pulses = PressurePulses(layerElement, routes, { spacing, fade, radius });
 *   pulses.draw(activeRouteIds, distanceTravelled, strengthById);   // strength is optional, 0 to 1
 *
 * routes: [{ id, color: "red" | "blue", d: "<svg path data>" }]. Each route gets a
 * train of dots spaced `spacing` apart. All routes share one period, so pulses on
 * shared pipes move together. Call draw() on every frame (or once for a still
 * picture). It shows a pressure change being passed along a line; it is not a
 * flow of liquid.
 */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";

  window.PressurePulses = function (layer, routes, options) {
    const spacing = (options && options.spacing) || 150;
    const fade = (options && options.fade) || 16;
    const radius = (options && options.radius) || 6;
    let ready = false;
    let period = 0;

    routes.forEach(function (route) {
      route.path = document.createElementNS(NS, "path");
      route.path.setAttribute("d", route.d);
      route.path.setAttribute("class", "route");
      layer.appendChild(route.path);
      route.dots = [];
    });

    // Measuring needs the path to be laid out, so it waits until the first draw.
    function measure() {
      let longest = 0;
      try {
        routes.forEach(function (route) {
          route.len = route.path.getTotalLength();
          longest = Math.max(longest, route.len);
        });
      } catch (e) {
        return false;
      }
      if (!longest || routes.some(function (route) { return !route.len; })) return false;
      const count = Math.ceil(longest / spacing);
      period = count * spacing;
      routes.forEach(function (route) {
        for (let k = 0; k < count; k++) {
          const dot = document.createElementNS(NS, "circle");
          dot.setAttribute("class", "dot");
          dot.setAttribute("data-c", route.color);
          dot.setAttribute("r", String(radius));
          dot.setAttribute("visibility", "hidden");
          layer.appendChild(dot);
          route.dots.push(dot);
        }
      });
      ready = true;
      return true;
    }

    return {
      draw: function (activeIds, travelled, strength) {
        if (!ready && !measure()) return;
        routes.forEach(function (route) {
          const level = strength && strength[route.id] !== undefined ? strength[route.id] : 1;
          const on = activeIds.indexOf(route.id) !== -1 && level > 0.05;
          route.dots.forEach(function (dot, k) {
            const d = (travelled + k * spacing) % period;
            if (!on || d > route.len) { dot.setAttribute("visibility", "hidden"); return; }
            const pt = route.path.getPointAtLength(d);
            dot.setAttribute("cx", pt.x.toFixed(1));
            dot.setAttribute("cy", pt.y.toFixed(1));
            dot.setAttribute("opacity", (level * Math.max(0, Math.min(1, d / fade, (route.len - d) / fade))).toFixed(2));
            dot.setAttribute("visibility", "visible");
          });
        });
      }
    };
  };
})();
