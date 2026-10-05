/*
 * Progress tracker, shared by the portal and by items.
 *
 * Progress is kept only in this browser (localStorage). Nothing is sent
 * anywhere: a trainee shares it by downloading their progress file from
 * progress.html and handing it to the instructor, who opens it in
 * instructor.html.
 *
 * In an item, load it with the item's ids and type:
 *   <script src="../../../tracker.js" data-module="sample" data-item="binary-quiz" data-type="quiz"></script>
 * then:
 *   tool    nothing else: the first click or input marks it as done.
 *   lesson  call Tracker.complete() when the last step is shown.
 *   quiz    call Tracker.quizResult(score, total, answers) when finished,
 *           where answers is [{ q: "prompt", topic: "topic", correct: true }].
 * Lessons and tools can call Tracker.quizResult too, for any check or round
 * they score. Each question's latest answer is what counts, so keep `q`
 * unique and stable within the item.
 * Items must keep working if this file fails to load, so guard calls with
 * `if (window.Tracker)`.
 */
(function () {
  "use strict";

  const KEY = "interactive-learning-progress";
  const APP = "interactive-learning";
  const VERSION = 1;
  const MAX_ATTEMPTS = 20;

  function blank() {
    return { app: APP, version: VERSION, trainee: { name: "", group: "" }, items: {} };
  }

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      if (data && data.app === APP && data.version === VERSION && data.items) return data;
    } catch (e) { /* storage blocked or corrupt: start fresh */ }
    return blank();
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  // True when this browser will actually keep progress (some block storage on file://).
  function available() {
    try {
      localStorage.setItem(KEY + "-test", "1");
      localStorage.removeItem(KEY + "-test");
      return true;
    } catch (e) {
      return false;
    }
  }

  function updateItem(key, type, change) {
    const data = load();
    const now = new Date().toISOString();
    const record = data.items[key] || (data.items[key] = { type: type, opened: now, completed: null, attempts: [] });
    change(record, now);
    record.updated = now;
    save(data);
  }

  function setTrainee(name, group) {
    const data = load();
    data.trainee = { name: String(name || "").trim(), group: String(group || "").trim() };
    save(data);
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) { /* nothing to clear */ }
  }

  // Downloads the progress as a .json file the trainee can hand in.
  function download() {
    const data = load();
    data.exportedAt = new Date().toISOString();
    const name = [data.trainee.name || "trainee", data.trainee.group, data.exportedAt.slice(0, 10)]
      .filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "progress-" + name + ".json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  }

  const Tracker = {
    KEY: KEY,
    APP: APP,
    VERSION: VERSION,
    load: load,
    available: available,
    setTrainee: setTrainee,
    clear: clear,
    download: download,
    complete: function () {},
    quizResult: function () {}
  };

  // When loaded by an item, track that item.
  const script = document.currentScript;
  const ids = script && script.dataset;
  if (ids && ids.module && ids.item && ids.type) {
    const key = ids.module + "/" + ids.item;
    const type = ids.type;

    updateItem(key, type, function () {});

    Tracker.complete = function () {
      updateItem(key, type, function (record, now) {
        if (!record.completed) record.completed = now;
      });
    };

    Tracker.quizResult = function (score, total, answers) {
      updateItem(key, type, function (record, now) {
        // A quiz is done once finished; a lesson or tool with checks inside says when it's done.
        if (type === "quiz" && !record.completed) record.completed = now;
        record.attempts.push({
          date: now,
          score: score,
          total: total,
          answers: (answers || []).map(function (a) {
            return { q: String(a.q), topic: String(a.topic || ""), correct: !!a.correct };
          })
        });
        if (record.attempts.length > MAX_ATTEMPTS) record.attempts = record.attempts.slice(-MAX_ATTEMPTS);
      });
    };

    // A tool counts as done once the trainee interacts with it.
    if (type === "tool") {
      const markUsed = function (e) {
        if (e.type === "click" && !e.target.closest("button, input, select, textarea, [role=button], canvas, svg")) return;
        Tracker.complete();
        ["click", "input", "change"].forEach(function (t) { document.removeEventListener(t, markUsed, true); });
      };
      ["click", "input", "change"].forEach(function (t) { document.addEventListener(t, markUsed, true); });
    }
  }

  window.Tracker = Tracker;
})();
