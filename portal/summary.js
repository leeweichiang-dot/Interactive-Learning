/*
 * Turns one trainee's progress (the `items` map saved by tracker.js) into a
 * summary against the catalogue. Used by the portal pages and the instructor
 * dashboard so both count progress the same way.
 *
 * An item's score uses the latest answer to each question it has asked, so it
 * reflects where the trainee is now. That works the same for a quiz answered
 * all at once and for an activity that asks one question per round.
 * Weak topics come from the `topic` on each answer (or the item's title).
 */
window.ProgressSummary = (function () {
  "use strict";

  const TYPES = ["tool", "lesson", "quiz"];

  // Score bands, shared so every page labels them the same way.
  const STRONG = 80;
  const WEAK = 50;

  function band(pct) {
    if (pct == null) return "none";
    if (pct >= STRONG) return "strong";
    if (pct >= WEAK) return "developing";
    return "weak";
  }

  function pct(right, total) {
    return total > 0 ? Math.round((right / total) * 100) : null;
  }

  function average(values) {
    const real = values.filter(function (v) { return v != null; });
    if (real.length === 0) return null;
    return Math.round(real.reduce(function (a, b) { return a + b; }, 0) / real.length);
  }

  function catalogue() {
    const cat = window.CATALOGUE || {};
    const modules = (cat.modules || []).filter(function (mod) { return !mod.hidden; });
    const items = (cat.items || []).filter(function (item) {
      return !item.hidden && TYPES.indexOf(item.type) !== -1 &&
        modules.some(function (mod) { return mod.id === item.module; });
    });
    return { modules: modules, items: items };
  }

  function summarise(progressItems) {
    const cat = catalogue();
    const records = progressItems || {};
    const topics = {};
    const questions = {};

    const modules = cat.modules.map(function (mod) {
      const items = cat.items.filter(function (item) { return item.module === mod.id; }).map(function (item) {
        const key = item.module + "/" + item.id;
        const record = records[key];
        const attempts = (record && record.attempts) || [];
        const status = !record ? "none" : record.completed ? "done" : "started";

        // Latest answer to each question (attempts are oldest first).
        const latestAnswers = {};
        attempts.forEach(function (attempt) {
          (attempt.answers || []).forEach(function (answer) {
            latestAnswers[answer.q] = answer;
          });
        });
        const answers = Object.keys(latestAnswers).map(function (q) { return latestAnswers[q]; });
        const right = answers.filter(function (a) { return a.correct; }).length;

        answers.forEach(function (answer) {
          const topicName = answer.topic || item.title;
          const tKey = mod.id + "/" + topicName;
          const topic = topics[tKey] || (topics[tKey] = { key: tKey, module: mod, name: topicName, right: 0, total: 0, items: [] });
          topic.total += 1;
          if (answer.correct) topic.right += 1;
          if (topic.items.indexOf(item) === -1) topic.items.push(item);

          const qKey = key + "/" + answer.q;
          questions[qKey] = { key: qKey, item: item, module: mod, prompt: answer.q, topic: topicName, correct: !!answer.correct };
        });

        return {
          key: key,
          item: item,
          status: status,
          attempts: attempts.length,
          answered: answers.length,
          right: right,
          latest: pct(right, answers.length)
        };
      });

      const done = items.filter(function (i) { return i.status === "done"; }).length;
      return {
        module: mod,
        items: items,
        total: items.length,
        done: done,
        completion: pct(done, items.length),
        quizScore: average(items.map(function (i) { return i.latest; }))
      };
    });

    const allItems = [].concat.apply([], modules.map(function (m) { return m.items; }));
    const done = allItems.filter(function (i) { return i.status === "done"; }).length;
    const topicList = Object.keys(topics).map(function (k) {
      const t = topics[k];
      t.score = pct(t.right, t.total);
      return t;
    }).sort(function (a, b) { return a.score - b.score; });

    return {
      modules: modules,
      items: allItems,
      total: allItems.length,
      done: done,
      started: allItems.filter(function (i) { return i.status !== "none"; }).length,
      completion: pct(done, allItems.length),
      quizScore: average(allItems.map(function (i) { return i.latest; })),
      topics: topicList,
      questions: Object.keys(questions).map(function (k) { return questions[k]; })
    };
  }

  return {
    summarise: summarise,
    band: band,
    pct: pct,
    average: average,
    catalogue: catalogue,
    STRONG: STRONG,
    WEAK: WEAK
  };
})();
