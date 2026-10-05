/*
 * A made-up class for the "Try with sample class" button on instructor.html,
 * so the dashboard can be explored before any trainee hands in a file.
 * Returns progress files in the same format tracker.js downloads, using the
 * same question names and topics as the real items. Some topics are made
 * harder than others so the weak areas stand out.
 */
window.SAMPLE_CLASS = function () {
  "use strict";

  const PEOPLE = [
    ["Aisha Rahman", "AMT-01"], ["Ben Tan", "AMT-01"], ["Chloe Lim", "AMT-01"], ["Daniel Ng", "AMT-01"],
    ["Farah Ismail", "AMT-01"], ["Gabriel Ong", "AMT-01"], ["Hui Min Goh", "AMT-02"], ["Imran Yusof", "AMT-02"],
    ["Jia Hui Koh", "AMT-02"], ["Kumar Pillai", "AMT-02"], ["Lucas Teo", "AMT-02"], ["Mei Ling Chua", "AMT-02"]
  ];

  // Aircraft Familiarisation: the three Parts Checks. [part, topic]; topic difficulty below.
  const CHECKS = [
    ["Aircraft Parts", [["Fuselage", "Main parts"], ["Cockpit", "Main parts"], ["Air intakes", "Main parts"], ["Wings", "Main parts"],
      ["Engines", "Main parts"], ["Vertical stabilisers (fins)", "Main parts"], ["Landing gear", "Main parts"],
      ["Flaps", "Control surfaces"], ["Ailerons", "Control surfaces"], ["Stabilators", "Control surfaces"], ["Rudders", "Control surfaces"]]],
    ["Fuselage and Wing Structure", [["Frames", "Fuselage structure"], ["Bulkheads", "Fuselage structure"], ["Longerons", "Fuselage structure"],
      ["Fuselage skin", "Fuselage structure"], ["Spars", "Wing structure"], ["Ribs", "Wing structure"], ["Wing skin", "Wing structure"],
      ["Flaps", "Wing control surfaces"], ["Ailerons", "Wing control surfaces"], ["Fuel tanks", "Fuel"]]],
    ["Engine and Empennage", [["Air intake", "Engine"], ["Fan", "Engine"], ["Compressor", "Engine"], ["Combustion chamber", "Engine"],
      ["Turbine", "Engine"], ["Afterburner", "Engine"], ["Exhaust nozzle", "Engine"], ["Rear fuselage", "Empennage"],
      ["Vertical stabilisers (fins)", "Empennage"], ["Rudders", "Empennage control surfaces"], ["Stabilators", "Empennage control surfaces"]]]
  ];

  // Cut the Thrust (fixed-wing): defects used in its training activities.
  const DEFECTS = ["Dirt, bugs or oil on wing", "External repair patch (raised, poorly blended)",
    "Protruding fasteners / rough paint / corrosion", "Misaligned or open panel / missing fairing",
    "Damaged leading edge or ice", "Flap or control mis-rigging", "Extra equipment installed"];
  const TOPICS = {
    force: "Which force changes most",
    report: "Matching defects to pilot reports",
    diagnose: "Diagnosing defects",
    order: "Ranking fixes by performance gain"
  };

  const DIFFICULTY = {
    "Main parts": 0.05, "Control surfaces": 0.45, "Fuselage structure": 0.5, "Wing structure": 0.3,
    "Wing control surfaces": 0.35, "Fuel": 0.2, "Engine": 0.25, "Empennage": 0.15, "Empennage control surfaces": 0.4
  };
  DIFFICULTY[TOPICS.force] = 0.3;
  DIFFICULTY[TOPICS.report] = 0.45;
  DIFFICULTY[TOPICS.diagnose] = 0.35;
  DIFFICULTY[TOPICS.order] = 0.6;

  // Small seeded random generator, so the sample looks the same every time.
  let seed = 11;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function pickSome(list, n) {
    return list.slice().sort(function () { return random() - 0.5; }).slice(0, n);
  }

  function day(n, hour) {
    return new Date(Date.UTC(2026, 8, n, hour || 9)).toISOString();
  }

  return PEOPLE.map(function (person, p) {
    const ability = 0.35 + random() * 0.65;
    const engagement = 0.35 + random() * 0.65;
    const items = {};

    function answer(q, topic) {
      return { q: q, topic: topic, correct: random() < 1 - DIFFICULTY[topic] * (1.6 - ability) };
    }

    function attempt(record, d, answers) {
      const score = answers.filter(function (a) { return a.correct; }).length;
      record.attempts.push({ date: day(d, 10 + record.attempts.length % 8), score: score, total: answers.length, answers: answers });
      record.updated = record.attempts[record.attempts.length - 1].date;
    }

    // Aircraft Familiarisation: some or all of the Parts Checks.
    const lesson = { type: "lesson", opened: day(1), updated: day(1), completed: null, attempts: [] };
    items["aircraft/aircraft-familiarisation"] = lesson;
    const checksDone = Math.min(3, Math.floor(engagement * 3.6));
    CHECKS.slice(0, checksDone).forEach(function (check, c) {
      attempt(lesson, 1 + c, check[1].map(function (part) {
        return answer(check[0] + ": find the " + part[0].toLowerCase(), part[1]);
      }));
    });
    if (checksDone === 3) lesson.completed = lesson.updated;

    // Cut the Thrust: a few rounds of each training activity.
    if (random() < engagement + 0.25) {
      const tool = { type: "tool", opened: day(5), updated: day(5), completed: day(5), attempts: [] };
      items["flight/cut-the-thrust"] = tool;
      const q = function (text) { return "Fixed-wing · " + text; };

      pickSome(DEFECTS, 2 + Math.floor(engagement * 4)).forEach(function (name) {
        attempt(tool, 5, [
          answer(q(name + ": which force changes most"), TOPICS.force),
          answer(q(name + ": what the pilot reports"), TOPICS.report)
        ]);
      });
      if (engagement > 0.5) {
        const mystery = pickSome(DEFECTS, 2).map(function (name) { return answer(q("diagnose " + name), TOPICS.diagnose); });
        mystery.push(answer(q("diagnosis with no false alarms"), TOPICS.diagnose));
        attempt(tool, 6, mystery);
      }
      if (engagement > 0.65) {
        attempt(tool, 6, pickSome(DEFECTS, 3).map(function (name) { return answer(q("place the fix: " + name), TOPICS.order); }));
      }
    }

    return {
      app: "interactive-learning",
      version: 1,
      exportedAt: day(10 + (p % 3)),
      trainee: { name: person[0], group: person[1] },
      items: items
    };
  });
};
