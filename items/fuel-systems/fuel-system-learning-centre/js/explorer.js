/* Page 3: Interactive Fuel Flow Explorer. Tank, pump, filter, fuel control unit, engine. */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  var PARTS = [
    {
      name: "Fuel Tank", icon: "🛢️", short: "Stores the fuel",
      step: "The fuel starts in the tank. Tanks in the wings and body store all the fuel for the flight.",
      purpose: "Stores the fuel until the engine needs it.",
      location: "In the wings and the body (fuselage) of the aircraft.",
      faults: ["Leaks from cracked or worn sealant", "Water or dirt in the fuel", "Blocked vent, so fuel cannot flow out properly"],
      maint: ["Look for wet stains and leaks", "Drain a sample and check for water", "Keep vents clear", "Follow the strict safety rules for tank entry"]
    },
    {
      name: "Fuel Pump", icon: "⚙️", short: "Pushes the fuel",
      step: "The pump pushes the fuel out of the tank and along the pipes. Without it, the fuel would not reach the engine at the right pressure.",
      purpose: "Pushes fuel toward the engine and keeps the pressure steady.",
      location: "Usually inside the tank, at the bottom, so it is always covered by fuel.",
      faults: ["Low fuel pressure", "Noise or overheating", "Electrical failure, so the pump stops"],
      maint: ["Check the fuel pressure reading", "Never run a pump dry", "Test each pump on its own", "Check the electrical plugs for damage"]
    },
    {
      name: "Fuel Filter", icon: "🧹", short: "Cleans the fuel",
      step: "The filter catches dirt, rust and other small bits so only clean fuel goes on.",
      purpose: "Removes dirt and rust before the fuel reaches the engine.",
      location: "In the fuel line between the tank and the engine, often near the engine.",
      faults: ["Blocked by dirt, so flow drops", "Ice crystals in cold weather", "Leaking seal after it is refitted"],
      maint: ["Replace it on schedule", "Look at the old filter for metal or dirt", "Check the seals and fit it correctly", "Check the blocked-filter warning"]
    },
    {
      name: "Fuel Control Unit", icon: "🎛️", short: "Measures the right amount",
      step: "The fuel control unit (FCU) decides how much fuel the engine gets. When the pilot pushes the throttle, it lets more fuel through.",
      purpose: "Measures the correct amount of fuel for the engine, based on the pilot's throttle and the flying conditions.",
      location: "On or very close to the engine.",
      faults: ["Too much or too little fuel, so the engine surges or is slow to speed up", "Sticking parts", "Leaks at seals or dirt inside"],
      maint: ["Only trained people may adjust it", "Check linkages and settings against the manual", "Check for leaks", "Keep the filter upstream in good condition"]
    },
    {
      name: "Engine", icon: "🚀", short: "Burns the fuel",
      step: "Finally the engine burns the fuel to make thrust. Steady, clean fuel at the right pressure keeps it running smoothly.",
      purpose: "Burns the fuel to make the power (thrust) that moves the aircraft.",
      location: "In the rear body or under the wings, depending on the aircraft.",
      faults: ["Fuel starvation: the engine loses power or stops", "Hard starting", "Rough running"],
      maint: ["Check fuel pressure and flow against the limits", "Inspect the fuel inlet pipes and joints for leaks", "Report any change in how the engine starts or runs"]
    }
  ];

  var STEP_MS = 1500;

  FL.inits.explorer = function () {
    var chain = document.getElementById("fx-chain");
    var caption = document.getElementById("fx-caption");
    var info = document.getElementById("fx-info");
    var startBtn = document.getElementById("fx-start");
    var stopBtn = document.getElementById("fx-stop");
    var modeBtn = document.getElementById("fx-mode");
    var stepBtns = document.getElementById("fx-stepbtns");
    var backBtn = document.getElementById("fx-back");
    var nextBtn = document.getElementById("fx-next");

    var buttons = [], pipes = [];
    var diagram = document.getElementById("fx-svg");
    var dParts = Array.prototype.slice.call(diagram.querySelectorAll(".part"));      // aircraft parts, data-stage 0-4
    var dPipes = Array.prototype.slice.call(diagram.querySelectorAll("[data-pipe]")); // aircraft pipes, data-pipe i joins stage i and i+1
    var index = -1;        // part the fuel has reached (-1 = still in the supply, not started)
    var timer = null;      // set while the animation runs
    var stepMode = false;
    var lapDone = false;   // after one full trip, all pipes keep flowing
    var hovered = null;    // part under the pointer or keyboard focus
    var pinned = null;     // part the trainee tapped; cleared on the next Start/Step

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    PARTS.forEach(function (p, i) {
      var b = el("button", "fx-part");
      b.type = "button";
      b.appendChild(el("span", "ico", p.icon));
      var t = el("span");
      t.appendChild(el("b", null, p.name));
      t.appendChild(el("small", null, p.short));
      b.appendChild(t);
      b.addEventListener("mouseenter", function () { hovered = i; renderInfo(); });
      b.addEventListener("mouseleave", function () { hovered = null; renderInfo(); });
      b.addEventListener("focus", function () { hovered = i; renderInfo(); });
      b.addEventListener("blur", function () { hovered = null; renderInfo(); });
      b.addEventListener("click", function () { pinned = i; renderInfo(); });
      buttons.push(b);
      chain.appendChild(b);
      if (i < PARTS.length - 1) {
        var pipe = el("div", "fx-pipe");
        pipe.setAttribute("aria-hidden", "true");
        pipes.push(pipe);
        chain.appendChild(pipe);
      }
    });

    // The aircraft parts work like the buttons in the row: hover, focus, tap or Enter.
    dParts.forEach(function (g) {
      var i = Number(g.dataset.stage);
      g.addEventListener("mouseenter", function () { hovered = i; renderInfo(); });
      g.addEventListener("mouseleave", function () { hovered = null; renderInfo(); });
      g.addEventListener("focus", function () { hovered = i; renderInfo(); });
      g.addEventListener("blur", function () { hovered = null; renderInfo(); });
      g.addEventListener("click", function () { pinned = i; renderInfo(); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pinned = i; renderInfo(); }
      });
    });

    function listOf(items) {
      var ul = el("ul");
      items.forEach(function (x) { ul.appendChild(el("li", null, x)); });
      return ul;
    }

    function row(cls, label, content) {
      var d = el("div", cls);
      d.appendChild(el("dt", null, label));
      var dd = el("dd");
      dd.style.margin = "0";
      if (typeof content === "string") dd.textContent = content; else dd.appendChild(content);
      d.appendChild(dd);
      return d;
    }

    // Which part to describe: pointer or focus first, then a tapped part, then the one the fuel is in.
    function shownIndex() {
      if (hovered != null) return hovered;
      if (pinned != null) return pinned;
      return index >= 0 ? index : null;
    }

    function renderInfo() {
      var i = shownIndex();
      buttons.forEach(function (b, k) { b.classList.toggle("shown", k === i); });
      dParts.forEach(function (g) { g.classList.toggle("shown", Number(g.dataset.stage) === i); });
      info.textContent = "";
      if (i == null) {
        info.appendChild(el("p", "empty", "Hover over, tap or press Tab to a part to read its purpose, location, common faults and maintenance."));
        return;
      }
      var p = PARTS[i];
      var head = el("div", "head");
      head.appendChild(el("span", "ico", p.icon));
      head.appendChild(el("h3", null, p.name));
      head.appendChild(el("span", "chip", "Part " + (i + 1) + " of " + PARTS.length));
      info.appendChild(head);
      var dl = el("dl");
      dl.appendChild(row("", "Purpose", p.purpose));
      dl.appendChild(row("", "Location", p.location));
      dl.appendChild(row("fault", "Common faults", listOf(p.faults)));
      dl.appendChild(row("maint", "Maintenance considerations", listOf(p.maint)));
      info.appendChild(dl);
    }

    function paint() {
      buttons.forEach(function (b, i) {
        b.classList.toggle("active", i === index);
        b.classList.toggle("seen", i < index || (lapDone && i !== index));
        if (i === index) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      pipes.forEach(function (p, i) { p.classList.toggle("flow", lapDone || i < index); });
      dParts.forEach(function (g) {
        var s = Number(g.dataset.stage);
        g.classList.toggle("active", s === index);
        g.classList.toggle("seen", s < index || (lapDone && s !== index));
      });
      dPipes.forEach(function (p) { p.classList.toggle("flow", lapDone || Number(p.dataset.pipe) < index); });
      if (index < 0) caption.textContent = stepMode ? "Press Next step to follow the fuel." : "Press Start, or choose Step by step.";
      else caption.textContent = "Step " + (index + 1) + " of " + PARTS.length + ": " + PARTS[index].step;
      caption.className = "status " + (index === PARTS.length - 1 ? "good" : "mid");
      backBtn.disabled = !stepMode || index < 0;
      nextBtn.disabled = !stepMode || index >= PARTS.length - 1;
      startBtn.disabled = !!timer;
      stopBtn.disabled = !timer;
      renderInfo();
    }

    function tick() {
      if (index >= PARTS.length - 1) lapDone = true;
      index = (index + 1) % PARTS.length;
      paint();
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    function start() {
      if (stepMode) setMode(false);
      pinned = null;
      stop();
      if (index < 0) { tick(); }
      timer = setInterval(tick, STEP_MS);
      paint();
    }

    function resetFlow() { index = -1; lapDone = false; }

    function setMode(on) {
      stepMode = on;
      stop();
      resetFlow();
      pinned = null;
      modeBtn.setAttribute("aria-pressed", String(on));
      stepBtns.hidden = !on;
      paint();
    }

    startBtn.addEventListener("click", start);
    stopBtn.addEventListener("click", function () {
      // Stop pauses the animation and leaves the fuel where it is.
      stop();
      paint();
      caption.textContent = "Stopped. " + caption.textContent;
    });
    modeBtn.addEventListener("click", function () { setMode(!stepMode); });
    nextBtn.addEventListener("click", function () {
      pinned = null;
      if (index < PARTS.length - 1) { index++; paint(); }
    });
    backBtn.addEventListener("click", function () {
      pinned = null;
      if (index >= 0) { index--; lapDone = false; paint(); }
    });

    paint();
    // On a narrow screen the aircraft scrolls sideways. Start with the fuselage in view.
    var scroller = document.getElementById("fx-scroll");
    return {
      show: function () {
        requestAnimationFrame(function () { scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2; });
      },
      hide: function () { stop(); paint(); }
    };
  };
})();
