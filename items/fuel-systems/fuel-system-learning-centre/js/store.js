/*
 * Local progress for this learning centre (browser localStorage only).
 * Kept per trainee when someone is signed in to the portal, so a shared
 * device does not mix up scores. Every call is safe if storage is blocked.
 */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  var BASE = "fuel-centre-progress-v1";
  var MAX_QUIZ = 30;
  var memory = null; // used only if localStorage is blocked

  function key() {
    var who = window.Tracker && Tracker.current && Tracker.current();
    return who ? BASE + ":" + who.id : BASE;
  }

  function blank() {
    return { v: 1, visited: {}, quiz: [], sim: {} };
  }

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(key()));
      if (d && d.v === 1) return d;
    } catch (e) { /* blocked or corrupt: start fresh */ }
    return memory || blank();
  }

  function save(d) {
    memory = d;
    try { localStorage.setItem(key(), JSON.stringify(d)); } catch (e) { /* keep in memory */ }
  }

  FL.store = {
    get: load,
    visit: function (id) {
      var d = load();
      if (d.visited[id]) return false;
      d.visited[id] = new Date().toISOString();
      save(d);
      return true;
    },
    addQuiz: function (score, total, topics) {
      var d = load();
      d.quiz.push({ date: new Date().toISOString(), score: score, total: total, topics: topics });
      d.quiz = d.quiz.slice(-MAX_QUIZ);
      save(d);
    },
    setSim: function (id, score) {
      var d = load();
      d.tries = d.tries || {};
      d.tries["sim:" + id] = (d.tries["sim:" + id] || 0) + 1;
      if (d.sim[id] == null || score > d.sim[id]) d.sim[id] = score;
      save(d);
    },
    addBadge: function (id) {
      var d = load();
      d.badges = d.badges || [];
      if (d.badges.indexOf(id) >= 0) return;
      d.badges.push(id);
      save(d);
    },
    // Best score (0-100) for a safety scenario.
    setSafety: function (id, score) {
      var d = load();
      d.safety = d.safety || {};
      d.tries = d.tries || {};
      d.tries["safety:" + id] = (d.tries["safety:" + id] || 0) + 1;
      if (d.safety[id] == null || score > d.safety[id]) d.safety[id] = score;
      save(d);
    },
    // Adds learning time (seconds) to a page and to the total.
    addTime: function (page, secs) {
      var d = load();
      d.time = d.time || { total: 0, pages: {} };
      d.time.total += secs;
      d.time.pages[page] = (d.time.pages[page] || 0) + secs;
      save(d);
    },
    // Every trainee's saved data on this device (for the optional leaderboard).
    profiles: function () {
      var out = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k !== BASE && k.indexOf(BASE + ":") !== 0) continue;
          var d = JSON.parse(localStorage.getItem(k));
          if (d && d.v === 1) out.push({ id: k === BASE ? "" : k.slice(BASE.length + 1), current: k === key(), data: d });
        }
      } catch (e) { /* storage blocked: no list */ }
      return out;
    },
    reset: function () {
      memory = null;
      try { localStorage.removeItem(key()); } catch (e) { /* nothing to remove */ }
    }
  };
})();
