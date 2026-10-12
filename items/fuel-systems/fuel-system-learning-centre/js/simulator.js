/* Page 9: Fuel Leak Troubleshooting Simulator. */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  // kind: "good" = a sensible clue-gathering or safety action, "bad" = unsafe.
  var SCENARIOS = [
    {
      id: "wet-patch", title: "Wet patch under the wing",
      report: "On the walk-around you find a wet patch on the ground under the left wing tank access panel.",
      actions: [
        { t: "Keep people and ignition sources away and put up a warning sign", kind: "good", r: "Good. Making the area safe comes first." },
        { t: "Smell and look at the liquid", kind: "good", r: "It smells like fuel and is straw coloured. It is not water or red hydraulic fluid." },
        { t: "Open the panel and follow the wet trail upward", kind: "good", r: "The stain trail starts at the panel edge. The sealant there looks cracked." },
        { t: "Check the maintenance records for this panel", kind: "good", r: "The panel was removed and refitted two days ago." },
        { t: "Start the engine to see if the leak gets worse", kind: "bad", r: "Unsafe! Running systems near a leak adds ignition and pressure risks." },
        { t: "Wipe it up and carry on. It is only a small patch", kind: "bad", r: "Unsafe! Hiding a leak does not fix it, and it may be a running leak." }
      ],
      causes: [
        { t: "Cracked or worn sealant around the access panel", ok: true },
        { t: "Engine oil leak", ok: false },
        { t: "Rain water", ok: false },
        { t: "Hydraulic fluid leak", ok: false }
      ],
      fix: "Make safe, drain the tank as the manual says, remove old sealant, reseal, let it cure, test for leaks and record the work."
    },
    {
      id: "fuel-smell", title: "Fuel smell in the engine bay",
      report: "The crew reports a strong fuel smell near the engine after shutdown.",
      actions: [
        { t: "Make sure aircraft power is OFF and tag the switches", kind: "good", r: "Good. Removing power removes ignition sources." },
        { t: "Look along the fuel pipes with an approved safe torch", kind: "good", r: "There is a wet shine on a fuel pipe joint near the engine." },
        { t: "Check the joint clamp and seal", kind: "good", r: "The seal at the joint is cracked and the clamp is loose." },
        { t: "Check the filter housing for wetness", kind: "good", r: "The filter housing is dry." },
        { t: "Switch on the boost pump to see where it drips", kind: "bad", r: "Unsafe! A pump may spark and will push more fuel out of the leak." },
        { t: "Tighten the fitting while the line is still full and under pressure", kind: "bad", r: "Unsafe! Never work on a pressurised fuel line. Isolate and depressurise first." }
      ],
      causes: [
        { t: "Worn seal and loose clamp at a pipe joint", ok: true },
        { t: "Blocked fuel filter", ok: false },
        { t: "Faulty quantity probe", ok: false },
        { t: "Blocked vent", ok: false }
      ],
      fix: "Isolate and depressurise the line, replace the seal, refit and torque the clamp, test for leaks and record the work."
    },
    {
      id: "falling-quantity", title: "Fuel quantity falls too fast",
      report: "A pilot says the fuel gauge fell faster than normal. After landing there is a fuel smell near the lower wing.",
      actions: [
        { t: "Dip or sight-check the tank to compare with the gauge", kind: "good", r: "The real quantity matches the gauge, so fuel really is being lost." },
        { t: "Make the area safe and keep ignition sources away", kind: "good", r: "Good. Always do this before an inspection." },
        { t: "Look under the wing for drips", kind: "good", r: "Fuel is dripping slowly from the tank drain valve." },
        { t: "Inspect the drain valve seal", kind: "good", r: "There is grit on the seal, so the valve is not closing fully." },
        { t: "Ignore it as a gauge problem and release the aircraft", kind: "bad", r: "Unsafe! The check showed the gauge is right. A real leak must be fixed." },
        { t: "Empty the tank into an open drum inside the hangar", kind: "bad", r: "Unsafe! Fuel must only be defuelled with approved equipment, in the right place." }
      ],
      causes: [
        { t: "Water drain valve not sealing because of dirt on the seal", ok: true },
        { t: "Fuel gauge fault", ok: false },
        { t: "Blocked fuel filter", ok: false },
        { t: "Fuel vent is open", ok: false }
      ],
      fix: "Defuel as required, clean or replace the valve seal, refit, refuel, check for leaks and record the work."
    }
  ];

  FL.inits.simulator = function () {
    var pick = document.getElementById("sim-pick");
    var play = document.getElementById("sim-play");

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    function menu() {
      pick.hidden = false;
      play.hidden = true;
      pick.textContent = "";
      var best = FL.store.get().sim;
      SCENARIOS.forEach(function (s, i) {
        var c = el("div", "card");
        c.appendChild(el("h3", null, (i + 1) + ". " + s.title));
        c.appendChild(el("p", null, s.report));
        c.appendChild(el("p", "chip", best[s.id] != null ? "Best score: " + best[s.id] : "Not tried yet"));
        var b = el("button", "btn", "Start");
        b.style.display = "block";
        b.style.marginTop = ".6rem";
        b.addEventListener("click", function () { run(s); });
        c.appendChild(b);
        pick.appendChild(c);
      });
    }

    function run(s) {
      pick.hidden = true;
      play.hidden = false;
      play.textContent = "";
      var score = 100, clues = 0, tried = {};
      var report = el("div", "panel");
      report.appendChild(el("h3", null, s.title));
      report.appendChild(el("p", null, s.report));
      var meter = el("div", "meter");
      meter.appendChild(el("span", null, "Score"));
      var bar = el("div", "bar"); var barFill = el("i"); bar.appendChild(barFill); meter.appendChild(bar);
      var num = el("span", null, "100");
      meter.appendChild(num);
      report.appendChild(meter);
      play.appendChild(report);

      play.appendChild(el("h3", null, "1. Choose your actions"));
      var list = el("div", "choice-list");
      var log = el("div", "log");
      log.setAttribute("aria-live", "polite");
      function paint() { barFill.style.width = score + "%"; num.textContent = String(score); }

      s.actions.forEach(function (a, i) {
        var b = el("button", "choice", a.t);
        b.addEventListener("click", function () {
          if (tried[i]) return;
          tried[i] = true;
          b.disabled = true;
          b.classList.add(a.kind === "good" ? "correct" : "incorrect");
          if (a.kind === "good") clues++; else score = Math.max(0, score - 25);
          log.appendChild(el("div", "entry " + (a.kind === "good" ? "good" : "bad"), a.r));
          paint();
          diag.disabled = clues < 2;
          note.textContent = clues < 2 ? "Gather at least two safe clues before you decide." : "";
        });
        list.appendChild(b);
      });
      play.appendChild(list);
      play.appendChild(el("h3", null, "What you found"));
      play.appendChild(log);

      play.appendChild(el("h3", null, "2. Decide the cause"));
      var note = el("p", "qprog", "Gather at least two safe clues before you decide.");
      play.appendChild(note);
      var diag = el("button", "btn amber", "I am ready to decide");
      diag.disabled = true;
      play.appendChild(diag);
      var causeBox = el("div", "choice-list");
      play.appendChild(causeBox);
      var end = el("div");
      play.appendChild(end);

      diag.addEventListener("click", function () {
        diag.hidden = true;
        s.causes.forEach(function (c) {
          var b = el("button", "choice", c.t);
          b.addEventListener("click", function () {
            causeBox.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
            if (c.ok) b.classList.add("correct");
            else { b.classList.add("incorrect"); score = Math.max(0, score - 20); }
            paint();
            finish(c.ok);
          });
          causeBox.appendChild(b);
        });
      });

      function finish(ok) {
        FL.store.setSim(s.id, score);
        var f = el("div", "feedback " + (ok ? "good" : "bad"));
        f.appendChild(el("p", null, ok ? "Correct diagnosis! Final score: " + score + "." : "That was not the cause. The correct answer was: " + s.causes.filter(function (c) { return c.ok; })[0].t + ". Final score: " + score + "."));
        f.appendChild(el("p", null, "Repair: " + s.fix));
        end.appendChild(f);
        var row = el("div", "row");
        row.style.marginTop = ".8rem";
        var again = el("button", "btn alt", "Try again");
        again.addEventListener("click", function () { run(s); });
        var back = el("button", "btn", "Choose another scenario");
        back.addEventListener("click", menu);
        row.appendChild(again); row.appendChild(back);
        end.appendChild(row);
      }
      paint();
    }

    menu();
  };
})();
