/*
 * Competency check (section 5).
 *
 * 12 questions shown one at a time. Immediate feedback, a hint and one retry after a
 * wrong answer, a percentage score, performance by category, and which section to revisit.
 *
 * Progress is saved only in this browser (localStorage). No name or personal information
 * is asked for or stored. The passing mark and retry credit come from competency-config.js.
 * When the check is finished, the score is also given to the portal tracker (if present),
 * which keeps it in the same browser.
 *
 * This tool supports training. It does not replace practical assessment or approved
 * technical publications.
 */
(function () {
  "use strict";

  const root = document.getElementById("assess");
  if (!root) return;
  const $ = function (id) { return document.getElementById(id); };
  const NS = "http://www.w3.org/2000/svg";

  /* ---------- Settings (competency-config.js) ---------- */

  function setting(value, min, max, fallback) {
    const n = Number(value);
    return isFinite(n) && n >= min && n <= max ? n : fallback;
  }
  const CONFIG = window.COMPETENCY_CONFIG || {};
  const PASS = setting(CONFIG.passMark, 0, 100, 80);
  const RETRY = setting(CONFIG.retryCredit, 0, 1, 0);

  /* ---------- Categories and the section to revisit ---------- */

  const CATEGORIES = [
    { id: "component", name: "Component identification", section: 0, sectionName: "1. System Overview" },
    { id: "pressure", name: "Pressure relationships", section: 0, sectionName: "1. System Overview" },
    { id: "instrument", name: "Instrument interpretation", section: 2, sectionName: "3. Flight Simulation" },
    { id: "fault", name: "Fault recognition", section: 3, sectionName: "4. Fault Investigation" }
  ];

  /* ---------- Questions ---------- */

  const PARTS = {
    tube: "Pitot tube", portL: "Left static port", portR: "Right static port",
    linePitot: "Pitot pressure line (red)", lineStatic: "Static pressure line (blue)",
    asi: "Airspeed indicator", alt: "Altimeter", vsi: "Vertical speed indicator"
  };

  const TOTAL_STATIC = [{ value: "total", label: "Total (pitot) pressure" }, { value: "static", label: "Static pressure" }];
  const MAY_NOT = [{ value: "may", label: "May be affected" }, { value: "not", label: "Not directly affected" }];

  // type: "mc" (multiple choice), "select" (pick a part on the diagram),
  //       "match" (match to a pressure source), "predict" (predict each instrument's response)
  const QUESTIONS = [
    {
      id: "c1", category: "component", type: "select",
      prompt: "Select the pitot tube on the diagram.",
      target: "tube",
      hint: "It sticks out at the very front of the aircraft and faces the oncoming air.",
      explain: "The pitot tube is at the nose and faces the airflow. Air is pushed into it, so it senses total pressure."
    },
    {
      id: "c2", category: "component", type: "mc",
      prompt: "A small hole on the side of the aircraft senses the pressure of the air around it. What is it called?",
      options: ["Pitot tube", "Static port", "Drain opening", "Pitot heater"], answer: 1,
      hint: "It senses air that slides past it, not air that is pushed in.",
      explain: "A static port is a small flat hole on the side of the aircraft. Air slides past it, so it senses static pressure: the pressure of the air around the aircraft."
    },
    {
      id: "c3", category: "component", type: "select",
      prompt: "Select the altimeter. It shows height.",
      target: "alt",
      hint: "Look for the dial with the scale marked x1000 ft.",
      explain: "The altimeter shows height. Its dial is marked in thousands of feet. It reads static pressure and turns it into a height."
    },
    {
      id: "c4", category: "component", type: "match",
      prompt: "Match each part to the pressure it senses.",
      choices: TOTAL_STATIC,
      rows: [
        { label: "Pitot tube", answer: "total" },
        { label: "Right static port", answer: "static" },
        { label: "Left static port", answer: "static" }
      ],
      hint: "The part that faces the airflow senses the bigger pressure. The parts on the side sense the surrounding air.",
      explain: "The pitot tube faces the airflow, so it senses total pressure. Both static ports sit on the side of the aircraft and sense static pressure."
    },
    {
      id: "p1", category: "pressure", type: "match",
      prompt: "Match each instrument to the pressure it uses.",
      choices: [
        { value: "both", label: "Pitot and static pressure" },
        { value: "static", label: "Static pressure only" },
        { value: "change", label: "Changes in static pressure over time" }
      ],
      rows: [
        { label: "Airspeed indicator", answer: "both" },
        { label: "Altimeter", answer: "static" },
        { label: "Vertical speed indicator", answer: "change" }
      ],
      hint: "Only one instrument needs the pitot tube. One instrument watches how fast the pressure changes.",
      explain: "The airspeed indicator compares pitot and static pressure. The altimeter reads static pressure only. The vertical speed indicator uses how quickly static pressure is changing."
    },
    {
      id: "p2", category: "pressure", type: "mc",
      prompt: "How is dynamic pressure found?",
      options: ["Total pressure minus static pressure", "Total pressure plus static pressure", "Static pressure on its own"], answer: 0,
      hint: "Dynamic pressure is the extra push from moving through the air.",
      explain: "Dynamic pressure = total pressure − static pressure. It is the extra pressure caused by moving through the air, and it gets bigger as the aircraft goes faster."
    },
    {
      id: "p3", category: "pressure", type: "select",
      prompt: "Select the line that carries total pressure to the airspeed indicator.",
      target: "linePitot",
      hint: "This line starts at the pitot tube. Only one instrument is connected to it.",
      explain: "The pitot line carries total pressure from the pitot tube to the airspeed indicator only. No other instrument is connected to it."
    },
    {
      id: "i1", category: "instrument", type: "predict",
      prompt: "The aircraft climbs at a steady speed. What happens to each instrument?",
      rows: [
        { label: "Airspeed indicator", answer: "same", choices: [{ value: "up", label: "Reading rises" }, { value: "same", label: "Stays about the same" }, { value: "down", label: "Reading falls" }] },
        { label: "Altimeter", answer: "up", choices: [{ value: "down", label: "Reading falls" }, { value: "up", label: "Reading rises" }, { value: "same", label: "Stays the same" }] },
        { label: "Vertical speed indicator", answer: "climb", choices: [{ value: "climb", label: "Shows a climb" }, { value: "zero", label: "Shows zero" }, { value: "descent", label: "Shows a descent" }] }
      ],
      hint: "Think about static pressure as the aircraft goes higher. Does the airflow past the pitot tube change?",
      explain: "Static pressure falls as the aircraft climbs, so the altimeter reading rises and the vertical speed indicator shows a climb. The airflow past the pitot tube stays the same, so the airspeed stays about the same."
    },
    {
      id: "i2", category: "instrument", type: "predict",
      prompt: "The pilot levels off after the climb. What happens now?",
      rows: [
        { label: "Altimeter", answer: "hold", choices: [{ value: "rise", label: "Keeps rising" }, { value: "back", label: "Falls back to the airfield height" }, { value: "hold", label: "Holds the new height" }] },
        { label: "Vertical speed indicator", answer: "zero", choices: [{ value: "keep", label: "Keeps showing the climb" }, { value: "descent", label: "Shows a descent" }, { value: "zero", label: "Moves back toward zero" }] }
      ],
      hint: "When the height stops changing, what is static pressure doing?",
      explain: "Once the aircraft stops climbing, static pressure stops changing. The altimeter holds the new height and the vertical speed indicator moves back toward zero."
    },
    {
      id: "i3", category: "instrument", type: "mc",
      prompt: "Why does the altimeter reading rise in a climb?",
      options: ["The aircraft is moving faster", "Total pressure rises as the aircraft goes higher", "Static pressure falls as the aircraft goes higher"], answer: 2,
      hint: "The altimeter uses static pressure only.",
      explain: "Air pressure falls as height increases. The altimeter turns the lower static pressure into a greater height reading."
    },
    {
      id: "f1", category: "fault", type: "predict",
      prompt: "Both static ports are blocked, then the aircraft climbs. Which instruments may be affected?",
      rows: [
        { label: "Airspeed indicator", answer: "may", choices: MAY_NOT },
        { label: "Altimeter", answer: "may", choices: MAY_NOT },
        { label: "Vertical speed indicator", answer: "may", choices: MAY_NOT }
      ],
      hint: "Count how many instruments use static pressure.",
      explain: "All three instruments use static pressure. With the ports blocked, the static line holds old pressure. The altimeter may stay at the earlier height, the vertical speed indicator may read near zero, and the airspeed indicator may read wrongly. Real behaviour depends on the aircraft design and approved technical documents."
    },
    {
      id: "f2", category: "fault", type: "mc",
      prompt: "The pitot inlet is blocked. Which statement is best?",
      options: [
        "The altimeter and vertical speed indicator are affected, but the airspeed indicator is fine",
        "The airspeed indicator may be affected, but the altimeter is not directly affected",
        "All three instruments are affected in the same way"
      ], answer: 1,
      hint: "Which instrument is the only one that uses the pitot tube?",
      explain: "Only the airspeed indicator needs total pressure from the pitot tube. The altimeter and vertical speed indicator use static pressure, so they are not directly affected. Real behaviour depends on the aircraft design and approved technical documents."
    }
  ];

  /* ---------- Saved progress (this browser only) ---------- */

  const KEY = "pitot-static-competency-v1";
  let storageOk = true;

  function freshState() { return { v: 1, index: 0, records: {}, done: false, attempts: 0, best: null }; }

  function load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return freshState();
      const data = JSON.parse(raw);
      const state = freshState();
      if (data && data.v === 1) {
        state.index = Math.max(0, Math.min(QUESTIONS.length, Number(data.index) || 0));
        state.done = data.done === true;
        state.attempts = Math.max(0, Number(data.attempts) || 0);
        state.best = typeof data.best === "number" ? data.best : null;
        QUESTIONS.forEach(function (q) {
          const r = data.records && data.records[q.id];
          if (r && (r.tries === 1 || r.tries === 2 || r.tries === 0)) {
            state.records[q.id] = { tries: r.tries, outcome: ["first", "retry", "missed"].indexOf(r.outcome) !== -1 ? r.outcome : null };
          }
        });
      }
      return state;
    } catch (e) {
      storageOk = false;
      return freshState();
    }
  }
  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { storageOk = false; showStorageNote(); }
  }
  function wipe() {
    try { window.localStorage.removeItem(KEY); } catch (e) { storageOk = false; }
  }

  let state = load();

  /* ---------- Scoring ---------- */

  function points(outcome) { return outcome === "first" ? 1 : outcome === "retry" ? RETRY : 0; }

  function results() {
    let total = 0;
    const cats = CATEGORIES.map(function (c) {
      const qs = QUESTIONS.filter(function (q) { return q.category === c.id; });
      let pts = 0, firstTime = 0;
      qs.forEach(function (q) {
        const r = state.records[q.id];
        pts += points(r && r.outcome);
        if (r && r.outcome === "first") firstTime++;
      });
      total += pts;
      return { cat: c, count: qs.length, firstTime: firstTime, percent: Math.round(pts / qs.length * 100) };
    });
    return { percent: Math.round(total / QUESTIONS.length * 100), points: total, cats: cats };
  }

  /* ---------- Small helpers ---------- */

  function el(tag, props, text) {
    const e = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) { e[k] = props[k]; });
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function sentence(text) { return /[.!?]$/.test(text) ? text : text + "."; }
  function goToSection(i) {
    const buttons = document.querySelectorAll("#steps button");
    if (buttons[i]) { buttons[i].click(); $("steps").scrollIntoView(); }
  }

  /* ---------- Screens ---------- */

  const intro = $("aIntro"), questionView = $("aQuestion"), resultsView = $("aResults");
  function showOnly(view) {
    [intro, questionView, resultsView].forEach(function (v) { v.hidden = v !== view; });
  }
  function showStorageNote() {
    $("aStorageNote").textContent = storageOk
      ? "Your progress is saved only in this browser, on this device. No name or personal information is collected."
      : "This browser is not letting the page save progress, so your answers will not be remembered if you leave. No name or personal information is collected.";
  }

  function scoringRules() {
    let text = "Each question counts if you answer it correctly the first time. If you are wrong, you get a hint and one retry.";
    if (RETRY === 0) text += " A correct retry helps you learn but does not add to your score.";
    else if (RETRY >= 1) text += " A correct retry earns the full point.";
    else text += " A correct retry earns " + Math.round(RETRY * 100) + "% of a point.";
    return text;
  }

  function renderIntro() {
    const answered = QUESTIONS.filter(function (q) { return state.records[q.id] && state.records[q.id].outcome; }).length;
    $("aPass").textContent = "Passing mark: " + PASS + "%. " + scoringRules();
    const resume = answered > 0 || (state.records[QUESTIONS[state.index] && QUESTIONS[state.index].id]);
    $("aStart").textContent = answered === QUESTIONS.length ? "See my results" : resume ? "Resume the check" : "Start the check";
    $("aSaved").textContent = resume ? "You have answered " + answered + " of " + QUESTIONS.length + " questions." : "";
    $("aMeta").textContent = state.attempts ? "Completed attempts on this device: " + state.attempts + ". Best score: " + state.best + "%." : "";
    showOnly(intro);
  }

  /* ---------- Diagram for the "select the part" questions ---------- */

  const source = document.getElementById("simSvg");
  let svg = null, chosen = null, selectCount = 0;
  const partEls = {};   // part id -> elements that light up

  function buildDiagram() {
    if (!source || !window.SimCommon) return;
    svg = source.cloneNode(true);
    const C = window.SimCommon;
    const needles = { asi: svg.querySelector("#needleAsi"), alt: svg.querySelector("#needleAlt"), vsi: svg.querySelector("#needleVsi") };
    const dots = svg.querySelector("#simDots");
    while (dots.firstChild) dots.removeChild(dots.firstChild);
    svg.querySelectorAll("[id]").forEach(function (e) { e.removeAttribute("id"); });
    svg.removeAttribute("id");
    svg.classList.remove("has-sel");
    svg.querySelectorAll("[data-dim]").forEach(function (e) { e.removeAttribute("data-dim"); });
    svg.querySelectorAll(".rel, .dimmed").forEach(function (e) { e.classList.remove("rel", "dimmed"); });
    // No names on the diagram: the trainee has to recognise the parts. Dial scales stay.
    svg.querySelectorAll("text").forEach(function (t) {
      if (!t.classList.contains("num") && !t.classList.contains("unit")) t.remove();
    });
    svg.querySelector("title").textContent = "Diagram for the question";
    svg.querySelector("desc").textContent = "A generic training aircraft seen from above with a nose tube, two small side ports, a red line, blue lines and three dials. Select a part by clicking it, or use the list below the diagram.";
    svg.removeAttribute("aria-labelledby");
    svg.setAttribute("aria-label", "Diagram for the question. Select a part by clicking it, or use the list below.");
    [["asi", 140], ["alt", 3000], ["vsi", 0]].forEach(function (p) {
      const g = C.GAUGES[p[0]];
      const deg = p[0] === "asi" ? C.asiDeg(p[1]) : p[0] === "alt" ? C.altDeg(p[1]) : C.vsiDeg(p[1]);
      needles[p[0]].setAttribute("transform", "rotate(" + deg.toFixed(1) + " " + g.cx + " " + g.cy + ")");
    });

    function tag(elements, part) {
      elements.forEach(function (e) {
        e.setAttribute("data-sel", part);
        (partEls[part] = partEls[part] || []).push(e);
      });
    }
    const q = function (name) { return Array.from(svg.querySelectorAll('[data-el="' + name + '"]')); };
    tag(q("tube"), "tube");
    tag(q("portL"), "portL");
    tag(q("portR"), "portR");
    tag(q("linePitot"), "linePitot");
    tag(["lineSR", "lineSL", "lineTrunk", "bus", "brAsi", "brAlt", "brVsi"].reduce(function (a, n) { return a.concat(q(n)); }, []), "lineStatic");
    tag(q("asi"), "asi");
    tag(q("alt"), "alt");
    tag(q("vsi"), "vsi");
    ["asi", "alt", "vsi"].forEach(function (g) {   // the needle and scale count as part of the dial
      partEls[g][0].parentNode.setAttribute("data-sel", g);
    });

    // Wider invisible targets so thin parts are easy to click or tap
    Object.keys(partEls).forEach(function (part) {
      partEls[part].slice().forEach(function (e) {
        if (e.tagName === "path" && !e.classList.contains("hit")) {
          const hit = document.createElementNS(NS, "path");
          hit.setAttribute("d", e.getAttribute("d"));
          hit.setAttribute("class", "hit");
          hit.setAttribute("data-sel", part);
          e.parentNode.insertBefore(hit, e.nextSibling);
        } else if (e.tagName === "circle" && e.getAttribute("r") < 20) {
          const hit = document.createElementNS(NS, "circle");
          ["cx", "cy"].forEach(function (k) { hit.setAttribute(k, e.getAttribute(k)); });
          hit.setAttribute("r", "16");
          hit.setAttribute("class", "hit-fill");
          hit.setAttribute("data-sel", part);
          e.parentNode.insertBefore(hit, e.nextSibling);
        }
      });
    });
    svg.addEventListener("click", function (ev) {
      const t = ev.target.closest("[data-sel]");
      if (t && !svg.classList.contains("locked")) choosePart(t.getAttribute("data-sel"));
    });
    $("aDiagram").appendChild(svg);
  }

  function lightParts(part, cls) {
    (partEls[part] || []).forEach(function (e) { e.classList.add(cls); });
  }
  function clearParts() {
    Object.keys(partEls).forEach(function (p) {
      partEls[p].forEach(function (e) { e.classList.remove("chosen", "right", "wrong"); });
    });
  }
  function choosePart(part) {
    chosen = part;
    clearParts();
    lightParts(part, "chosen");
    const radio = root.querySelector('#aList input[value="' + part + '"]');
    if (radio) radio.checked = true;
    $("aCheck").disabled = false;
  }

  /* ---------- One question ---------- */

  let index = 0;       // question being shown
  let tries = 0;       // wrong answers so far for this question
  let finished = false;
  const checkBtn = $("aCheck"), nextBtn = $("aNext"), feedbackEl = $("aFeedback"), answerEl = $("aAnswer");

  function currentQ() { return QUESTIONS[index]; }
  function category(q) { return CATEGORIES.filter(function (c) { return c.id === q.category; })[0]; }

  function renderQuestion() {
    const q = currentQ();
    const record = state.records[q.id];
    tries = record ? record.tries : 0;
    finished = false;
    chosen = null;
    showOnly(questionView);
    $("aCount").textContent = "Question " + (index + 1) + " of " + QUESTIONS.length;
    $("aCategory").textContent = category(q).name;
    $("aBar").style.width = (index / QUESTIONS.length * 100) + "%";
    $("aProg").setAttribute("aria-valuenow", String(index));
    $("aPrompt").textContent = q.prompt;
    $("aPrompt").focus();
    feedbackEl.textContent = "";
    feedbackEl.className = "a-feedback";
    nextBtn.hidden = true;
    checkBtn.hidden = false;
    checkBtn.textContent = tries === 1 ? "Try again" : "Check answer";
    checkBtn.disabled = true;
    answerEl.textContent = "";
    $("aDiagramWrap").hidden = q.type !== "select";
    if (svg) { svg.classList.remove("locked"); clearParts(); }

    if (q.type === "mc") buildChoices(q);
    else if (q.type === "select") buildSelect(q);
    else buildRows(q);

    if (tries === 1) {
      feedbackEl.className = "a-feedback try";
      feedbackEl.textContent = "You answered this once already. Hint: " + sentence(q.hint) + " You have one retry left.";
    }
  }

  function buildChoices(q) {
    const group = el("div", { className: "a-choices", role: "radiogroup" });
    group.setAttribute("aria-labelledby", "aPrompt");
    q.options.forEach(function (text, i) {
      const label = el("label");
      const input = el("input", { type: "radio", name: "aChoice", value: String(i) });
      input.addEventListener("change", function () { checkBtn.disabled = false; });
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + text));
      group.appendChild(label);
    });
    answerEl.appendChild(group);
  }

  function buildSelect(q) {
    const details = el("details", { className: "a-alt" });
    details.appendChild(el("summary", null, "Cannot use the diagram? Choose from a list instead"));
    const group = el("div", { className: "a-choices", id: "aList", role: "radiogroup" });
    group.setAttribute("aria-label", "List of parts");
    Object.keys(PARTS).forEach(function (id) {
      const label = el("label");
      const input = el("input", { type: "radio", name: "aPart", value: id });
      input.addEventListener("change", function () { choosePart(id); });
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + PARTS[id]));
      group.appendChild(label);
    });
    details.appendChild(group);
    answerEl.appendChild(details);
    if (!svg) details.open = true;
  }

  function buildRows(q) {
    const table = el("div", { className: "a-rows" });
    q.rows.forEach(function (row, i) {
      const wrap = el("div", { className: "a-row" });
      const label = el("label", { htmlFor: "aRow" + i }, row.label);
      const select = el("select", { id: "aRow" + i });
      select.appendChild(el("option", { value: "" }, "Choose…"));
      (row.choices || q.choices).forEach(function (c) { select.appendChild(el("option", { value: c.value }, c.label)); });
      select.addEventListener("change", function () {
        checkBtn.disabled = !Array.from(table.querySelectorAll("select")).every(function (s) { return s.value; });
      });
      wrap.appendChild(label);
      wrap.appendChild(select);
      wrap.appendChild(el("span", { className: "a-status", id: "aStatus" + i }));
      table.appendChild(wrap);
    });
    answerEl.appendChild(table);
  }

  function readAnswer(q) {
    if (q.type === "mc") {
      const r = root.querySelector('input[name="aChoice"]:checked');
      return r ? Number(r.value) : null;
    }
    if (q.type === "select") return chosen;
    return q.rows.map(function (row, i) { return $("aRow" + i).value; });
  }
  function isCorrect(q, a) {
    if (q.type === "mc") return a === q.answer;
    if (q.type === "select") return a === q.target;
    return q.rows.every(function (row, i) { return a[i] === row.answer; });
  }
  function choiceLabel(q, row, value) {
    return (row.choices || q.choices).filter(function (c) { return c.value === value; })[0].label;
  }
  function correctText(q) {
    if (q.type === "mc") return q.options[q.answer];
    if (q.type === "select") return PARTS[q.target];
    return q.rows.map(function (row) { return row.label + ": " + choiceLabel(q, row, row.answer); }).join(". ");
  }

  function lock() {
    answerEl.querySelectorAll("input, select").forEach(function (c) { c.disabled = true; });
    if (svg) svg.classList.add("locked");
    checkBtn.hidden = true;
    nextBtn.hidden = false;
    nextBtn.textContent = index === QUESTIONS.length - 1 ? "See my results" : "Next question";
    nextBtn.focus();
  }

  function markRows(q, a) {   // text marks, so colour is not the only cue
    q.rows.forEach(function (row, i) {
      const ok = a[i] === row.answer;
      const status = $("aStatus" + i);
      status.className = "a-status " + (ok ? "ok" : "check");
      status.textContent = ok ? "Correct" : "Check this one";
    });
  }

  function check() {
    const q = currentQ();
    const a = readAnswer(q);
    if (a === null || (Array.isArray(a) && a.some(function (v) { return !v; }))) return;
    const ok = isCorrect(q, a);
    if (q.type !== "mc" && q.type !== "select") markRows(q, a);

    if (ok) {
      const outcome = tries === 0 ? "first" : "retry";
      finishQuestion(outcome);
      if (q.type === "select") { clearParts(); lightParts(q.target, "right"); }
      feedbackEl.className = "a-feedback good";
      feedbackEl.textContent = "Correct. " + sentence(q.explain) + (outcome === "retry" ? " This answer was correct on your retry." : "");
      lock();
      return;
    }
    tries++;
    if (tries === 1) {
      state.records[q.id] = { tries: 1, outcome: null };
      save();
      if (q.type === "select") { clearParts(); lightParts(chosen, "wrong"); }
      feedbackEl.className = "a-feedback try";
      feedbackEl.textContent = "Not quite. Hint: " + sentence(q.hint) + " You can try once more.";
      checkBtn.textContent = "Try again";
      checkBtn.disabled = q.type === "select" || q.type === "mc";   // pick again first
      if (q.type === "mc") { const r = root.querySelector('input[name="aChoice"]:checked'); if (r) r.checked = false; }
      if (q.type === "select") { chosen = null; const r = root.querySelector('#aList input:checked'); if (r) r.checked = false; }
      return;
    }
    // Second wrong answer: show the answer and why
    finishQuestion("missed");
    if (q.type === "select") { clearParts(); lightParts(q.target, "right"); }
    if (q.type !== "mc" && q.type !== "select") {
      q.rows.forEach(function (row, i) {
        if (a[i] !== row.answer) $("aStatus" + i).textContent = "Correct answer: " + choiceLabel(q, row, row.answer);
      });
    }
    feedbackEl.className = "a-feedback fail";
    feedbackEl.textContent = "Not quite. The correct answer is: " + sentence(correctText(q)) + " " + sentence(q.explain);
    lock();
  }

  function finishQuestion(outcome) {
    finished = true;
    state.records[currentQ().id] = { tries: tries, outcome: outcome };
    state.index = index + 1;
    save();
  }

  checkBtn.addEventListener("click", check);
  nextBtn.addEventListener("click", function () {
    if (index === QUESTIONS.length - 1) finishAssessment();
    else { index++; renderQuestion(); }
  });

  /* ---------- Results ---------- */

  function finishAssessment() {
    const r = results();
    state.done = true;
    state.attempts += 1;
    state.best = state.best === null ? r.percent : Math.max(state.best, r.percent);
    save();
    if (window.Tracker && typeof window.Tracker.quizResult === "function") {
      window.Tracker.quizResult(Math.round(r.points * 100) / 100, QUESTIONS.length, QUESTIONS.map(function (q, i) {
        const rec = state.records[q.id];
        return { q: "Competency check Q" + (i + 1) + ": " + q.prompt, topic: category(q).name, correct: points(rec && rec.outcome) >= 1 };
      }));
    }
    renderResults();
  }

  function renderResults() {
    const r = results();
    const passed = r.percent >= PASS;
    showOnly(resultsView);
    $("aScore").textContent = r.percent + "%";
    const verdict = $("aVerdict");
    verdict.textContent = passed
      ? "You met the passing mark of " + PASS + "%."
      : "You are below the passing mark of " + PASS + "%. Use the suggestions below, then try again.";
    verdict.className = "a-verdict " + (passed ? "pass" : "below");
    $("aResultMeta").textContent = "Completed attempts on this device: " + state.attempts + ". Best score: " + state.best + "%.";

    const list = $("aCats");
    list.textContent = "";
    r.cats.forEach(function (c) {
      const ok = c.percent >= PASS;
      const li = el("li", { className: ok ? "ok" : "low" });
      li.appendChild(el("strong", null, c.cat.name));
      li.appendChild(el("span", { className: "a-pct" }, c.percent + "%"));
      const bar = el("div", { className: "a-catbar" });
      const fill = el("span");
      fill.style.width = c.percent + "%";
      bar.appendChild(fill);
      li.appendChild(bar);
      li.appendChild(el("span", { className: "a-catnote" }, c.firstTime + " of " + c.count + " correct first time. " + (ok ? "Meets the passing mark." : "Below the passing mark.")));
      list.appendChild(li);
    });

    const rec = $("aRevisit");
    rec.textContent = "";
    const weak = r.cats.filter(function (c) { return c.percent < PASS; }).sort(function (a, b) { return a.percent - b.percent; });
    if (!weak.length) {
      rec.appendChild(el("p", null, "Every category meets the passing mark. You can go back to any section to practise more."));
    } else {
      rec.appendChild(el("p", null, "Suggested sections to revisit, weakest area first:"));
      const ul = el("ul", { className: "a-links" });
      weak.forEach(function (c) {
        const li = el("li");
        li.appendChild(el("span", null, c.cat.name + " (" + c.percent + "%): "));
        const b = el("button", { type: "button" }, "Go to section " + c.cat.sectionName);
        b.addEventListener("click", function () { goToSection(c.cat.section); });
        li.appendChild(b);
        ul.appendChild(li);
      });
      rec.appendChild(ul);
    }
    $("aResultTitle").focus();
  }

  /* ---------- Buttons ---------- */

  function begin() {
    const answered = QUESTIONS.filter(function (q) { return state.records[q.id] && state.records[q.id].outcome; }).length;
    if (answered === QUESTIONS.length) { finishAssessment(); return; }   // reloaded after the last answer
    index = Math.min(state.index, QUESTIONS.length - 1);
    renderQuestion();
  }
  $("aStart").addEventListener("click", begin);
  $("aRetry").addEventListener("click", function () {
    state.records = {};
    state.index = 0;
    state.done = false;
    save();
    $("aCleared").textContent = "";
    index = 0;
    renderQuestion();
  });
  function clearProgress() {
    if (!window.confirm("Clear your saved progress for this competency check on this device?")) return;
    wipe();
    storageOk = true;
    state = freshState();
    showStorageNote();
    $("aCleared").textContent = "Progress cleared.";
    renderIntro();
  }
  $("aClear").addEventListener("click", clearProgress);

  /* ---------- Start up ---------- */

  buildDiagram();
  showStorageNote();
  if (state.done) renderResults(); else renderIntro();
})();
