/* Page 9: Fuel System Troubleshooting Simulator.
 * Four steps per fault: observe, inspect, identify the cause, select the fix.
 * Points: observe 20, inspect 30, cause 25, fix 25 (max 100 per scenario). */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  // Inspection kinds: "useful" earns points, "waste" costs a little, "unsafe" costs more.
  var SCENARIOS = [
    {
      id: "fuel-leak", title: "Fuel leak", icon: "💦",
      intro: "A fuel smell and a wet patch under the right wing.",
      report: "After landing, the ground crew report a fuel smell and a wet patch on the ground under the right wing.",
      symptoms: [
        { t: "Wet patch and fuel smell under the right wing", rel: true, fb: "Fuel smell plus a wet patch means fuel. Treat it as a leak until proven otherwise." },
        { t: "The right fuel quantity fell faster than the left", rel: true, fb: "A real loss of fuel shows up as a faster fall. That points to a leak, not just a gauge fault." },
        { t: "A stain trail runs down the underside of a wing panel", rel: true, fb: "A stain trail is a map. Follow it back uphill to find where it starts." },
        { t: "The cabin lights are slightly dim", rel: false, fb: "Not related. Lighting has nothing to do with the fuel system." },
        { t: "The nose tyre pressure is a little low", rel: false, fb: "A real fault, but it is not linked to this fuel problem." },
        { t: "The radio has some static", rel: false, fb: "Unrelated. Do not let side issues distract you." }
      ],
      inspections: [
        { t: "Make the area safe, then follow the stain trail uphill to where it starts", k: "useful", r: "The trail starts at a fuel line union near the wing root.", fb: "Good. Make safe first, then trace to the highest wet point, because fuel runs downhill." },
        { t: "Check the fuel line union and its clamp", k: "useful", r: "The seal is cracked and the clamp is loose.", fb: "Well done. You have found the leak source." },
        { t: "Check the maintenance record for this area", k: "useful", r: "The union was disturbed during a job two days ago.", fb: "Smart. Recent work is a common cause of new leaks." },
        { t: "Check the cabin air filter", k: "waste", r: "The filter is fine and has no link to the fuel.", fb: "That was a waste of your time. Stay with the evidence." },
        { t: "Check the nose tyre pressure", k: "waste", r: "Pressure is a little low, but this is a separate matter.", fb: "Not relevant to this fault. Note it and move on." },
        { t: "Run the right boost pump to see where it drips", k: "unsafe", r: "Fuel sprays from the union. Pressure makes the leak worse.", fb: "Unsafe. Never pressurise a known leak. A running pump adds pressure and an ignition risk." }
      ],
      causes: [
        { t: "A worn seal and loose clamp at a fuel line union", ok: true, fb: "Correct. It fits every clue: the stain trail, the cracked seal and the recent work." },
        { t: "A failed boost pump", ok: false, fb: "No. A failed pump would give a pressure fault, not a wet patch." },
        { t: "Contaminated fuel", ok: false, fb: "No. Dirty fuel does not make fuel appear on the ground." },
        { t: "A faulty quantity probe", ok: false, fb: "No. A probe gives a wrong reading but does not put fuel on the ground. Here the fuel is really being lost." }
      ],
      actions: [
        { t: "Isolate and depressurise the line, replace the seal, refit and torque the clamp, leak-test and record it", k: "best", fb: "Excellent. That is the full job: make safe, fix, prove, record." },
        { t: "Tighten the clamp and release the aircraft", k: "partial", fb: "Not enough. The seal is cracked. Tightening does not cure that, and you did not prove the fix with a leak test." },
        { t: "Wipe the stain and release the aircraft", k: "bad", fb: "Never. This hides the fault and leaves an unsafe aircraft." },
        { t: "Run the engine to check the leak under full pressure", k: "bad", fb: "Unsafe. Never run a system with a known leak." }
      ],
      debrief: "A good fuel leak job follows one pattern: make safe, trace to the source, find the cause, repair, prove it with a leak test, record it."
    },
    {
      id: "pump-failure", title: "Pump failure", icon: "⚙️",
      intro: "A left boost pump low-pressure caution on climb.",
      report: "The crew report the LEFT BOOST PUMP low-pressure caution light came on during climb. The engine ran normally on the engine driven pump.",
      symptoms: [
        { t: "Left boost pump low-pressure caution light", rel: true, fb: "This is the main clue. It tells you which pump to look at." },
        { t: "Left pressure reads low, right pressure is normal", rel: true, fb: "A one-sided low pressure points at one pump, not the whole system." },
        { t: "No pump hum was heard when the pump was switched on", rel: true, fb: "No hum means the pump may not be turning at all." },
        { t: "The landing gear lights are all green", rel: false, fb: "Not related. Good to know, but it does not help here." },
        { t: "The cabin is slightly warm", rel: false, fb: "Unrelated to the fuel system." },
        { t: "The radio check was normal", rel: false, fb: "Unrelated. Concentrate on the pump." }
      ],
      inspections: [
        { t: "Switch the pump on (no fuel work going on) and listen and check for a pressure rise", k: "useful", r: "No hum and no pressure rise.", fb: "Good. A direct function test tells you what the pump is really doing." },
        { t: "Measure the supply voltage at the pump connector while it is switched on", k: "useful", r: "The correct voltage is present but the pump does not run.", fb: "Excellent. Power is arriving, so the fault is in the pump itself." },
        { t: "Test the right pump the same way for comparison", k: "useful", r: "The right pump hums and builds normal pressure.", fb: "Good thinking. A working twin is the best comparison." },
        { t: "Replace the left fuel filter", k: "waste", r: "Nothing changes. The filter was clean.", fb: "Not supported by the findings. A blocked filter would not stop the pump humming." },
        { t: "Check the tyre pressures", k: "waste", r: "Tyres are fine.", fb: "No link to the fault. Stay on the pump circuit." },
        { t: "Hold the circuit breaker in with a jumper wire", k: "unsafe", r: "Not done. This could overheat the wiring.", fb: "Unsafe. Never bypass a protective device. It can cause an electrical fire next to fuel." }
      ],
      causes: [
        { t: "A failed left boost pump (power arrives but it does not run)", ok: true, fb: "Correct. Power at the connector but no rotation means the pump motor has failed." },
        { t: "A blocked left filter", ok: false, fb: "No. A blocked filter would not stop the pump humming." },
        { t: "A fuel leak", ok: false, fb: "No. There was no wet patch or fuel loss in the symptoms." },
        { t: "A faulty low-pressure switch only", ok: false, fb: "No. The pump did not run when tested, so it is more than the switch." }
      ],
      actions: [
        { t: "Replace the left boost pump following the manual and tank safety rules, then test for pressure and leaks and record it", k: "best", fb: "Excellent. Replace, test and record. Remember tank safety rules when working on a pump inside a tank." },
        { t: "Reset the breaker and release for flight", k: "partial", fb: "Not enough. The pump is not working, so you are removing your back-up." },
        { t: "Disable the caution light and release", k: "bad", fb: "Never. Hiding a warning is not a repair." },
        { t: "Leave the pump as it is. The engine driven pump is enough", k: "bad", fb: "No. The boost pump is a required back-up. The aircraft is not serviceable." }
      ],
      debrief: "Compare a faulty unit with its working twin, and test whether power arrives before you blame the part."
    },
    {
      id: "quantity-indication", title: "Incorrect fuel quantity indication", icon: "📊",
      intro: "A left fuel gauge that reads 60% and never moves.",
      report: "The pilot reports the left fuel gauge reads 60% and did not change in flight. The right gauge moved normally. The amount refuelled did not match the gauge.",
      symptoms: [
        { t: "The left gauge reads 60% and does not change", rel: true, fb: "A reading that never moves is a classic sign of a sensor or wiring fault." },
        { t: "The right gauge changes normally", rel: true, fb: "Good clue. It shows the display system works and the fault is on the left." },
        { t: "The amount refuelled does not match the gauge change", rel: true, fb: "The gauge is not telling the truth, so you must check against a second source." },
        { t: "The tyre pressures are normal", rel: false, fb: "Unrelated to the fuel system." },
        { t: "The radio works", rel: false, fb: "Unrelated. It does not help you." },
        { t: "The cabin is warm", rel: false, fb: "Unrelated. Keep to the fuel indication." }
      ],
      inspections: [
        { t: "Compare the gauge with a dip or sight check of the real fuel", k: "useful", r: "The real fuel is only 25%. The gauge is wrong.", fb: "Excellent. A second source tells you whether the fuel or the gauge is wrong." },
        { t: "Check the quantity probe wiring and connector", k: "useful", r: "The connector is wet and corroded.", fb: "Good. Water and corrosion are common causes of wrong readings." },
        { t: "Run the gauge self-test as the manual says", k: "useful", r: "The left channel fails and shows a fixed value.", fb: "Good. Using the built-in test saves guessing." },
        { t: "Replace the fuel pump", k: "waste", r: "No change. The pump was never the problem.", fb: "A pump does not make a gauge stick. Follow the evidence." },
        { t: "Drain the whole tank to check the level", k: "waste", r: "A lot of work, and it tells you nothing the dip check did not.", fb: "That was a heavy way to do a simple check." },
        { t: "Turn the calibration screw until the gauge reads what you expect", k: "unsafe", r: "The gauge now looks right, but it is only hiding the fault.", fb: "Unsafe. Never adjust an indicator to hide a fault. The crew would trust a false reading." }
      ],
      causes: [
        { t: "A fault in the left quantity probe wiring (corroded connector)", ok: true, fb: "Correct. The fuel is fine. The measuring chain is faulty." },
        { t: "A real fuel leak", ok: false, fb: "No. There were no stains or smells and the gauge did not move at all." },
        { t: "A blocked filter", ok: false, fb: "No. A filter does not affect the quantity reading." },
        { t: "A blocked vent", ok: false, fb: "No. A vent problem would affect flow, not freeze a gauge." }
      ],
      actions: [
        { t: "Dry and clean or replace the connector or probe, then retest the gauge against a known fuel amount and record it", k: "best", fb: "Excellent. Fix, prove against a known amount, record." },
        { t: "Replace the cockpit gauge only", k: "partial", fb: "Not enough. The test pointed to the probe wiring, so the new gauge would show the same fault." },
        { t: "Adjust the pointer to match the right gauge", k: "bad", fb: "Never. That makes a false reading look right." },
        { t: "Release it. The pilot can use the right gauge", k: "bad", fb: "No. Each tank must be readable. The aircraft is not serviceable." }
      ],
      debrief: "When a reading is doubtful, check it against a second source first. Then work along the chain: probe, wiring, computer, gauge."
    },
    {
      id: "blocked-filter", title: "Blocked fuel filter", icon: "🧹",
      intro: "Low pressure and a filter caution at high power.",
      report: "The crew report falling fuel pressure and the FILTER caution light at high power, and the engine surged.",
      symptoms: [
        { t: "The FILTER caution light came on", rel: true, fb: "The aircraft is telling you where to look." },
        { t: "Fuel pressure falls at high power", rel: true, fb: "High power needs more flow. A partly blocked filter can only pass so much." },
        { t: "The engine surged at high power", rel: true, fb: "Starved of fuel, an engine will surge or lose power." },
        { t: "The canopy seal is dusty", rel: false, fb: "Unrelated. It is a cosmetic issue." },
        { t: "The cockpit lights are dim", rel: false, fb: "Unrelated to fuel flow." },
        { t: "The left tyre is worn", rel: false, fb: "Maybe a job for later, but not linked to this fault." }
      ],
      inspections: [
        { t: "Check the filter differential-pressure indicator", k: "useful", r: "The indicator has popped out.", fb: "Good. It shows the filter is restricting the flow." },
        { t: "Take a fuel sample from the tank sump drain", k: "useful", r: "The sample shows dirt and rust specks.", fb: "Excellent. It tells you where the dirt may come from." },
        { t: "Isolate the fuel and inspect the filter element", k: "useful", r: "The element is clogged with rust-coloured debris.", fb: "Good. Seeing the element tells you what blocked it." },
        { t: "Replace both boost pumps", k: "waste", r: "No change and many hours lost.", fb: "Pumps were working. Do not replace parts without evidence." },
        { t: "Check the fuel quantity probes", k: "waste", r: "Probes are fine.", fb: "Probes measure quantity, not flow." },
        { t: "Open the filter bowl while the system is still pressurised", k: "unsafe", r: "Not done. Fuel would spray out.", fb: "Unsafe. Always isolate and depressurise before opening any fuel component." }
      ],
      causes: [
        { t: "The filter is blocked by debris, probably rust or dirt from the tank or fuel supply", ok: true, fb: "Correct. The warning, the indicator and the clogged element all agree." },
        { t: "A failed shutoff valve", ok: false, fb: "No. A closed shutoff valve would give no fuel at all, not a drop at high power." },
        { t: "A probe fault", ok: false, fb: "No. A probe fault affects quantity readings, not pressure." },
        { t: "A tank vent that is open", ok: false, fb: "No. An open vent is normal." }
      ],
      actions: [
        { t: "Isolate and depressurise, replace the filter element, find and clear the dirt source, then retest and record it", k: "best", fb: "Excellent. You fixed the filter and the source of the dirt." },
        { t: "Replace the filter only and release", k: "partial", fb: "Not enough. The dirt came from somewhere. The new filter will block again." },
        { t: "Remove the filter and run without it", k: "bad", fb: "Never. Dirt would go straight into the engine." },
        { t: "Clean the old filter with a wire brush and refit it", k: "bad", fb: "No. Filters are replaced, not brushed. You could damage the element." }
      ],
      debrief: "A blocked filter is a symptom. Always ask where the dirt came from, or the next filter will block too."
    },
    {
      id: "transfer-failure", title: "Fuel transfer failure", icon: "🔄",
      intro: "Fuel is not moving from the centre tank to the wings.",
      report: "The wing tanks are getting low, but the centre tank still shows nearly full. The transfer valve light does not agree with the switch.",
      symptoms: [
        { t: "The centre tank quantity is not falling", rel: true, fb: "Fuel that does not move out of a tank points to a transfer fault." },
        { t: "The wing tanks are getting low", rel: true, fb: "The wings are using fuel but are not being refilled." },
        { t: "The transfer valve light shows closed when selected open", rel: true, fb: "The aircraft is telling you the valve is not where it should be." },
        { t: "The nose wheel steering feels heavy", rel: false, fb: "Unrelated to fuel transfer." },
        { t: "The oxygen gauge is slightly low", rel: false, fb: "Unrelated. A separate job." },
        { t: "The landing light is dim", rel: false, fb: "Unrelated. Keep your focus." }
      ],
      inspections: [
        { t: "Check the transfer valve position indicator and its electrical connector", k: "useful", r: "The connector is secure and the indicator reads closed.", fb: "Good. You have ruled out a simple connection fault." },
        { t: "Command the valve open on the ground and watch it", k: "useful", r: "The motor hums but the valve does not move.", fb: "Excellent. The motor works but the valve is stuck." },
        { t: "Check the transfer pump pressure when switched on", k: "useful", r: "Pump pressure is normal.", fb: "Good. The pump is fine, so look downstream at the valve." },
        { t: "Check the engine oil level", k: "waste", r: "Oil is fine.", fb: "Not relevant to fuel transfer." },
        { t: "Replace the centre tank quantity probes", k: "waste", r: "No change. The wings really are low.", fb: "The readings were right. Do not change parts without evidence." },
        { t: "Force the valve open with a wrench while powered", k: "unsafe", r: "Not done. This could break the valve or cause a spark.", fb: "Unsafe. Never force a powered valve. Isolate first." }
      ],
      causes: [
        { t: "The transfer valve is stuck closed because its drive failed", ok: true, fb: "Correct. The motor hums, the valve does not move, and the pump is fine." },
        { t: "A failed transfer pump", ok: false, fb: "No. Pump pressure was normal." },
        { t: "A faulty centre tank quantity probe", ok: false, fb: "No. The wing tanks really are low, so the readings are true." },
        { t: "A fuel leak", ok: false, fb: "No. There was no smell or stain, and the fuel is not leaving the centre tank." }
      ],
      actions: [
        { t: "Isolate, then repair or replace the transfer valve as the manual says, test transfer in both directions and record it", k: "best", fb: "Excellent. You repaired, proved and recorded." },
        { t: "Cycle the valve repeatedly until it moves", k: "partial", fb: "Not enough. It may free up for a moment, but it is still faulty and could stick again in flight." },
        { t: "Release the aircraft. The centre fuel can be left unused", k: "bad", fb: "No. Fuel the crew cannot use is dead weight and unbalances the aircraft." },
        { t: "Tape the transfer switch on", k: "bad", fb: "Never. This does not fix the valve and creates a new hazard." }
      ],
      debrief: "Work down the chain: switch, wiring, pump, valve. Find the first part that does not do its job."
    }
  ];

  var BADGES = {
    "safety-first": { icon: "⛑️", name: "Safety First", how: "Finish a scenario without an unsafe action" },
    "sharp-eyes": { icon: "👁️", name: "Sharp Eyes", how: "Get every symptom right" },
    "detective": { icon: "🕵️", name: "Detective", how: "Find the cause on the first try" },
    "master-fixer": { icon: "🔧", name: "Master Fixer", how: "Pick the best fix on the first try" },
    "perfect": { icon: "🏆", name: "Perfect Score", how: "Score 100 on a scenario" },
    "full-hangar": { icon: "⭐", name: "Full Hangar", how: "Complete all five scenarios" }
  };
  var RANKS = [
    { min: 0, name: "Trainee" }, { min: 100, name: "Apprentice" }, { min: 250, name: "Technician" },
    { min: 400, name: "Senior Technician" }, { min: 500, name: "Master Troubleshooter" }
  ];
  var STEP_NAMES = ["Observe", "Inspect", "Identify", "Fix"];
  var BUDGET = 4;

  FL.troubleshooting = SCENARIOS.map(function (s) { return { id: s.id, title: s.title }; });
  FL.troubleRank = rankFor;

  function rankFor(points) {
    var r = RANKS[0], next = null;
    RANKS.forEach(function (x) { if (points >= x.min) r = x; });
    RANKS.forEach(function (x) { if (!next && x.min > points) next = x; });
    return { name: r.name, base: r.min, next: next };
  }

  function stars(score) { return score >= 90 ? "★★★" : score >= 70 ? "★★☆" : score >= 40 ? "★☆☆" : "☆☆☆"; }

  FL.inits.simulator = function () {
    var pick = document.getElementById("sim-pick");
    var play = document.getElementById("sim-play");

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    function totals() {
      var sim = FL.store.get().sim;
      return SCENARIOS.reduce(function (n, s) { return n + (sim[s.id] || 0); }, 0);
    }

    function renderHud() {
      var pts = totals();
      var r = rankFor(pts);
      document.getElementById("ts-points").textContent = pts;
      document.getElementById("ts-rank").textContent = r.name;
      var span = r.next ? r.next.min - r.base : 1;
      document.getElementById("ts-rankbar").style.width = (r.next ? (pts - r.base) / span * 100 : 100) + "%";
      document.getElementById("ts-next").textContent = r.next ? (r.next.min - pts) + " more points to reach " + r.next.name + "." : "Top rank reached. Well done!";
      var box = document.getElementById("ts-badges");
      var have = FL.store.get().badges || [];
      box.textContent = "";
      Object.keys(BADGES).forEach(function (id) {
        var b = BADGES[id];
        var chip = el("span", "ts-badge" + (have.indexOf(id) >= 0 ? " got" : ""), b.icon + " " + b.name);
        chip.title = b.how;
        chip.setAttribute("aria-label", b.name + (have.indexOf(id) >= 0 ? " (earned)" : " (locked): " + b.how));
        box.appendChild(chip);
      });
    }

    function menu() {
      pick.hidden = false;
      play.hidden = true;
      pick.textContent = "";
      var sim = FL.store.get().sim;
      SCENARIOS.forEach(function (s, i) {
        var c = el("div", "card");
        c.appendChild(el("span", "chip", "Fault " + (i + 1)));
        var h = el("h3");
        h.appendChild(el("span", "icon", s.icon));
        h.appendChild(document.createTextNode(s.title));
        c.appendChild(h);
        c.appendChild(el("p", null, s.intro));
        var done = sim[s.id] != null;
        c.appendChild(el("p", "ts-stars", done ? stars(sim[s.id]) + "  Best: " + sim[s.id] + " / 100" : "☆☆☆  Not tried yet"));
        var b = el("button", "btn", done ? "Play again" : "Start");
        b.style.display = "block";
        b.addEventListener("click", function () { run(s); });
        c.appendChild(b);
        pick.appendChild(c);
      });
      renderHud();
    }

    // One scenario run.
    function run(sc) {
      pick.hidden = true;
      play.hidden = false;
      var ctx = { sym: 0, insp: 0, cause: 0, act: 0, unsafe: 0, useful: 0, causeTries: 0, actTries: 0 };

      function total() { return Math.max(0, Math.min(100, ctx.sym + ctx.insp + ctx.cause + ctx.act)); }

      // Shared frame: header, step tracker and running score. Returns the content area.
      function frame(stepNo) {
        play.textContent = "";
        var panel = el("div", "panel");
        var top = el("div", "ts-top");
        var h = el("h3", null, sc.icon + " " + sc.title);
        h.style.margin = "0";
        top.appendChild(h);
        var score = el("div", "ts-score");
        score.appendChild(document.createTextNode("Scenario score "));
        var num = el("b", null, String(total()));
        num.id = "ts-run";
        score.appendChild(num);
        score.appendChild(document.createTextNode(" / 100"));
        top.appendChild(score);
        panel.appendChild(top);
        var tr = el("ol", "ts-steps");
        STEP_NAMES.forEach(function (n, i) {
          var li = el("li", i + 1 < stepNo ? "done" : i + 1 === stepNo ? "now" : "", (i + 1) + ". " + n);
          if (i + 1 === stepNo) li.setAttribute("aria-current", "step");
          tr.appendChild(li);
        });
        panel.appendChild(tr);
        var body = el("div");
        panel.appendChild(body);
        play.appendChild(panel);
        return body;
      }

      function refreshScore(delta) {
        var n = document.getElementById("ts-run");
        if (!n) return;
        n.textContent = String(total());
        if (delta) {
          var pop = el("span", "ts-pop " + (delta > 0 ? "up" : "down"), (delta > 0 ? "+" : "") + delta);
          n.parentNode.appendChild(pop);
          setTimeout(function () { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 1200);
        }
      }

      function coach(text, kind) {
        var c = el("div", "coach " + kind);
        c.appendChild(el("strong", null, "🧑‍🏫 Instructor: "));
        c.appendChild(document.createTextNode(text));
        return c;
      }

      function nextBtn(label, fn) {
        var b = el("button", "btn", label);
        b.style.marginTop = ".8rem";
        b.addEventListener("click", fn);
        return b;
      }

      /* Step 1: observe symptoms (tick all that help) */
      function stepObserve() {
        var body = frame(1);
        body.appendChild(el("h4", null, "Step 1 · Observe symptoms"));
        var report = el("p", "ts-report");
        report.appendChild(el("b", null, "Report: "));
        report.appendChild(document.createTextNode(sc.report));
        body.appendChild(report);
        body.appendChild(el("p", null, "Tick every symptom that helps you find the fault. Some are not related."));
        var list = el("div", "choice-list");
        var chosen = sc.symptoms.map(function () { return false; });
        var btns = sc.symptoms.map(function (sy, i) {
          var wrap = el("div");
          var b = el("button", "choice", sy.t);
          b.setAttribute("aria-pressed", "false");
          b.addEventListener("click", function () {
            chosen[i] = !chosen[i];
            b.setAttribute("aria-pressed", String(chosen[i]));
            b.classList.toggle("picked", chosen[i]);
          });
          wrap.appendChild(b);
          list.appendChild(wrap);
          return { b: b, wrap: wrap };
        });
        body.appendChild(list);
        var check = el("button", "btn amber", "Check my answers");
        body.appendChild(check);
        var out = el("div");
        body.appendChild(out);
        check.addEventListener("click", function () {
          check.disabled = true;
          var right = 0, wrong = 0, missed = 0, relCount = 0;
          sc.symptoms.forEach(function (sy, i) {
            var b = btns[i].b;
            b.disabled = true;
            b.classList.remove("picked");
            var verdict;
            if (sy.rel) { relCount++; }
            if (sy.rel && chosen[i]) { right++; b.classList.add("correct"); verdict = "Spotted. "; }
            else if (sy.rel) { missed++; b.classList.add("missed"); verdict = "Missed. "; }
            else if (chosen[i]) { wrong++; b.classList.add("incorrect"); verdict = "Not related. "; }
            else verdict = "Correctly left out. ";
            btns[i].wrap.appendChild(el("p", "ts-note", verdict + sy.fb));
          });
          ctx.sym = Math.max(0, Math.min(20, Math.round((right - wrong) / relCount * 20)));
          ctx.symFull = right === relCount && wrong === 0;
          refreshScore(ctx.sym);
          var msg = ctx.symFull ? "Sharp eyes. You picked every useful symptom and left the noise alone. A clear picture of the symptoms saves time later."
            : "You found " + right + " of " + relCount + " useful symptoms" + (wrong ? " and picked " + wrong + " that are not related" : "") + ". A technician must separate real clues from noise, so read each report carefully.";
          out.appendChild(coach(msg, ctx.symFull ? "good" : "mid"));
          out.appendChild(nextBtn("Step 2: inspect the system →", stepInspect));
        });
      }

      /* Step 2: inspect (limited number of checks) */
      function stepInspect() {
        var body = frame(2);
        body.appendChild(el("h4", null, "Step 2 · Inspect the system"));
        body.appendChild(el("p", null, "You have time for " + BUDGET + " checks. Choose wisely. Some checks waste time and some are unsafe."));
        var counter = el("p", "qprog", "Checks used: 0 of " + BUDGET);
        counter.setAttribute("aria-live", "polite");
        body.appendChild(counter);
        var list = el("div", "choice-list");
        var used = 0, raw = 0;
        var btns = [];
        var done = el("button", "btn", "Step 3: identify the cause →");
        done.hidden = true;
        done.style.marginTop = ".8rem";

        sc.inspections.forEach(function (ins) {
          var wrap = el("div");
          var b = el("button", "choice", ins.t);
          b.addEventListener("click", function () {
            used++;
            b.disabled = true;
            var delta;
            if (ins.k === "useful") { ctx.useful++; delta = ctx.useful <= 3 ? 10 : 0; b.classList.add("correct"); }
            else if (ins.k === "waste") { delta = -5; b.classList.add("incorrect"); }
            else { delta = -15; ctx.unsafe++; b.classList.add("incorrect"); }
            raw += delta;
            ctx.insp = Math.max(0, Math.min(30, raw));
            refreshScore(delta);
            wrap.appendChild(el("p", "ts-note", "Finding: " + ins.r));
            wrap.appendChild(coach(ins.fb, ins.k === "useful" ? "good" : "bad"));
            counter.textContent = "Checks used: " + used + " of " + BUDGET;
            if (used >= BUDGET) btns.forEach(function (x) { x.disabled = true; });
            if (ctx.useful >= 2 || used >= BUDGET) done.hidden = false;
          });
          btns.push(b);
          wrap.appendChild(b);
          list.appendChild(wrap);
        });
        body.appendChild(list);
        done.addEventListener("click", function () {
          ctx.inspOk = ctx.unsafe === 0 && ctx.useful >= 2;
          stepCause();
        });
        body.appendChild(done);
      }

      /* Steps 3 and 4 share one shape: pick one answer, wrong picks can be retried. */
      function choiceStep(stepNo, title, prompt, options, isBest, onDone) {
        var body = frame(stepNo);
        body.appendChild(el("h4", null, title));
        body.appendChild(el("p", null, prompt));
        var opts = el("div", "choice-list");
        var out = el("div");
        var tries = 0;
        options.forEach(function (o) {
          var wrap = el("div");
          var b = el("button", "choice", o.t);
          b.addEventListener("click", function () {
            var ok = isBest(o);
            b.disabled = true;
            b.classList.add(ok ? "correct" : "incorrect");
            out.textContent = "";
            out.appendChild(coach((ok ? "" : (o.k === "partial" ? "Not quite enough. " : "Not this one. ")) + o.fb + (ok ? "" : " Try again."), ok ? "good" : (o.k === "partial" ? "mid" : "bad")));
            if (!ok) { tries++; return; }
            opts.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
            onDone(tries, out);
          });
          wrap.appendChild(b);
          opts.appendChild(wrap);
        });
        body.appendChild(opts);
        body.appendChild(out);
      }

      function stepCause() {
        choiceStep(3, "Step 3 · Identify the probable cause", "Using your symptoms and findings, what is the most likely cause?", sc.causes,
          function (o) { return o.ok; },
          function (tries, out) {
            ctx.causeTries = tries;
            ctx.cause = Math.max(5, 25 - 10 * tries);
            refreshScore(ctx.cause);
            out.appendChild(nextBtn("Step 4: select the corrective action →", stepFix));
          });
      }

      function stepFix() {
        choiceStep(4, "Step 4 · Select the corrective action", "What is the right way to put this right?", sc.actions,
          function (o) { return o.k === "best"; },
          function (tries, out) {
            ctx.actTries = tries;
            ctx.act = Math.max(5, 25 - 10 * tries);
            refreshScore(ctx.act);
            out.appendChild(nextBtn("See my debrief →", finish));
          });
      }

      function finish() {
        var score = total();
        var before = FL.store.get().badges || [];
        FL.store.setSim(sc.id, score);

        var earned = [];
        if (ctx.unsafe === 0) earned.push("safety-first");
        if (ctx.symFull) earned.push("sharp-eyes");
        if (ctx.causeTries === 0) earned.push("detective");
        if (ctx.actTries === 0) earned.push("master-fixer");
        if (score === 100) earned.push("perfect");
        if (SCENARIOS.every(function (s) { return FL.store.get().sim[s.id] != null; })) earned.push("full-hangar");
        earned.forEach(function (id) { FL.store.addBadge(id); });
        var fresh = earned.filter(function (id) { return before.indexOf(id) < 0; });

        if (window.Tracker) {
          var answers = [
            { q: "Troubleshooting · " + sc.title + ": observe symptoms", topic: sc.title, correct: !!ctx.symFull },
            { q: "Troubleshooting · " + sc.title + ": inspect safely", topic: sc.title, correct: !!ctx.inspOk },
            { q: "Troubleshooting · " + sc.title + ": identify cause", topic: sc.title, correct: ctx.causeTries === 0 },
            { q: "Troubleshooting · " + sc.title + ": corrective action", topic: sc.title, correct: ctx.actTries === 0 }
          ];
          Tracker.quizResult(answers.filter(function (a) { return a.correct; }).length, answers.length, answers);
        }

        var body = frame(4);
        body.textContent = "";
        body.appendChild(el("h4", null, "Debrief: " + sc.title));
        body.appendChild(el("p", "ts-stars big", stars(score) + "  " + score + " / 100"));
        var table = el("div", "table-wrap");
        var t = el("table");
        [["Observe symptoms", ctx.sym, 20], ["Inspect the system", ctx.insp, 30], ["Identify the cause", ctx.cause, 25], ["Corrective action", ctx.act, 25]].forEach(function (r) {
          var tr = el("tr");
          tr.appendChild(el("td", null, r[0]));
          tr.appendChild(el("td", null, r[1] + " / " + r[2]));
          t.appendChild(tr);
        });
        table.appendChild(t);
        body.appendChild(table);
        var verdict = score >= 90 ? "Outstanding work. That is how a careful technician works."
          : score >= 70 ? "Good job. A few points to tighten up, but you got there safely."
          : score >= 40 ? "You got there in the end. Slow down, use the evidence and avoid unsafe shortcuts."
          : "This one needs another go. Read each clue carefully and stay safe.";
        body.appendChild(coach(verdict + " " + sc.debrief, score >= 70 ? "good" : "mid"));
        if (fresh.length) {
          var nb = el("p", "ts-newbadge");
          nb.appendChild(el("b", null, "New badge" + (fresh.length > 1 ? "s" : "") + ": "));
          nb.appendChild(document.createTextNode(fresh.map(function (id) { return BADGES[id].icon + " " + BADGES[id].name; }).join("  ")));
          body.appendChild(nb);
        }
        var row = el("div", "row");
        row.style.marginTop = ".8rem";
        var again = el("button", "btn alt", "Play again");
        again.addEventListener("click", function () { run(sc); });
        var back = el("button", "btn", "Choose another fault");
        back.addEventListener("click", menu);
        row.appendChild(again); row.appendChild(back);
        body.appendChild(row);
        renderHud();
        if (FL.refreshProgress) FL.refreshProgress();
      }

      stepObserve();
    }

    menu();
    return { show: renderHud };
  };
})();
