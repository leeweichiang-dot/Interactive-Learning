/* Page 11: Student Progress Dashboard.
 * Reads this browser's saved progress: lessons, quiz scores, time, simulator attempts, weak topics.
 * Shows a progress bar, a radar chart, recommendations and an optional leaderboard. */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  var PASS = 80, WEAK = 80, RETRY_BELOW = 70;
  var NS = "http://www.w3.org/2000/svg";

  // The seven topics used by the quiz and the radar chart, and where to study each.
  var TOPICS = [
    { id: "Purpose", page: "Fuel System Overview", href: "#overview" },
    { id: "Components", page: "Fuel System Components", href: "#components" },
    { id: "Indication", page: "Fuel Quantity Indication", href: "#quantity" },
    { id: "Transfer", page: "Fuel Transfer System", href: "#transfer" },
    { id: "Refuelling", page: "Refuelling and Defuelling", href: "#refuel" },
    { id: "Safety", page: "Fuel System Safety", href: "#hazards" },
    { id: "Troubleshooting", page: "Troubleshooting Simulator", href: "#simulator" }
  ];
  var PAGE_NAMES = { home: "Home", overview: "Overview", explorer: "Flow Explorer", components: "Components", quantity: "Quantity Indication", transfer: "Transfer", refuel: "Refuelling", hazards: "Safety", simulator: "Troubleshooting", quiz: "Assessment", dashboard: "My Progress" };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function fmtTime(secs) {
    var m = Math.round(secs / 60);
    if (secs < 60) return secs < 5 ? "0 min" : "< 1 min";
    if (m < 60) return m + " min";
    return Math.floor(m / 60) + " h " + (m % 60) + " min";
  }

  /* ---- Calculations (all from saved data, so the leaderboard can reuse them) ---- */

  function sum(list) { return list.reduce(function (n, x) { return n + x; }, 0); }
  function avg(list) { return list.length ? sum(list) / list.length : 0; }
  function knownSim() { return (FL.troubleshooting || []).map(function (s) { return s.id; }); }
  function knownSafety() { return (FL.safetyScenarios || []).map(function (s) { return s.id; }); }

  function quizPct(a) { return Math.round(a.score / a.total * 100); }

  // Accuracy per topic over the last three assessment attempts (so improvement shows).
  function quizByTopic(d) {
    var out = {};
    d.quiz.slice(-3).forEach(function (a) {
      Object.keys(a.topics || {}).forEach(function (t) {
        var name = t === "Fuel flow" ? "Purpose" : t;
        var o = out[name] || (out[name] = { right: 0, total: 0 });
        o.right += a.topics[t].right;
        o.total += a.topics[t].total;
      });
    });
    Object.keys(out).forEach(function (k) { out[k].pct = Math.round(out[k].right / out[k].total * 100); });
    return out;
  }

  // How much of each topic's learning material has been done (0-100).
  function coverage(d) {
    var v = d.visited || {};
    var ids = FL.componentIds || [];
    function share(keys) { return keys.filter(function (k) { return v[k]; }).length / keys.length * 100; }
    var opened = ids.filter(function (i) { return v["comp:" + i]; }).length;
    var passed = ids.filter(function (i) { return v["check:" + i]; }).length;
    var safeDone = knownSafety().filter(function (i) { return (d.safety || {})[i] != null; }).length;
    var simDone = knownSim().filter(function (i) { return d.sim[i] != null; }).length;
    return {
      Purpose: share(["overview", "explorer"]),
      Components: ids.length ? (opened + passed) / (ids.length * 2) * 100 : 0,
      Indication: share(["quantity"]),
      Transfer: share(["transfer"]),
      Refuelling: share(["refuel"]),
      Safety: ((v.hazards ? 1 : 0) + safeDone) / (1 + knownSafety().length) * 100,
      Troubleshooting: ((v.simulator ? 1 : 0) + simDone) / (1 + knownSim().length) * 100
    };
  }

  function simPoints(d) { return sum(knownSim().map(function (i) { return d.sim[i] || 0; })); }
  function safetyPoints(d) { return sum(knownSafety().map(function (i) { return (d.safety || {})[i] || 0; })); }
  function overallProgress(d) { return Math.round(avg(FL.moduleProgress(d).map(function (m) { return m.pct; }))); }
  function bestQuiz(d) { return d.quiz.length ? Math.max.apply(null, d.quiz.map(quizPct)) : 0; }

  // Leaderboard score, out of 400: course progress + best assessment + troubleshooting + safety (each out of 100).
  function learningPoints(d) {
    return Math.round(overallProgress(d) + bestQuiz(d) + simPoints(d) / Math.max(1, knownSim().length) + safetyPoints(d) / Math.max(1, knownSafety().length));
  }

  function simAttempts(d) {
    var t = d.tries || {};
    return sum(Object.keys(t).map(function (k) { return t[k]; }));
  }

  // Recommendations, most useful first.
  function recommend(d) {
    var recs = [];
    var topics = quizByTopic(d);
    // Retry weak scenarios
    (FL.troubleshooting || []).forEach(function (s) {
      if (d.sim[s.id] != null && d.sim[s.id] < RETRY_BELOW) recs.push({ icon: "🔁", text: "Retry " + s.title + " troubleshooting", why: "Your best score is " + d.sim[s.id] + "/100.", href: "#simulator" });
    });
    (FL.safetyScenarios || []).forEach(function (s) {
      var b = (d.safety || {})[s.id];
      if (b != null && b < RETRY_BELOW) recs.push({ icon: "🔁", text: "Retry the safety scenario: " + s.title, why: "Your best score is " + b + "%.", href: "#hazards" });
    });
    // Review weak quiz topics, weakest first
    TOPICS.filter(function (t) { return topics[t.id] && topics[t.id].pct < WEAK; })
      .sort(function (a, b) { return topics[a.id].pct - topics[b.id].pct; })
      .forEach(function (t) { recs.push({ icon: "📖", text: "Review " + t.page, why: "Assessment accuracy on this topic is " + topics[t.id].pct + "%.", href: t.href }); });
    // Next lesson not finished
    var next = FL.moduleProgress(d).filter(function (m) { return m.pct < 100 && m.n < 8; })[0];
    if (next) recs.push({ icon: "▶️", text: (next.pct ? "Continue" : "Start") + " Module " + next.n + ": " + next.title, why: next.pct ? "You are " + next.pct + "% through it." : "It is the next step on your roadmap.", href: next.href });
    // Scenarios not tried
    var untried = (FL.troubleshooting || []).filter(function (s) { return d.sim[s.id] == null; });
    if (untried.length && !next) recs.push({ icon: "🧰", text: "Try the " + untried[0].title + " troubleshooting scenario", why: untried.length + " scenario" + (untried.length > 1 ? "s" : "") + " not tried yet.", href: "#simulator" });
    // Assessment
    var best = bestQuiz(d);
    if (!d.quiz.length) recs.push({ icon: "📝", text: "Take the assessment", why: "Pass mark is " + PASS + "%. It shows which topics need more work.", href: "#quiz" });
    else if (best < PASS) recs.push({ icon: "📝", text: "Retake the assessment", why: "Your best is " + best + "%. You need " + PASS + "% to pass.", href: "#quiz" });
    if (!recs.length) recs.push({ icon: "🏆", text: "Great work. You are on track", why: "Keep revising now and then. Try to score 100 in every scenario.", href: "#simulator" });
    return recs.slice(0, 6);
  }

  /* ---- Drawing helpers ---- */

  function bar(label, pct, cls) {
    var b = el("div", "b");
    b.appendChild(el("span", null, label));
    var tr = el("div", "track");
    var i = el("i", cls || "");
    i.style.width = pct + "%";
    tr.appendChild(i);
    b.appendChild(tr);
    b.appendChild(el("span", null, pct + "%"));
    return b;
  }
  function band(pct) { return pct >= 80 ? "high" : pct < 50 ? "low" : ""; }

  function stat(value, label) {
    var c = el("div", "card stat");
    c.appendChild(el("div", "big-num", value));
    c.appendChild(el("div", null, label));
    return c;
  }

  function panel(title) {
    var p = el("div", "panel");
    if (title) p.appendChild(el("h3", null, title));
    return p;
  }

  // Radar chart: one corner per topic, two shapes (course covered, assessment accuracy).
  function radar(cov, quiz) {
    var W = 440, H = 340, cx = 220, cy = 168, R = 108, n = TOPICS.length;
    var root = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Radar chart of course covered and assessment accuracy for each topic. The same numbers are in the table below." });
    function pt(i, pct) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + R * pct / 100 * Math.cos(a), cy + R * pct / 100 * Math.sin(a)];
    }
    function poly(values) { return values.map(function (v, i) { return pt(i, v).map(function (x) { return x.toFixed(1); }).join(","); }).join(" "); }
    [25, 50, 75, 100].forEach(function (lvl) {
      root.appendChild(svg("polygon", { points: poly(TOPICS.map(function () { return lvl; })), fill: "none", stroke: "var(--line)", "stroke-width": lvl === 100 ? 2 : 1 }));
    });
    TOPICS.forEach(function (t, i) {
      var e = pt(i, 100), l = pt(i, 122);
      root.appendChild(svg("line", { x1: cx, y1: cy, x2: e[0], y2: e[1], stroke: "var(--line)" }));
      var text = svg("text", { x: l[0], y: l[1] + 4, "text-anchor": Math.abs(l[0] - cx) < 8 ? "middle" : l[0] < cx ? "end" : "start", style: "font-size:12px;font-weight:600;fill:var(--ink)" });
      text.textContent = t.id;
      root.appendChild(text);
    });
    var series = [
      { values: TOPICS.map(function (t) { return cov[t.id] || 0; }), color: "var(--sky)", fill: "rgba(26,115,200,.25)" }
    ];
    if (quiz) series.push({ values: TOPICS.map(function (t) { return quiz[t.id] ? quiz[t.id].pct : 0; }), color: "var(--amber)", fill: "rgba(242,169,0,.3)" });
    series.forEach(function (s) {
      root.appendChild(svg("polygon", { points: poly(s.values), fill: s.fill, stroke: s.color, "stroke-width": 3, "stroke-linejoin": "round" }));
      s.values.forEach(function (v, i) {
        var p = pt(i, v);
        root.appendChild(svg("circle", { cx: p[0], cy: p[1], r: 4, fill: s.color }));
      });
    });
    return root;
  }

  FL.inits.dashboard = function () {
    var box = document.getElementById("dash-box");
    var showBoard = false;

    function render() {
      var d = FL.store.get();
      var modules = FL.moduleProgress(d);
      var overall = overallProgress(d);
      var doneModules = modules.filter(function (m) { return m.pct === 100; }).length;
      var best = bestQuiz(d);
      var topics = quizByTopic(d);
      var cov = coverage(d);
      var pointsSim = simPoints(d);
      var timeTotal = d.time ? d.time.total : 0;
      box.textContent = "";

      /* Headline numbers */
      var stats = el("div", "grid");
      stats.appendChild(stat(doneModules + " of " + modules.length, "Lessons completed"));
      stats.appendChild(stat(d.quiz.length ? best + "%" : "–", d.quiz.length ? (best >= PASS ? "Best assessment score (passed)" : "Best assessment score (pass mark " + PASS + "%)") : "Best assessment score"));
      stats.appendChild(stat(fmtTime(timeTotal), "Time spent learning"));
      stats.appendChild(stat(String(simAttempts(d)), "Simulator attempts"));
      var rank = FL.troubleRank ? FL.troubleRank(pointsSim).name : "Trainee";
      stats.appendChild(stat(String(pointsSim), "Troubleshooting points (" + rank + ")"));
      box.appendChild(stats);

      /* Overall progress bar and each module */
      var prog = panel("Course progress");
      var big = el("div", "dash-progress");
      big.setAttribute("role", "progressbar");
      big.setAttribute("aria-valuemin", "0"); big.setAttribute("aria-valuemax", "100"); big.setAttribute("aria-valuenow", String(overall));
      big.setAttribute("aria-label", "Overall course progress");
      var fill = el("i");
      fill.style.width = overall + "%";
      big.appendChild(fill);
      big.appendChild(el("span", null, overall + "%"));
      prog.appendChild(big);
      var list = el("div", "bars");
      modules.forEach(function (m) {
        var row = bar("M" + m.n + ": " + m.title, m.pct, m.pct === 100 ? "high" : "");
        list.appendChild(row);
      });
      prog.appendChild(list);
      box.appendChild(prog);

      /* Radar chart */
      var rp = panel("Strengths and gaps by topic");
      var wrap = el("div", "dash-radar");
      wrap.appendChild(radar(cov, d.quiz.length ? topics : null));
      rp.appendChild(wrap);
      var legend = el("p", "dash-legend");
      var k1 = el("span", "key sky", "Course covered");
      legend.appendChild(k1);
      if (d.quiz.length) legend.appendChild(el("span", "key amber", "Assessment accuracy (last 3 attempts)"));
      else legend.appendChild(el("span", "empty", "Take the assessment to add your accuracy."));
      rp.appendChild(legend);
      var tw = el("div", "table-wrap");
      var table = el("table");
      var head = el("tr");
      ["Topic", "Course covered", "Assessment accuracy"].forEach(function (t) { head.appendChild(el("th", null, t)); });
      table.appendChild(head);
      TOPICS.forEach(function (t) {
        var r = el("tr");
        r.appendChild(el("td", null, t.id));
        r.appendChild(el("td", null, Math.round(cov[t.id]) + "%"));
        r.appendChild(el("td", null, topics[t.id] ? topics[t.id].pct + "%" : "–"));
        table.appendChild(r);
      });
      tw.appendChild(table);
      rp.appendChild(tw);
      box.appendChild(rp);

      /* Recommendations */
      var rec = panel("Recommended next steps");
      var recList = el("ul", "recs");
      recommend(d).forEach(function (r) {
        var li = el("li");
        li.appendChild(el("span", "icon", r.icon));
        var t = el("span", "rec-text");
        t.appendChild(el("b", null, r.text));
        t.appendChild(el("small", null, r.why));
        li.appendChild(t);
        var go = el("a", "btn alt", "Go");
        go.href = r.href;
        go.setAttribute("aria-label", "Go: " + r.text);
        li.appendChild(go);
        recList.appendChild(li);
      });
      rec.appendChild(recList);
      box.appendChild(rec);

      /* Weak topics */
      var wk = panel("Weak topics");
      var weak = TOPICS.filter(function (t) { return topics[t.id] && topics[t.id].pct < WEAK; })
        .sort(function (a, b) { return topics[a.id].pct - topics[b.id].pct; });
      if (!d.quiz.length) wk.appendChild(el("p", "empty", "Take the assessment to find your weak topics."));
      else if (!weak.length) wk.appendChild(el("p", "maint", "No weak topics. Every topic is at " + WEAK + "% or more."));
      else {
        var wl = el("div", "bars");
        weak.forEach(function (t) { wl.appendChild(bar(t.id, topics[t.id].pct, "low")); });
        wk.appendChild(wl);
        wk.appendChild(el("p", "maint", "Topics under " + WEAK + "% in your last three attempts: " + weak.map(function (t) { return t.id; }).join(", ") + "."));
      }
      box.appendChild(wk);

      /* Assessment history */
      var qp = panel("Assessment scores");
      if (!d.quiz.length) qp.appendChild(el("p", "empty", "No assessment attempts yet."));
      else {
        var at = el("div", "bars");
        d.quiz.slice(-8).forEach(function (a, i, arr) {
          at.appendChild(bar("Attempt " + (d.quiz.length - arr.length + i + 1), quizPct(a), band(quizPct(a))));
        });
        qp.appendChild(at);
        qp.appendChild(el("p", "maint", best >= PASS ? "✓ You have passed the assessment (pass mark " + PASS + "%)." : "Pass mark is " + PASS + "%. Your best is " + best + "%."));
      }
      box.appendChild(qp);

      /* Simulator attempts */
      var sp = panel("Simulator attempts");
      var tries = d.tries || {};
      var rows = el("div", "table-wrap");
      var st = el("table");
      var sh = el("tr");
      ["Scenario", "Attempts", "Best score"].forEach(function (t) { sh.appendChild(el("th", null, t)); });
      st.appendChild(sh);
      (FL.troubleshooting || []).forEach(function (s) {
        var r = el("tr");
        r.appendChild(el("td", null, "Troubleshooting: " + s.title));
        r.appendChild(el("td", null, String(tries["sim:" + s.id] || 0)));
        r.appendChild(el("td", null, d.sim[s.id] != null ? d.sim[s.id] + " / 100" : "–"));
        st.appendChild(r);
      });
      (FL.safetyScenarios || []).forEach(function (s) {
        var b = (d.safety || {})[s.id];
        var r = el("tr");
        r.appendChild(el("td", null, "Safety: " + s.title));
        r.appendChild(el("td", null, String(tries["safety:" + s.id] || 0)));
        r.appendChild(el("td", null, b != null ? b + "%" : "–"));
        st.appendChild(r);
      });
      rows.appendChild(st);
      sp.appendChild(rows);
      box.appendChild(sp);

      /* Time spent */
      var tp = panel("Time spent learning");
      var pages = d.time ? d.time.pages : {};
      var tl = Object.keys(pages).filter(function (k) { return PAGE_NAMES[k]; }).sort(function (a, b) { return pages[b] - pages[a]; }).slice(0, 6);
      if (!tl.length) tp.appendChild(el("p", "empty", "Time is counted while this tab is open. Come back after you have studied for a while."));
      else {
        var max = pages[tl[0]];
        var tb = el("div", "bars");
        tl.forEach(function (k) {
          var b = el("div", "b");
          b.appendChild(el("span", null, PAGE_NAMES[k]));
          var tr = el("div", "track"); var i = el("i"); i.style.width = Math.max(3, pages[k] / max * 100) + "%"; tr.appendChild(i);
          b.appendChild(tr);
          b.appendChild(el("span", null, fmtTime(pages[k])));
          tb.appendChild(b);
        });
        tp.appendChild(tb);
      }
      box.appendChild(tp);

      /* Badges */
      var badges = d.badges || [];
      if (badges.length) {
        var bp = panel("Troubleshooting badges earned");
        bp.appendChild(el("p", null, badges.length + " badge" + (badges.length > 1 ? "s" : "") + " earned. See them on the Troubleshooting Simulator page."));
        box.appendChild(bp);
      }

      /* Leaderboard (optional, this device only) */
      var lp = panel("Leaderboard (optional)");
      lp.appendChild(el("p", "lead", "Compare learning points with other trainees who use this same browser. It is shown only on this device. Nothing is sent anywhere."));
      var toggle = el("button", "btn alt", showBoard ? "Hide leaderboard" : "Show leaderboard");
      toggle.setAttribute("aria-expanded", String(showBoard));
      toggle.addEventListener("click", function () { showBoard = !showBoard; render(); });
      lp.appendChild(toggle);
      if (showBoard) lp.appendChild(leaderboard());
      box.appendChild(lp);

      var reset = el("button", "btn alt", "Clear my progress in this tool");
      reset.style.marginTop = "1rem";
      reset.addEventListener("click", function () {
        if (window.confirm("Clear the saved progress for this tool on this device?")) {
          FL.store.reset();
          if (FL.refreshProgress) FL.refreshProgress();
          render();
        }
      });
      box.appendChild(reset);
    }

    function displayName(p) {
      if (p.current && window.Tracker && Tracker.current && Tracker.current()) return Tracker.current().name || p.id;
      if (!p.id) return "Guest (not signed in)";
      try {
        var saved = JSON.parse(localStorage.getItem("interactive-learning-progress:" + p.id));
        if (saved && saved.trainee && saved.trainee.name) return saved.trainee.name;
      } catch (e) { /* no name saved */ }
      return p.id;
    }

    function leaderboard() {
      var wrap = el("div");
      wrap.style.marginTop = ".8rem";
      var rows = FL.store.profiles().map(function (p) {
        return { name: displayName(p), id: p.id, you: p.current, pts: learningPoints(p.data) };
      }).sort(function (a, b) { return b.pts - a.pts; }).slice(0, 10);
      if (rows.length < 2) wrap.appendChild(el("p", "empty", "Only you so far. Other trainees who study on this device will appear here."));
      var tw = el("div", "table-wrap");
      var t = el("table");
      var h = el("tr");
      ["#", "Trainee", "Points (of 400)"].forEach(function (x) { h.appendChild(el("th", null, x)); });
      t.appendChild(h);
      rows.forEach(function (r, i) {
        var tr = el("tr", r.you ? "you" : "");
        tr.appendChild(el("td", null, String(i + 1)));
        tr.appendChild(el("td", null, r.name + (r.you ? " (you)" : "")));
        tr.appendChild(el("td", null, String(r.pts)));
        t.appendChild(tr);
      });
      tw.appendChild(t);
      wrap.appendChild(tw);
      wrap.appendChild(el("p", "qi-note", "Points = course progress + best assessment score + troubleshooting score + safety score, each out of 100."));
      return wrap;
    }

    render();
    return { show: render };
  };
})();
