/* Page 11: Student Progress Dashboard (reads this browser's saved progress). */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  FL.inits.dashboard = function () {
    var box = document.getElementById("dash-box");

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

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

    function stat(value, label) {
      var c = el("div", "card stat");
      c.appendChild(el("div", "big-num", value));
      c.appendChild(el("div", null, label));
      return c;
    }

    function render() {
      var d = FL.store.get();
      var pages = FL.learningPages;
      var seen = pages.filter(function (p) { return d.visited[p.id]; }).length;
      var quiz = d.quiz;
      var pcts = quiz.map(function (x) { return Math.round(x.score / x.total * 100); });
      var known = (FL.troubleshooting || []).map(function (s) { return s.id; });
      var simIds = Object.keys(d.sim).filter(function (id) { return known.indexOf(id) >= 0; });
      box.textContent = "";

      var stats = el("div", "grid");
      stats.appendChild(stat(Math.round(seen / pages.length * 100) + "%", "Course completed (" + seen + " of " + pages.length + " sections)"));
      stats.appendChild(stat(pcts.length ? Math.max.apply(null, pcts) + "%" : "–", "Best quiz score"));
      stats.appendChild(stat(pcts.length ? pcts[pcts.length - 1] + "%" : "–", "Latest quiz score"));
      var checks = (FL.componentIds || []).filter(function (id) { return d.visited["check:" + id]; }).length;
      stats.appendChild(stat(checks + " of " + (FL.componentIds || []).length, "Component checks passed"));
      stats.appendChild(stat(String(simIds.length), "Troubleshooting scenarios tried (of " + (FL.troubleshooting || []).length + ")"));
      box.appendChild(stats);

      var secs = el("div", "panel");
      secs.appendChild(el("h3", null, "Sections visited"));
      var list = el("div", "bars");
      pages.forEach(function (p) { list.appendChild(bar(p.title, d.visited[p.id] ? 100 : 0, "high")); });
      secs.appendChild(list);
      box.appendChild(secs);

      var qp = el("div", "panel");
      qp.appendChild(el("h3", null, "Quiz attempts"));
      if (!quiz.length) {
        qp.appendChild(el("p", "empty", "No quiz attempts yet. Take the Assessment to see your scores here."));
      } else {
        var attempts = el("div", "bars");
        quiz.slice(-8).forEach(function (x, i, arr) {
          var n = quiz.length - arr.length + i + 1;
          var pct = Math.round(x.score / x.total * 100);
          attempts.appendChild(bar("Attempt " + n, pct, pct >= 80 ? "high" : pct < 50 ? "low" : ""));
        });
        qp.appendChild(attempts);
        qp.appendChild(el("p", "maint", Math.max.apply(null, pcts) >= 80 ? "✓ You have passed the assessment (pass mark 80%)." : "Pass mark is 80%. Your best is " + Math.max.apply(null, pcts) + "%."));

        // Topic results from the latest attempt, weakest first.
        var latest = quiz[quiz.length - 1].topics || {};
        var topics = Object.keys(latest).map(function (t) { return { t: t, pct: Math.round(latest[t].right / latest[t].total * 100) }; }).sort(function (a, b) { return a.pct - b.pct; });
        qp.appendChild(el("h3", null, "Topics in your latest attempt"));
        var tl = el("div", "bars");
        topics.forEach(function (t) { tl.appendChild(bar(t.t, t.pct, t.pct === 100 ? "high" : t.pct < 50 ? "low" : "")); });
        qp.appendChild(tl);
        var weak = topics.filter(function (t) { return t.pct < 100; }).map(function (t) { return t.t; });
        qp.appendChild(el("p", "maint", weak.length ? "Review next: " + weak.join(", ") : "Full marks in every topic. Well done!"));
      }
      box.appendChild(qp);

      var sp = el("div", "panel");
      var simPoints = simIds.reduce(function (n, id) { return n + d.sim[id]; }, 0);
      sp.appendChild(el("h3", null, "Troubleshooting best scores (" + simPoints + " points)"));
      if (!simIds.length) sp.appendChild(el("p", "empty", "No scenarios tried yet."));
      else { var sl = el("div", "bars"); simIds.forEach(function (id) { sl.appendChild(bar((FL.troubleshooting.filter(function (s) { return s.id === id; })[0] || {}).title || id, d.sim[id], d.sim[id] >= 80 ? "high" : d.sim[id] < 50 ? "low" : "")); }); sp.appendChild(sl); }
      box.appendChild(sp);

      var safe = d.safety || {};
      var safeIds = Object.keys(safe);
      var fp = el("div", "panel");
      fp.appendChild(el("h3", null, "Safety scenarios (best score)"));
      if (!safeIds.length) fp.appendChild(el("p", "empty", "No safety scenarios completed yet."));
      else { var fl = el("div", "bars"); safeIds.forEach(function (id) { fl.appendChild(bar(id.replace(/-/g, " "), safe[id], safe[id] >= 80 ? "high" : safe[id] < 50 ? "low" : "")); }); fp.appendChild(fl); }
      box.appendChild(fp);

      var reset = el("button", "btn alt", "Clear my progress in this tool");
      reset.addEventListener("click", function () {
        if (window.confirm("Clear the saved progress for this tool on this device?")) {
          FL.store.reset();
          if (FL.refreshProgress) FL.refreshProgress();
          render();
        }
      });
      box.appendChild(reset);
    }

    render();
    return { show: render };
  };
})();
