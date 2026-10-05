/*
 * Instructor dashboard (instructor.html).
 *
 * Reads trainees' progress files (made by tracker.js), summarises each with
 * portal/summary.js, and shows the class as a whole: completion, quiz scores,
 * weakest topics and questions, and who needs help with what.
 *
 * Everything stays in memory: nothing is uploaded or saved.
 */
(function () {
  "use strict";

  const PS = window.ProgressSummary;
  const APP = "interactive-learning";
  const MAX_FILE_BYTES = 2 * 1024 * 1024;

  const cat = PS.catalogue();
  const dashboard = document.getElementById("dashboard");
  const statusEl = document.getElementById("import-status");
  const errorsEl = document.getElementById("import-errors");
  const clearButton = document.getElementById("clear");

  let trainees = [];       // { id, name, group, items, summary }
  let usingSample = false;
  let groupFilter = "";
  let sortBy = "name";
  let selectedId = null;

  // Import

  document.getElementById("files").addEventListener("change", function (e) {
    addFiles(e.target.files);
    e.target.value = "";
  });

  const dropzone = document.getElementById("dropzone");
  dropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropzone.classList.add("dragging");
  });
  dropzone.addEventListener("dragleave", function () { dropzone.classList.remove("dragging"); });
  dropzone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropzone.classList.remove("dragging");
    addFiles(e.dataTransfer.files);
  });

  document.getElementById("sample").addEventListener("click", function () {
    trainees = [];
    usingSample = true;
    errorsEl.replaceChildren();
    (window.SAMPLE_CLASS ? window.SAMPLE_CLASS() : []).forEach(function (data, i) {
      addTrainee(clean(data), "sample-" + i);
    });
    statusEl.textContent = "Showing a made-up sample class of " + trainees.length + " trainees.";
    render();
  });

  clearButton.addEventListener("click", function () {
    trainees = [];
    usingSample = false;
    selectedId = null;
    groupFilter = "";
    statusEl.textContent = "";
    errorsEl.replaceChildren();
    render();
  });

  function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    if (usingSample) {
      trainees = [];
      usingSample = false;
    }
    errorsEl.replaceChildren();

    Promise.all(files.map(function (file) {
      if (file.size > MAX_FILE_BYTES) return Promise.resolve({ file: file, error: "too large to be a progress file" });
      return file.text().then(function (text) {
        try {
          return { file: file, data: clean(JSON.parse(text)) };
        } catch (err) {
          return { file: file, error: err instanceof SyntaxError ? "not a valid progress file" : err.message };
        }
      }, function () {
        return { file: file, error: "couldn't be read" };
      });
    })).then(function (results) {
      let added = 0;
      results.forEach(function (r) {
        if (r.error) {
          errorsEl.append(el("li", { text: r.file.name + ": " + r.error }));
        } else {
          addTrainee(r.data, r.file.name);
          added += 1;
        }
      });
      statusEl.textContent = "Added " + added + (added === 1 ? " file" : " files") +
        ". " + trainees.length + (trainees.length === 1 ? " trainee" : " trainees") + " loaded.";
      render();
    });
  }

  // Keeps only the fields we use, with the types we expect.
  function clean(data) {
    if (!data || data.app !== APP || !data.items || typeof data.items !== "object") {
      throw new Error("not an Interactive Learning progress file");
    }
    const trainee = data.trainee || {};
    const items = {};
    Object.keys(data.items).forEach(function (key) {
      const r = data.items[key];
      if (!/^[\w-]+\/[\w-]+$/.test(key) || !r || typeof r !== "object") return;
      items[key] = {
        type: String(r.type || ""),
        updated: String(r.updated || ""),
        completed: r.completed ? String(r.completed) : null,
        attempts: (Array.isArray(r.attempts) ? r.attempts : []).filter(function (a) {
          return a && isFinite(a.score) && isFinite(a.total) && a.total > 0;
        }).map(function (a) {
          return {
            date: String(a.date || ""),
            score: Number(a.score),
            total: Number(a.total),
            answers: (Array.isArray(a.answers) ? a.answers : []).map(function (ans) {
              return { q: String(ans && ans.q || ""), topic: String(ans && ans.topic || ""), correct: !!(ans && ans.correct) };
            })
          };
        })
      };
    });
    return {
      name: String(trainee.name || "").trim().slice(0, 80),
      group: String(trainee.group || "").trim().slice(0, 40),
      items: items
    };
  }

  // The same trainee handing in a newer file updates their record, item by item.
  function addTrainee(data, fileName) {
    const name = data.name || "Unnamed (" + fileName + ")";
    const id = (name + "|" + data.group).toLowerCase();
    let trainee = trainees.find(function (t) { return t.id === id; });
    if (!trainee) {
      trainee = { id: id, name: name, group: data.group, items: {} };
      trainees.push(trainee);
    }
    Object.keys(data.items).forEach(function (key) {
      const current = trainee.items[key];
      if (!current || data.items[key].updated >= current.updated) trainee.items[key] = data.items[key];
    });
    trainee.summary = PS.summarise(trainee.items);
  }

  // Rendering

  function render() {
    dashboard.replaceChildren();
    clearButton.hidden = trainees.length === 0;
    if (trainees.length === 0) {
      dashboard.append(el("p", { className: "notice", text: "No progress files added yet. Ask trainees to open My progress, add their name and download their file." }));
      return;
    }

    const groups = unique(trainees.map(function (t) { return t.group; }).filter(Boolean)).sort();
    if (groupFilter && groups.indexOf(groupFilter) === -1) groupFilter = "";
    const shown = trainees.filter(function (t) { return !groupFilter || t.group === groupFilter; });

    if (usingSample) dashboard.append(el("p", { className: "notice", text: "Sample data: these trainees are made up. Add real progress files to replace them." }));
    if (groups.length > 1) dashboard.append(groupPicker(groups));

    renderStats(shown);
    renderWeakAreas(shown);
    renderModules(shown);
    renderTrainees(shown);
    renderDetail(shown);
  }

  function groupPicker(groups) {
    const select = el("select", { id: "group" });
    select.append(el("option", { text: "All groups", attrs: { value: "" } }));
    groups.forEach(function (g) {
      select.append(el("option", { text: g, attrs: { value: g } }));
    });
    select.value = groupFilter;
    select.addEventListener("change", function () {
      groupFilter = select.value;
      render();
    });
    return el("label", { className: "field field-inline" }, [el("span", { text: "Show" }), select]);
  }

  function renderStats(shown) {
    const needHelp = shown.filter(needsAttention);
    dashboard.append(el("section", {}, [
      el("h2", { text: "At a glance" }),
      el("div", { className: "stats" }, [
        stat(String(shown.length), shown.length === 1 ? "trainee" : "trainees"),
        stat(fmt(PS.average(shown.map(function (t) { return t.summary.completion; }))), "average completion"),
        stat(fmt(PS.average(shown.map(function (t) { return t.summary.quizScore; }))), "average score"),
        stat(String(needHelp.length), "averaging below " + PS.WEAK + "%", needHelp.length ? "weak" : "")
      ])
    ]));
  }

  // Topics and questions across the class, weakest first.
  function renderWeakAreas(shown) {
    const topics = {};
    const questions = {};
    shown.forEach(function (t) {
      t.summary.topics.forEach(function (topic) {
        const agg = topics[topic.key] || (topics[topic.key] = { name: topic.name, module: topic.module, items: topic.items, right: 0, total: 0, trainees: 0, struggling: [] });
        agg.right += topic.right;
        agg.total += topic.total;
        agg.trainees += 1;
        if (topic.score < PS.WEAK) agg.struggling.push(t);
      });
      t.summary.questions.forEach(function (q) {
        const agg = questions[q.key] || (questions[q.key] = { prompt: q.prompt, item: q.item, topic: q.topic, right: 0, total: 0 });
        agg.total += 1;
        if (q.correct) agg.right += 1;
      });
    });

    const section = el("section", {}, [el("h2", { text: "Weak areas" })]);
    const topicList = values(topics).map(withScore).sort(byScore);
    if (topicList.length === 0) {
      section.append(el("p", { className: "hint", text: "No scored answers yet." }));
      dashboard.append(section);
      return;
    }

    section.append(el("p", { className: "hint", text: "Class score on each topic, using each trainee's latest answer to every question. Weakest first." }));
    const list = el("ul", { className: "topic-list" });
    topicList.forEach(function (t) {
      list.append(el("li", { className: "topic" }, [
        el("div", { className: "topic-head" }, [
          el("span", { className: "topic-name", text: t.name }),
          scoreChip(t.score)
        ]),
        meter(t.score, t.module.title + " · " + t.right + " of " + t.total + " answers right · " + t.trainees + (t.trainees === 1 ? " trainee" : " trainees"), PS.band(t.score)),
        t.struggling.length
          ? el("p", { className: "hint", text: "Below " + PS.WEAK + "%: " + t.struggling.map(function (s) { return s.name; }).join(", ") })
          : null
      ]));
    });
    section.append(list);

    // Only questions enough trainees answered, so one person's slip doesn't top the list.
    const minAnswers = Math.min(3, shown.length);
    const hard = values(questions).map(withScore).filter(function (q) {
      return q.total >= minAnswers && q.score < PS.STRONG;
    }).sort(function (a, b) { return a.score - b.score || b.total - a.total; }).slice(0, 5);
    if (hard.length) {
      const qList = el("ol", { className: "question-list" });
      hard.forEach(function (q) {
        qList.append(el("li", {}, [
          el("span", { text: q.prompt + " " }),
          scoreChip(q.score),
          el("span", { className: "hint", text: " " + q.right + " of " + q.total + " right · " + q.item.title + " · " + q.topic })
        ]));
      });
      section.append(el("h3", { text: "Questions most often missed" }), qList);
    }
    dashboard.append(section);
  }

  function renderModules(shown) {
    const section = el("section", {}, [el("h2", { text: "Modules" })]);
    const grid = el("div", { className: "grid" });
    cat.modules.forEach(function (mod, mi) {
      const perTrainee = shown.map(function (t) { return t.summary.modules[mi]; });
      if (!perTrainee.length || perTrainee[0].total === 0) return;
      const completion = PS.average(perTrainee.map(function (m) { return m.completion; }));
      const quiz = PS.average(perTrainee.map(function (m) { return m.quizScore; }));

      const rows = el("ul", { className: "status-list" });
      perTrainee[0].items.forEach(function (first, ii) {
        const results = perTrainee.map(function (m) { return m.items[ii]; });
        const done = results.filter(function (r) { return r.status === "done"; }).length;
        const avg = PS.average(results.map(function (r) { return r.latest; }));
        rows.append(el("li", {}, [
          el("span", { text: first.item.title }),
          el("span", { className: "status" }, [
            avg == null ? null : scoreChip(avg),
            el("span", { text: " " + done + "/" + shown.length + " done" })
          ])
        ]));
      });

      grid.append(el("div", { className: "panel" }, [
        mod.code ? el("span", { className: "eyebrow", text: mod.code }) : null,
        el("h3", { className: "card-title", text: mod.title }),
        meter(completion, "Completion " + fmt(completion) + (quiz == null ? "" : " · average score " + quiz + "%")),
        rows
      ]));
    });
    section.append(grid);
    dashboard.append(section);
  }

  function renderTrainees(shown) {
    const sorters = {
      name: function (a, b) { return a.name.localeCompare(b.name); },
      completion: function (a, b) { return num(a.summary.completion) - num(b.summary.completion); },
      quiz: function (a, b) { return num(a.summary.quizScore) - num(b.summary.quizScore); }
    };
    const sorted = shown.slice().sort(function (a, b) { return sorters[sortBy](a, b) || a.name.localeCompare(b.name); });
    const items = shown[0].summary.items;
    const showGroup = shown.some(function (t) { return t.group; });

    const headRow = el("tr", {}, [
      sortHeader("Trainee", "name"),
      showGroup ? el("th", { text: "Group", attrs: { scope: "col" } }) : null,
      sortHeader("Done", "completion"),
      sortHeader("Score", "quiz"),
      el("th", { text: "Weakest topic", attrs: { scope: "col" } })
    ]);
    items.forEach(function (i) {
      headRow.append(el("th", { className: "item-col", text: i.item.title, attrs: { scope: "col", title: i.item.title } }));
    });

    const body = el("tbody");
    sorted.forEach(function (t) {
      const weakest = t.summary.topics[0];
      const nameButton = el("button", { className: "link-button", text: t.name });
      nameButton.type = "button";
      nameButton.addEventListener("click", function () {
        selectedId = t.id;
        render();
        document.getElementById("detail").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      const row = el("tr", { className: t.id === selectedId ? "selected" : "" }, [
        el("th", { attrs: { scope: "row" } }, [nameButton]),
        showGroup ? el("td", { text: t.group || "–" }) : null,
        el("td", { text: fmt(t.summary.completion) }),
        el("td", {}, [t.summary.quizScore == null ? "–" : scoreChip(t.summary.quizScore)]),
        el("td", { text: weakest && weakest.score < PS.STRONG ? weakest.name + " (" + weakest.score + "%)" : "–" })
      ]);
      t.summary.items.forEach(function (i) { row.append(el("td", { className: "item-col" }, [cell(i)])); });
      body.append(row);
    });

    const exportButton = el("button", { className: "button", text: "Download as CSV" });
    exportButton.type = "button";
    exportButton.addEventListener("click", function () { exportCsv(sorted, items); });

    dashboard.append(el("section", {}, [
      el("h2", { text: "Trainees" }),
      el("p", { className: "hint", text: "Select a name for their details. Scored cells show the share of questions right; ✓ means done, … means started." }),
      el("div", { className: "table-scroll" }, [
        el("table", { className: "class-table" }, [el("thead", {}, [headRow]), body])
      ]),
      el("div", { className: "actions" }, [exportButton])
    ]));
  }

  function sortHeader(label, key) {
    const button = el("button", { className: "link-button", text: label + (sortBy === key ? (key === "name" ? " ▲" : " ▲ lowest first") : "") });
    button.type = "button";
    button.addEventListener("click", function () {
      sortBy = key;
      render();
    });
    return el("th", { attrs: { scope: "col", "aria-sort": sortBy === key ? "ascending" : "none" } }, [button]);
  }

  function cell(i) {
    if (i.latest != null) return scoreChip(i.latest);
    if (i.status === "done") return el("span", { className: "status-done", text: "✓", attrs: { title: "Done" } });
    if (i.status === "started") return el("span", { className: "hint", text: "…", attrs: { title: "Started" } });
    return el("span", { className: "hint", text: "–", attrs: { title: "Not started" } });
  }

  function renderDetail(shown) {
    const t = shown.find(function (x) { return x.id === selectedId; });
    const section = el("section", { id: "detail" });
    dashboard.append(section);
    if (!t) return;

    const s = t.summary;
    section.append(
      el("h2", { text: t.name + (t.group ? " · " + t.group : "") }),
      el("div", { className: "stats" }, [
        stat(s.done + " / " + s.total, "items done"),
        stat(fmt(s.quizScore), "average score", PS.band(s.quizScore) === "weak" ? "weak" : ""),
        stat(String(s.topics.filter(function (x) { return x.score < PS.STRONG; }).length), "topics below " + PS.STRONG + "%")
      ])
    );

    const steps = el("ul", { className: "topic-list" });
    s.topics.filter(function (x) { return x.score < PS.STRONG; }).forEach(function (topic) {
      steps.append(el("li", { className: "topic" }, [
        el("div", { className: "topic-head" }, [el("span", { className: "topic-name", text: topic.name }), scoreChip(topic.score)]),
        el("p", { className: "hint", text: topic.module.title + " · " + topic.right + " of " + topic.total + " right · practise with " +
          topic.items.map(function (i) { return i.title; }).join(", ") })
      ]));
    });
    const notStarted = s.items.filter(function (i) { return i.status === "none"; });
    section.append(
      el("h3", { text: "Topics to work on" }),
      steps.children.length ? steps : el("p", { className: "hint", text: "No weak topics on their latest answers." }),
      el("h3", { text: "Not started yet" }),
      notStarted.length
        ? el("p", { text: notStarted.map(function (i) { return i.item.title; }).join(", ") })
        : el("p", { className: "hint", text: "Everything has been opened." })
    );

    s.modules.forEach(function (m) {
      if (m.total) section.append(el("div", { className: "panel" }, [
        el("h3", { className: "card-title", text: m.module.title }),
        meter(m.completion, m.done + " of " + m.total + " done" + (m.quizScore == null ? "" : " · average score " + m.quizScore + "%"))
      ]));
    });
  }

  function exportCsv(list, items) {
    const header = ["Name", "Group", "Completion %", "Average score %", "Topics below " + PS.STRONG + "%"]
      .concat(items.map(function (i) { return i.item.title; }));
    const rows = list.map(function (t) {
      return [
        t.name,
        t.group,
        num(t.summary.completion, ""),
        num(t.summary.quizScore, ""),
        t.summary.topics.filter(function (x) { return x.score < PS.STRONG; }).map(function (x) { return x.name + " " + x.score + "%"; }).join("; ")
      ].concat(t.summary.items.map(function (i) {
        return i.latest != null ? i.latest + "%" : i.status === "done" ? "done" : i.status === "started" ? "started" : "";
      }));
    });
    const csv = [header].concat(rows).map(function (row) {
      return row.map(csvField).join(",");
    }).join("\r\n");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    link.download = "class-progress-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  }

  // Quotes a CSV field, and stops spreadsheets treating it as a formula.
  function csvField(value) {
    let text = String(value == null ? "" : value);
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    return /[",\r\n]/.test(text) ? "\"" + text.replace(/"/g, "\"\"") + "\"" : text;
  }

  // Helpers

  function needsAttention(t) {
    return t.summary.quizScore != null && t.summary.quizScore < PS.WEAK;
  }

  function withScore(x) {
    x.score = PS.pct(x.right, x.total);
    return x;
  }

  function byScore(a, b) { return a.score - b.score; }

  function values(obj) { return Object.keys(obj).map(function (k) { return obj[k]; }); }

  function unique(list) { return list.filter(function (v, i) { return list.indexOf(v) === i; }); }

  function num(v, fallback) { return v == null ? (fallback === undefined ? -1 : fallback) : v; }

  function fmt(pct) { return pct == null ? "–" : pct + "%"; }

  function scoreChip(pct) {
    return el("span", { className: "score score-" + PS.band(pct), text: pct + "%" });
  }

  function stat(value, label, tone) {
    return el("div", { className: "stat" + (tone ? " stat-" + tone : "") }, [
      el("span", { className: "stat-value", text: value }),
      el("span", { className: "stat-label", text: label })
    ]);
  }

  function meter(pct, label, tone) {
    const bar = el("span", { className: "meter-fill" + (tone ? " meter-" + tone : "") });
    bar.style.width = (pct || 0) + "%";
    return el("span", { className: "meter-wrap" }, [
      el("span", { className: "meter", attrs: { "aria-hidden": "true" } }, [bar]),
      el("span", { className: "meter-label", text: label })
    ]);
  }

  // textContent only, so names and prompts from files are never parsed as HTML.
  function el(tag, props, children) {
    const node = document.createElement(tag);
    props = props || {};
    if (props.className) node.className = props.className;
    if (props.id) node.id = props.id;
    if (props.text) node.textContent = props.text;
    Object.keys(props.attrs || {}).forEach(function (name) { node.setAttribute(name, props.attrs[name]); });
    (children || []).forEach(function (child) {
      if (child != null) node.append(child);
    });
    return node;
  }

  render();
})();
