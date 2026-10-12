/* Page 10: Knowledge Quiz. Scores are saved in localStorage (and in the portal tracker). */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  // Keep each `q` unique and stable: the portal scores each question by its latest answer.
  var QUESTIONS = [
    { topic: "Purpose", q: "Fuel system: what is its main job?", o: ["To store fuel and deliver it to the engine", "To cool the cockpit", "To make electricity", "To inflate the tyres"], a: 0, why: "The system stores fuel and supplies it to the engine." },
    { topic: "Purpose", q: "Fuel system: why does a tank need a vent?", o: ["To let fuel escape quickly", "To let air in and out as fuel level changes", "To warm the fuel", "To measure the fuel"], a: 1, why: "Without a vent the tank could be crushed or burst." },
    { topic: "Components", q: "Fuel system: what does the fuel filter do?", o: ["Measures fuel", "Pumps fuel", "Catches dirt and rust", "Cools the engine"], a: 2, why: "A filter stops dirt reaching the engine." },
    { topic: "Components", q: "Fuel system: what does a boost pump do?", o: ["Vents the tank", "Pushes fuel toward the engine", "Cleans water from fuel", "Switches on the warning light"], a: 1, why: "It pushes fuel and keeps pressure in the lines." },
    { topic: "Components", q: "Fuel system: where does water collect in a tank?", o: ["At the top", "In the vent", "At the lowest point", "On the probes only"], a: 2, why: "Water is heavier than fuel, so it sinks to the bottom." },
    { topic: "Indication", q: "Fuel quantity: what do quantity probes sense?", o: ["Fuel colour", "How much of the probe is covered by fuel", "Engine speed", "Pump noise"], a: 1, why: "More fuel around the probe gives a bigger signal." },
    { topic: "Indication", q: "Fuel quantity: the gauge reading looks wrong. What should you do?", o: ["Trust it anyway", "Check against another source and report", "Ignore it", "Switch the pumps off"], a: 1, why: "Compare with another source and report the fault." },
    { topic: "Transfer", q: "Fuel transfer: why move fuel between tanks?", o: ["To keep the aircraft balanced and the feed tank full", "To make fuel hotter", "To clean the filter", "To check the vent"], a: 0, why: "Transfer keeps balance and keeps the feed tank supplied." },
    { topic: "Refuelling", q: "Refuelling: which comes first?", o: ["Start the fuel flow", "Bond (earth) the aircraft and check safety", "Disconnect the hose", "Record the amount"], a: 1, why: "Safety checks and bonding come before fuel moves." },
    { topic: "Hazards", q: "Hazards: what is the most dangerous part of fuel?", o: ["Its colour", "Its vapour, which can burn or explode", "Its weight", "Its price"], a: 1, why: "Vapour ignites easily, even with a small spark." },
    { topic: "Hazards", q: "Hazards: who may enter a fuel tank?", o: ["Anyone", "Only trained people with a permit and an observer", "Only the pilot", "Nobody ever"], a: 1, why: "A tank is a confined space with fumes." },
    { topic: "Leaks", q: "Leaks: you see a running fuel leak. What do you do first?", o: ["Wipe it and carry on", "Start the engine", "Make the area safe, stop work and report", "Wait until tomorrow"], a: 2, why: "Make safe and report at once. Never ignore a leak." }
  ];

  FL.inits.quiz = function () {
    var box = document.getElementById("quiz-box");
    var index, score, answers;

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    function intro() {
      box.textContent = "";
      var p = el("div", "panel");
      p.appendChild(el("p", "lead", QUESTIONS.length + " questions with instant feedback. Your score is saved in this browser."));
      var best = FL.store.get().quiz;
      if (best.length) {
        var top = Math.max.apply(null, best.map(function (x) { return Math.round(x.score / x.total * 100); }));
        p.appendChild(el("p", null, "Your best so far: " + top + "%."));
      }
      var b = el("button", "btn", "Start quiz");
      b.addEventListener("click", function () { index = 0; score = 0; answers = []; ask(); });
      p.appendChild(b);
      box.appendChild(p);
    }

    function ask() {
      var q = QUESTIONS[index];
      box.textContent = "";
      var p = el("div", "panel");
      p.appendChild(el("p", "qprog", "Question " + (index + 1) + " of " + QUESTIONS.length + " · " + q.topic));
      var bar = el("div", "meter");
      var tr = el("div", "bar"); var fi = el("i"); fi.style.width = (index / QUESTIONS.length * 100) + "%"; tr.appendChild(fi); bar.appendChild(tr);
      p.appendChild(bar);
      p.appendChild(el("h3", null, q.q.replace(/^[^:]+: /, "")));
      var list = el("div", "choice-list");
      var fb = el("div", "feedback");
      fb.hidden = true;
      fb.setAttribute("role", "status");
      var next = el("button", "btn", index === QUESTIONS.length - 1 ? "See my score" : "Next question");
      next.hidden = true;
      q.o.forEach(function (text, i) {
        var b = el("button", "choice", text);
        b.addEventListener("click", function () {
          var ok = i === q.a;
          list.querySelectorAll("button").forEach(function (x, k) {
            x.disabled = true;
            if (k === q.a) x.classList.add("correct");
          });
          if (!ok) b.classList.add("incorrect");
          if (ok) score++;
          answers.push({ q: q.q, topic: q.topic, correct: ok });
          fb.hidden = false;
          fb.className = "feedback " + (ok ? "good" : "bad");
          fb.textContent = (ok ? "Correct! " : "Not quite. ") + q.why;
          next.hidden = false;
          next.focus();
        });
        list.appendChild(b);
      });
      next.addEventListener("click", function () {
        index++;
        if (index < QUESTIONS.length) ask(); else done();
      });
      p.appendChild(list);
      p.appendChild(fb);
      p.appendChild(next);
      box.appendChild(p);
    }

    function done() {
      var topics = {};
      answers.forEach(function (a) {
        var t = topics[a.topic] || (topics[a.topic] = { right: 0, total: 0 });
        t.total++;
        if (a.correct) t.right++;
      });
      FL.store.addQuiz(score, QUESTIONS.length, topics);
      if (window.Tracker) Tracker.quizResult(score, QUESTIONS.length, answers);

      box.textContent = "";
      var pct = Math.round(score / QUESTIONS.length * 100);
      var p = el("div", "panel");
      p.style.textAlign = "center";
      var ring = el("div", "score-ring");
      ring.style.setProperty("--p", pct);
      ring.appendChild(el("span", null, pct + "%"));
      p.appendChild(ring);
      p.appendChild(el("h3", null, "You scored " + score + " out of " + QUESTIONS.length));
      p.appendChild(el("p", null, pct >= 80 ? "Great work! You understand the basics." : pct >= 50 ? "Good effort. Review the topics below and try again." : "Keep going. Revisit the lessons and try again."));
      var weak = Object.keys(topics).filter(function (t) { return topics[t].right < topics[t].total; });
      if (weak.length) p.appendChild(el("p", "maint", "Topics to review: " + weak.join(", ")));
      var row = el("div", "row");
      row.style.justifyContent = "center";
      var again = el("button", "btn alt", "Try again");
      again.addEventListener("click", function () { index = 0; score = 0; answers = []; ask(); });
      var dash = el("a", "btn", "View my dashboard");
      dash.href = "#dashboard";
      row.appendChild(again); row.appendChild(dash);
      p.appendChild(row);
      box.appendChild(p);
    }

    intro();
  };
})();
