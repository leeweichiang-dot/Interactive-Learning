/* Page 10: Assessment. 20 questions (multiple choice, drag and drop, matching, sequencing),
 * three difficulty levels, instant feedback, 80% pass mark.
 * Scores are saved in localStorage and reported to the portal tracker. */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  var PASS = 80;
  var LEVELS = ["Easy", "Medium", "Hard"];
  var TYPES = { mc: "Multiple choice", drag: "Drag and drop", match: "Match components", seq: "Sequence fuel flow" };

  // Questions run Easy, then Medium, then Hard. Keep each `q` text unique and stable:
  // the portal scores a question by its latest answer.
  var QUESTIONS = [
    /* ---- Easy ---- */
    { type: "mc", level: "Easy", topic: "Purpose", q: "What is the main job of an aircraft fuel system?",
      o: ["Store fuel and deliver it to the engine", "Make electricity", "Cool the cabin", "Measure airspeed"], a: 0,
      why: "The fuel system stores fuel and supplies it to the engine at the right pressure." },
    { type: "mc", level: "Easy", topic: "Components", q: "What does a fuel filter do?",
      o: ["Pushes fuel along the pipes", "Catches dirt and rust", "Shows the fuel level", "Lets air into the tank"], a: 1,
      why: "A filter catches dirt and rust so that only clean fuel reaches the engine." },
    { type: "mc", level: "Easy", topic: "Safety", q: "Which of these must be kept away from fuel work?",
      o: ["Sparks, flames and phones", "A fire extinguisher", "Warning signs", "A bonding wire"], a: 0,
      why: "Fuel vapour can be ignited by a small spark. Extinguishers, signs and bonding wires make the job safer." },
    { type: "mc", level: "Easy", topic: "Indication", q: "What does the LOW FUEL light tell the crew?",
      o: ["Fuel is getting low, so plan to land", "The tank is full", "A pump has failed", "The vent is blocked"], a: 0,
      why: "The light comes on when fuel falls below a set level. The crew must plan to land." },
    { type: "mc", level: "Easy", topic: "Purpose", q: "Why does a fuel tank need a vent?",
      o: ["To let air in and out as the fuel level changes", "To heat the fuel", "To measure the fuel", "To clean the fuel"], a: 0,
      why: "Without a vent, the tank could be crushed as fuel leaves, or burst as it is filled." },
    { type: "drag", level: "Easy", topic: "Components", q: "Drag each part into the group it belongs to.",
      buckets: ["Stores fuel", "Moves fuel"],
      items: [["Wing tank", 0], ["Centre tank", 0], ["Boost pump", 1], ["Transfer pump", 1]],
      why: "Tanks store the fuel. Pumps move it from place to place." },
    { type: "match", level: "Easy", topic: "Components", q: "Match each component to its job.",
      pairs: [["Fuel tank", "Stores the fuel"], ["Fuel filter", "Catches dirt"], ["Boost pump", "Pushes fuel toward the engine"], ["Vent", "Lets the tank breathe"]],
      why: "Each part has one clear job: tanks store, filters clean, pumps push, vents let air in and out." },

    /* ---- Medium ---- */
    { type: "mc", level: "Medium", topic: "Indication", q: "How does a fuel quantity probe sense the amount of fuel?",
      o: ["By how much of the probe is covered by fuel", "By the colour of the fuel", "By the weight of the aircraft", "By the speed of the fuel"], a: 0,
      why: "Fuel and air affect a small electric signal differently, so more fuel around the probe gives a bigger signal." },
    { type: "mc", level: "Medium", topic: "Transfer", q: "Why is fuel moved between tanks in flight?",
      o: ["To keep the aircraft balanced and the feed tank supplied", "To make the fuel colder", "To clean the filter", "To test the vent"], a: 0,
      why: "Transfer keeps the weight balanced left and right and keeps the engine's feed tank full." },
    { type: "mc", level: "Medium", topic: "Refuelling", q: "What must be done before the refuelling hose is connected?",
      o: ["Bond (earth) the aircraft and the fuel equipment", "Start the fuel flow", "Switch on all aircraft power", "Fill the tanks to the top"], a: 0,
      why: "Bonding makes both items the same electric level, so a static spark cannot jump between them." },
    { type: "mc", level: "Medium", topic: "Troubleshooting", q: "A boost pump shows low pressure and no hum, but power reaches its connector. What is the most likely cause?",
      o: ["The pump motor has failed", "A blocked vent", "A dirty gauge glass", "The wrong fuel"], a: 0,
      why: "Power arriving but no movement points to the pump itself, not the supply." },
    { type: "drag", level: "Medium", topic: "Safety", q: "Drag each action into Safe or Unsafe.",
      buckets: ["Safe", "Unsafe"],
      items: [["Bond the aircraft before refuelling", 0], ["Report a small leak at once", 0], ["Keep a fire extinguisher ready", 0], ["Use a phone near the fuel coupling", 1], ["Run a boost pump dry", 1], ["Wipe up a leak and carry on", 1]],
      why: "Safe habits remove ignition sources and report faults. Phones, dry running and hiding leaks all create danger." },
    { type: "match", level: "Medium", topic: "Troubleshooting", q: "Match each symptom to its most likely cause.",
      pairs: [["Engine surges at high power with a FILTER caution", "Blocked fuel filter"], ["Wet patch and fuel smell under the wing", "Fuel leak at a seal"], ["Gauge stuck while the real fuel changes", "Probe or wiring fault"], ["Fuel will not leave the centre tank", "Stuck transfer valve"]],
      why: "Each symptom points at a part. Matching the symptom to the part is the heart of troubleshooting." },
    { type: "seq", level: "Medium", topic: "Fuel flow", q: "Put the fuel flow in order, from the tank to the engine.",
      steps: ["Fuel tank", "Boost pump", "Fuel filter", "Fuel control unit", "Engine"],
      why: "Fuel is stored in the tank, pushed by the pump, cleaned by the filter, measured by the fuel control unit, then burned in the engine." },

    /* ---- Hard ---- */
    { type: "mc", level: "Hard", topic: "Indication", q: "The cockpit reads 60% but the tank really holds 10%. Why is this so dangerous?",
      o: ["The low fuel warning follows the wrong reading and stays off", "The fuel will freeze", "The pump will overheat", "The vent will block"], a: 0,
      why: "The warning lights use the reading. A wrong reading can hide a real fuel shortage." },
    { type: "mc", level: "Hard", topic: "Safety", q: "Why is a fuel tank treated as a confined space?",
      o: ["It can hold fumes and little air, so only trained people may enter with a permit and an observer", "It is too hot to enter", "It is always full of fuel", "It is too small to see into"], a: 0,
      why: "Fuel fumes can overcome a person quickly. Entry needs training, a permit, an observer and a purged, tested tank." },
    { type: "mc", level: "Hard", topic: "Troubleshooting", q: "You find a damp fuel stain on a wing. What comes first?",
      o: ["Make the area safe, keep ignition sources away and report it", "Wipe it off to see if it returns", "Run the pumps to see where it comes from", "Take a photo and carry on"], a: 0,
      why: "Make safe first, then trace and report. Running pumps adds pressure and ignition risk." },
    { type: "drag", level: "Hard", topic: "Troubleshooting", q: "Drag each symptom to the part most likely at fault.",
      buckets: ["Boost pump", "Fuel filter", "Quantity probe"],
      items: [["Pump caution light and no hum", 0], ["Low pressure on one side, no hum", 0], ["Filter caution at high power", 1], ["Rust specks on the element", 1], ["Gauge stuck at 60%", 2], ["Corroded probe connector", 2]],
      why: "A pump that is silent is the pump. Filter warnings and rust point to the filter. A stuck reading and corrosion point to the probe." },
    { type: "match", level: "Hard", topic: "Components", q: "Match each component to where it is found.",
      pairs: [["Boost pump", "Inside the tank, near the bottom"], ["Engine driven pump", "On the engine accessory gearbox"], ["Quantity probe", "Inside the tank, from bottom to top"], ["Fuel control unit", "On or near the engine"], ["Vent outlet", "On the outside of the aircraft, often near the wing tip"]],
      why: "Knowing where a part lives tells you where to look for faults." },
    { type: "seq", level: "Hard", topic: "Refuelling", q: "Put the refuelling steps in the correct order.",
      steps: ["Park in the approved area and chock the wheels", "Check the extinguisher and remove ignition sources", "Connect the bonding wire", "Connect the hose to the refuel coupling", "Start the flow slowly and watch for leaks", "Stop the flow, disconnect the hose and cap the coupling", "Remove the bonding wire last, sample and record"],
      why: "Safety checks and bonding come before any fuel moves. The bonding wire is the first thing connected and the last thing removed." }
  ];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // The right answer in words, shown when a question is missed.
  function answerText(q) {
    if (q.type === "mc") return q.o[q.a];
    if (q.type === "drag") return q.items.map(function (it) { return it[0] + " → " + q.buckets[it[1]]; }).join("; ");
    if (q.type === "match") return q.pairs.map(function (p) { return p[0] + " → " + p[1]; }).join("; ");
    return q.steps.map(function (s, i) { return (i + 1) + ". " + s; }).join("  ");
  }

  /* ---- Question widgets. Each builds its controls and calls done(correct) once, when answered. ---- */

  function buildMc(q, done) {
    var list = el("div", "choice-list");
    q.o.forEach(function (text, i) {
      var b = el("button", "choice", text);
      b.addEventListener("click", function () {
        list.querySelectorAll("button").forEach(function (x, k) { x.disabled = true; if (k === q.a) x.classList.add("correct"); });
        if (i !== q.a) b.classList.add("incorrect");
        done(i === q.a);
      });
      list.appendChild(b);
    });
    return list;
  }

  function buildDrag(q, done) {
    var wrap = el("div");
    wrap.appendChild(el("p", "hint", "Drag an item into a box, or tap an item and then tap the box. Tap a placed item to take it back."));
    var order = shuffle(q.items.map(function (_, i) { return i; }));
    var placed = q.items.map(function () { return -1; });
    var selected = null, locked = false;
    var pool = el("div", "dz-items dz-pool");
    pool.setAttribute("aria-label", "Items to place");
    var zones = el("div", "dz-wrap");
    var buttons = [];
    var bucketEls = q.buckets.map(function (name, bi) {
      var z = el("div", "dz");
      z.appendChild(el("h4", null, name));
      var items = el("div", "dz-items");
      z.appendChild(items);
      var place = el("button", "btn alt dz-place", "Place here");
      place.addEventListener("click", function () { if (selected != null) put(selected, bi); });
      z.appendChild(place);
      z.addEventListener("dragover", function (e) { if (!locked) e.preventDefault(); });
      z.addEventListener("drop", function (e) {
        e.preventDefault();
        var n = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (!locked && !isNaN(n)) put(n, bi);
      });
      zones.appendChild(z);
      return items;
    });
    pool.addEventListener("dragover", function (e) { if (!locked) e.preventDefault(); });
    pool.addEventListener("drop", function (e) {
      e.preventDefault();
      var n = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (!locked && !isNaN(n)) put(n, -1);
    });

    function put(i, bi) { placed[i] = bi; selected = null; render(); }

    order.forEach(function (i) {
      var b = el("button", "chip-item", q.items[i][0]);
      b.draggable = true;
      b.addEventListener("dragstart", function (e) { e.dataTransfer.setData("text/plain", String(i)); });
      b.addEventListener("click", function () {
        if (locked) return;
        if (placed[i] >= 0) { put(i, -1); return; }
        selected = selected === i ? null : i;
        render();
      });
      buttons[i] = b;
    });

    var check = el("button", "btn amber", "Check my answer");
    check.disabled = true;
    function render() {
      order.forEach(function (i) {
        (placed[i] < 0 ? pool : bucketEls[placed[i]]).appendChild(buttons[i]);
        buttons[i].classList.toggle("sel", selected === i);
        buttons[i].setAttribute("aria-pressed", String(selected === i));
      });
      zones.classList.toggle("armed", selected != null);
      check.disabled = placed.some(function (p) { return p < 0; });
    }
    check.addEventListener("click", function () {
      locked = true;
      check.disabled = true;
      var all = true;
      q.items.forEach(function (it, i) {
        buttons[i].draggable = false;
        buttons[i].disabled = true;
        var ok = placed[i] === it[1];
        if (!ok) all = false;
        buttons[i].classList.add(ok ? "right" : "wrong");
        if (!ok) buttons[i].appendChild(el("small", null, " (belongs in: " + q.buckets[it[1]] + ")"));
      });
      done(all);
    });
    wrap.appendChild(pool);
    wrap.appendChild(zones);
    wrap.appendChild(check);
    render();
    return wrap;
  }

  function buildMatch(q, done) {
    var wrap = el("div");
    var rights = shuffle(q.pairs.map(function (p) { return p[1]; }));
    var selects = [], rows = [];
    q.pairs.forEach(function (p, i) {
      var row = el("div", "match-row");
      var id = "match-" + i;
      var lab = el("label", null, p[0]);
      lab.setAttribute("for", id);
      var sel = el("select");
      sel.id = id;
      sel.appendChild(new Option("Choose…", ""));
      rights.forEach(function (r) { sel.appendChild(new Option(r, r)); });
      sel.addEventListener("change", function () { check.disabled = selects.some(function (s) { return !s.value; }); });
      row.appendChild(lab);
      row.appendChild(sel);
      selects.push(sel);
      rows.push(row);
      wrap.appendChild(row);
    });
    var check = el("button", "btn amber", "Check my answer");
    check.disabled = true;
    check.addEventListener("click", function () {
      check.disabled = true;
      var all = true;
      q.pairs.forEach(function (p, i) {
        selects[i].disabled = true;
        var ok = selects[i].value === p[1];
        if (!ok) { all = false; rows[i].appendChild(el("small", "match-fix", "Correct: " + p[1])); }
        rows[i].classList.add(ok ? "right" : "wrong");
      });
      done(all);
    });
    wrap.appendChild(check);
    return wrap;
  }

  function buildSeq(q, done) {
    var wrap = el("div");
    wrap.appendChild(el("p", "hint", "Use the arrows to move each step up or down, then check your answer."));
    var order = shuffle(q.steps.map(function (_, i) { return i; }));
    if (order.every(function (v, i) { return v === i; })) order.reverse();   // never start already correct
    var list = el("ol", "seq-list");
    var locked = false;
    function render() {
      list.textContent = "";
      order.forEach(function (stepIndex, pos) {
        var li = el("li", "seq-row");
        li.appendChild(el("span", "seq-n", String(pos + 1)));
        li.appendChild(el("span", "seq-t", q.steps[stepIndex]));
        var up = el("button", "btn alt", "↑");
        up.setAttribute("aria-label", "Move up: " + q.steps[stepIndex]);
        up.disabled = locked || pos === 0;
        up.addEventListener("click", function () { swap(pos, pos - 1); });
        var down = el("button", "btn alt", "↓");
        down.setAttribute("aria-label", "Move down: " + q.steps[stepIndex]);
        down.disabled = locked || pos === order.length - 1;
        down.addEventListener("click", function () { swap(pos, pos + 1); });
        li.appendChild(up);
        li.appendChild(down);
        if (locked) li.classList.add(stepIndex === pos ? "right" : "wrong");
        list.appendChild(li);
      });
    }
    function swap(a, b) { var t = order[a]; order[a] = order[b]; order[b] = t; render(); }
    var check = el("button", "btn amber", "Check my answer");
    check.addEventListener("click", function () {
      locked = true;
      check.disabled = true;
      render();
      done(order.every(function (v, i) { return v === i; }));
    });
    wrap.appendChild(list);
    wrap.appendChild(check);
    render();
    return wrap;
  }

  FL.assessmentQuestions = QUESTIONS;
  var BUILD = { mc: buildMc, drag: buildDrag, match: buildMatch, seq: buildSeq };

  FL.inits.quiz = function () {
    var box = document.getElementById("quiz-box");
    var index, results;

    function intro() {
      box.textContent = "";
      var p = el("div", "panel");
      p.appendChild(el("p", "lead", "Show what you have learned. The assessment has " + QUESTIONS.length + " questions that get harder as you go."));
      var ul = el("ul");
      ["Question types: multiple choice, drag and drop, matching and sequencing the fuel flow",
       "Levels: Easy, then Medium, then Hard",
       "You get feedback and an explanation after every question",
       "Pass mark: " + PASS + "% (" + Math.ceil(QUESTIONS.length * PASS / 100) + " correct out of " + QUESTIONS.length + ")"
      ].forEach(function (t) { ul.appendChild(el("li", null, t)); });
      p.appendChild(ul);
      var past = FL.store.get().quiz;
      if (past.length) {
        var top = Math.max.apply(null, past.map(function (x) { return Math.round(x.score / x.total * 100); }));
        p.appendChild(el("p", "maint", "Your best so far: " + top + "%" + (top >= PASS ? " (passed)" : " (not yet passed)")));
      }
      var b = el("button", "btn", "Start assessment");
      b.addEventListener("click", function () { index = 0; results = []; ask(); });
      p.appendChild(b);
      box.appendChild(p);
    }

    function ask() {
      var q = QUESTIONS[index];
      box.textContent = "";
      var p = el("div", "panel");
      var meta = el("div", "q-meta");
      meta.appendChild(el("span", "qprog", "Question " + (index + 1) + " of " + QUESTIONS.length));
      meta.appendChild(el("span", "chip lvl-" + q.level.toLowerCase(), q.level));
      meta.appendChild(el("span", "chip", TYPES[q.type]));
      meta.appendChild(el("span", "chip", q.topic));
      p.appendChild(meta);
      var bar = el("div", "meter");
      var tr = el("div", "bar"); var fi = el("i"); fi.style.width = (index / QUESTIONS.length * 100) + "%"; tr.appendChild(fi); bar.appendChild(tr);
      p.appendChild(bar);
      p.appendChild(el("h3", null, q.q));

      var fb = el("div", "feedback");
      fb.hidden = true;
      fb.setAttribute("role", "status");
      var next = el("button", "btn", index === QUESTIONS.length - 1 ? "See my results" : "Next question →");
      next.hidden = true;
      next.style.marginTop = ".8rem";

      p.appendChild(BUILD[q.type](q, function (correct) {
        results.push({ q: q, correct: correct });
        fb.hidden = false;
        fb.className = "feedback " + (correct ? "good" : "bad");
        fb.textContent = "";
        fb.appendChild(el("b", null, correct ? "Correct! " : "Not quite. "));
        fb.appendChild(document.createTextNode(q.why));
        if (!correct) fb.appendChild(el("p", "q-answer", "Correct answer: " + answerText(q)));
        next.hidden = false;
        next.focus();
      }));
      next.addEventListener("click", function () { index++; if (index < QUESTIONS.length) ask(); else done(); });
      p.appendChild(fb);
      p.appendChild(next);
      box.appendChild(p);
    }

    function tally(keyFn) {
      var out = {};
      results.forEach(function (r) {
        var k = keyFn(r.q);
        var t = out[k] || (out[k] = { right: 0, total: 0 });
        t.total++;
        if (r.correct) t.right++;
      });
      return out;
    }

    function breakdown(title, data, order) {
      var wrap = el("div", "card");
      wrap.appendChild(el("h3", null, title));
      order.forEach(function (k) {
        if (!data[k]) return;
        var pct = Math.round(data[k].right / data[k].total * 100);
        var row = el("div", "bars compact");
        var b = el("div", "b");
        b.appendChild(el("span", null, k));
        var track = el("div", "track");
        var i = el("i", pct === 100 ? "high" : pct < 50 ? "low" : "");
        i.style.width = pct + "%";
        track.appendChild(i);
        b.appendChild(track);
        b.appendChild(el("span", null, data[k].right + "/" + data[k].total));
        row.appendChild(b);
        wrap.appendChild(row);
      });
      return wrap;
    }

    function done() {
      var score = results.filter(function (r) { return r.correct; }).length;
      var total = QUESTIONS.length;
      var pct = Math.round(score / total * 100);
      var passed = pct >= PASS;
      var topics = tally(function (q) { return q.topic; });
      var levels = tally(function (q) { return q.level; });
      var types = tally(function (q) { return TYPES[q.type]; });

      FL.store.addQuiz(score, total, topics);
      FL.store.visit("quiz-done");
      if (FL.refreshProgress) FL.refreshProgress();
      if (window.Tracker) {
        Tracker.quizResult(score, total, results.map(function (r, i) {
          return { q: "Assessment Q" + (i < 9 ? "0" : "") + (i + 1) + " (" + r.q.level + "): " + r.q.q, topic: r.q.topic, correct: r.correct };
        }));
      }

      box.textContent = "";
      var p = el("div", "panel");
      p.style.textAlign = "center";
      var ring = el("div", "score-ring");
      ring.style.setProperty("--p", pct);
      ring.appendChild(el("span", null, pct + "%"));
      p.appendChild(ring);
      p.appendChild(el("h3", null, "You scored " + score + " out of " + total));
      var verdict = el("div", "status " + (passed ? "good" : "bad"), passed
        ? "PASSED. You met the " + PASS + "% pass mark. Well done!"
        : "NOT YET PASSED. The pass mark is " + PASS + "% (" + Math.ceil(total * PASS / 100) + " correct). Review the topics below and try again.");
      p.appendChild(verdict);
      box.appendChild(p);

      var grid = el("div", "grid wide");
      grid.appendChild(breakdown("By difficulty", levels, LEVELS));
      grid.appendChild(breakdown("By question type", types, Object.keys(TYPES).map(function (k) { return TYPES[k]; })));
      grid.appendChild(breakdown("By topic", topics, Object.keys(topics)));
      box.appendChild(grid);

      var missed = results.filter(function (r) { return !r.correct; });
      var review = el("div", "panel");
      review.appendChild(el("h3", null, missed.length ? "Questions to review (" + missed.length + ")" : "Perfect score: nothing to review!"));
      missed.forEach(function (r) {
        var d = el("div", "review-item");
        d.appendChild(el("p", null, r.q.q));
        d.appendChild(el("p", "q-answer", "Correct answer: " + answerText(r.q)));
        d.appendChild(el("p", "ts-note", r.q.why));
        review.appendChild(d);
      });
      box.appendChild(review);

      var row = el("div", "row");
      var again = el("button", "btn alt", "Retake the assessment");
      again.addEventListener("click", function () { index = 0; results = []; ask(); });
      var dash = el("a", "btn", "View my dashboard");
      dash.href = "#dashboard";
      row.appendChild(again); row.appendChild(dash);
      box.appendChild(row);
      window.scrollTo(0, 0);
    }

    intro();
  };
})();
