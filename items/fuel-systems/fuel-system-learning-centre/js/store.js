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
      if (d.safety[id] == null || score > d.safety[id]) d.safety[id] = score;
      save(d);
    },
    reset: function () {
      memory = null;
      try { localStorage.removeItem(key()); } catch (e) { /* nothing to remove */ }
    }
  };
})();
