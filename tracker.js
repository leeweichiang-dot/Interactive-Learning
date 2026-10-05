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
 *
 * Sign-in: the home page (and the aircraft training) ask for a name and
 * trainee ID and call Tracker.signIn(name, id). Progress belongs to whoever
 * is signed in. On a shared device each trainee's progress is kept apart:
 * signing in puts the previous trainee's progress aside under their ID and
 * brings back this trainee's. Progress made before anyone signed in is added
 * to the next trainee who signs in.
 */
(function () {
  "use strict";

  const KEY = "interactive-learning-progress";
  // Progress of trainees who aren't signed in right now: KEY + ":" + trainee ID.
  const PROFILE_PREFIX = KEY + ":";
  const APP = "interactive-learning";
  const VERSION = 1;
  const MAX_ATTEMPTS = 20;

  function blank() {
    return { app: APP, version: VERSION, trainee: { name: "", group: "" }, items: {} };
  }

  function read(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && data.app === APP && data.version === VERSION && data.items) {
        if (!data.trainee || typeof data.trainee !== "object") data.trainee = { name: "", group: "" };
        return data;
      }
    } catch (e) { /* storage blocked or corrupt: start fresh */ }
    return null;
  }

  function load() {
    return read(KEY) || blank();
  }

  function write(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  function save(data) {
    return write(KEY, data);
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* nothing to remove */ }
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

  // Changes the name and group on the progress file; the signed-in trainee ID is kept.
  function setTrainee(name, group) {
    const data = load();
    const id = data.trainee.id;
    data.trainee = { name: String(name || "").trim(), group: String(group || "").trim() };
    if (id) data.trainee.id = id;
    save(data);
  }

  // Trainee IDs ignore spaces and case: " s1234 " is "S1234".
  function tidyId(id) {
    return String(id || "").replace(/\s+/g, "").toUpperCase();
  }

  // The signed-in trainee ({ name, id, group }), or null if nobody is signed in.
  function current() {
    const t = load().trainee;
    return t.id ? { name: t.name || "", id: t.id, group: t.group || "" } : null;
  }

  // Signs a trainee in (see the top of this file). Returns false if it couldn't be saved.
  function signIn(name, id) {
    id = tidyId(id);
    if (!id) return false;
    let data = load();
    const previous = data.trainee.id;
    if (previous !== id) {
      if (previous) write(PROFILE_PREFIX + previous, data);
      const saved = read(PROFILE_PREFIX + id);
      data = previous ? (saved || blank()) : (saved ? merge(saved, data) : data);
      remove(PROFILE_PREFIX + id);
    }
    data.trainee = { name: String(name || "").trim(), group: data.trainee.group || "", id: id };
    return save(data);
  }

  // Adds the items of `extra` (progress made while nobody was signed in) to `data`.
  function merge(data, extra) {
    Object.keys(extra.items).forEach(function (key) {
      const a = data.items[key];
      const b = extra.items[key];
      if (!a) {
        data.items[key] = b;
        return;
      }
      a.opened = [a.opened, b.opened].filter(Boolean).sort()[0] || a.opened;
      a.completed = [a.completed, b.completed].filter(Boolean).sort()[0] || null;
      a.updated = [a.updated, b.updated].filter(Boolean).sort().pop() || a.updated;
      a.attempts = (a.attempts || []).concat(b.attempts || [])
        .sort(function (x, y) { return String(x.date).localeCompare(String(y.date)); })
        .slice(-MAX_ATTEMPTS);
    });
    return data;
  }

  // Signs the trainee out, putting their progress aside until they sign in again.
  function signOut() {
    const data = load();
    if (data.trainee.id) write(PROFILE_PREFIX + data.trainee.id, data);
    remove(KEY);
  }

  // Clears the signed-in trainee's progress; they stay signed in.
  function clear() {
    const trainee = load().trainee;
    remove(KEY);
    if (trainee.id) {
      const data = blank();
      data.trainee = trainee;
      save(data);
    }
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
    tidyId: tidyId,
    current: current,
    signIn: signIn,
    signOut: signOut,
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
