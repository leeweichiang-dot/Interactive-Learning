/*
 * Renders the portal pages from window.CATALOGUE (see catalogue.js), with the
 * trainee's own progress from tracker.js and portal/summary.js.
 * The page to render is chosen by <body data-page="home|module|progress">.
 */
(function () {
  "use strict";

  // Display order and labels for each item type.
  const TYPES = [
    { id: "tool", label: "Tool", heading: "Tools" },
    { id: "lesson", label: "Lesson", heading: "Lessons" },
    { id: "quiz", label: "Quiz", heading: "Quizzes" }
  ];

  const catalogue = window.CATALOGUE || { modules: [], items: [] };
  const modules = catalogue.modules || [];
  const items = catalogue.items || [];

  // This trainee's progress; empty if tracker.js didn't load.
  const progress = window.Tracker ? window.Tracker.load() : { trainee: {}, items: {} };
  const summary = window.ProgressSummary ? window.ProgressSummary.summarise(progress.items) : null;

  checkCatalogue();

  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "module") renderModule();
  if (page === "progress") renderProgress();

  // Pages

  function renderHome() {
    const list = document.getElementById("modules");
    const shown = modules.filter(function (mod) { return !mod.hidden; });

    if (shown.length === 0) {
      list.replaceWith(notice("No modules yet."));
      return;
    }

    shown.forEach(function (mod) {
      const count = visibleItems(mod.id).length;
      const modSummary = moduleSummary(mod.id);
      const done = modSummary ? modSummary.done : 0;
      const card = el("a", { className: "card", href: moduleHref(mod) }, [
        mod.code ? el("span", { className: "eyebrow", text: mod.code }) : null,
        el("h2", { className: "card-title", text: mod.title }),
        mod.description ? el("p", { className: "card-text", text: mod.description }) : null,
        el("span", { className: "card-meta", text: (count === 1 ? "1 item" : count + " items") + (done ? " · " + done + " done" : "") }),
        done ? meter(modSummary.completion, done + " of " + modSummary.total + " done") : null
      ]);
      list.append(el("li", {}, [card]));
    });
  }

  function renderModule() {
    const id = new URLSearchParams(location.search).get("m");
    const mod = modules.find(function (m) { return m.id === id; });
    const content = document.getElementById("content");

    if (!mod) {
      document.title = "Module not found";
      content.append(
        el("h1", { text: "Module not found" }),
        el("p", { className: "lead", text: "This link doesn't match any module. It may have been renamed." })
      );
      return;
    }

    document.title = mod.title;
    // Built with el() so a missing code or description is skipped, not shown as "null".
    content.append(el("div", {}, [
      mod.code ? el("p", { className: "eyebrow", text: mod.code }) : null,
      el("h1", { text: mod.title }),
      mod.description ? el("p", { className: "lead", text: mod.description }) : null
    ]));

    // Sign-in comes first: a trainee who isn't signed in sees the login form
    // instead of the items. Skipped if this browser can't save, since the
    // sign-in would be forgotten straight away.
    const Tracker = window.Tracker;
    if (Tracker && Tracker.available()) {
      const trainee = Tracker.current();
      if (!trainee) {
        content.append(signInForm());
        return;
      }
      content.append(traineeBar(trainee));
    }

    const modItems = visibleItems(mod.id);
    if (modItems.length === 0) {
      content.append(notice("Nothing here yet. Check back later."));
      return;
    }

    TYPES.forEach(function (type) {
      const ofType = modItems.filter(function (item) { return item.type === type.id; });
      if (ofType.length === 0) return;

      const list = el("ul", { className: "grid" });
      ofType.forEach(function (item) {
        list.append(el("li", {}, [
          el("a", { className: "card", href: itemHref(item) }, [
            el("span", { className: "badge", text: type.label }),
            el("h3", { className: "card-title", text: item.title }),
            item.summary ? el("p", { className: "card-text", text: item.summary }) : null,
            statusLine(itemSummary(item))
          ])
        ]));
      });

      content.append(el("section", {}, [el("h2", { text: type.heading }), list]));
    });
  }

  function renderProgress() {
    const content = document.getElementById("content");
    const Tracker = window.Tracker;

    if (!Tracker || !summary) {
      content.append(notice("Progress tracking couldn't load on this page."));
      return;
    }
    if (!Tracker.available()) {
      content.append(notice("This browser isn't saving progress, so there's nothing to show. " +
        "This can happen when the pages are opened straight from disk in some browsers; ask your instructor for the web link."));
    }

    // Whose progress this is, when someone has signed in on a module page.
    const trainee = Tracker.current();
    if (trainee) content.append(traineeBar(trainee));

    // Name and class, so the instructor can match the file to the trainee.
    const nameInput = el("input", { id: "trainee-name" });
    const groupInput = el("input", { id: "trainee-group" });
    nameInput.value = progress.trainee.name || "";
    groupInput.value = progress.trainee.group || "";
    nameInput.autocomplete = "name";
    [nameInput, groupInput].forEach(function (input) {
      input.addEventListener("input", function () { Tracker.setTrainee(nameInput.value, groupInput.value); });
    });

    content.append(el("section", {}, [
      el("h2", { text: "About you" }),
      el("div", { className: "form-row" }, [
        el("label", { className: "field" }, [el("span", { text: "Name" }), nameInput]),
        el("label", { className: "field" }, [el("span", { text: "Class or group" }), groupInput])
      ]),
      el("p", { className: "hint", text: "Used only to label your progress file. It stays on this device." })
    ]));

    // Overview
    content.append(el("section", {}, [
      el("h2", { text: "Overview" }),
      el("div", { className: "stats" }, [
        stat(summary.done + " / " + summary.total, "items done"),
        stat(summary.quizScore == null ? "–" : summary.quizScore + "%", "average score"),
        stat(String(summary.topics.filter(function (t) { return t.score < window.ProgressSummary.STRONG; }).length), "topics to work on")
      ])
    ]));

    // Weak topics first: they're the point of the page.
    const weak = summary.topics.filter(function (t) { return t.score < window.ProgressSummary.STRONG; });
    const topicSection = el("section", {}, [el("h2", { text: "Topics to work on" })]);
    if (summary.topics.length === 0) {
      topicSection.append(el("p", { className: "hint", text: "Answer some questions in a quiz or activity to see how you're doing on each topic." }));
    } else if (weak.length === 0) {
      topicSection.append(el("p", { className: "hint", text: "Nothing stands out: every topic is at " + window.ProgressSummary.STRONG + "% or better on your latest answers." }));
    } else {
      const list = el("ul", { className: "topic-list" });
      weak.forEach(function (t) {
        list.append(el("li", { className: "topic" }, [
          el("div", { className: "topic-head" }, [
            el("span", { className: "topic-name", text: t.name }),
            scoreChip(t.score)
          ]),
          el("span", { className: "hint", text: t.module.title + " · " + t.right + " of " + t.total + " right · practise with " }),
          inlineLinks(t.items)
        ]));
      });
      topicSection.append(list);
    }
    content.append(topicSection);

    // Each module
    const modSection = el("section", {}, [el("h2", { text: "By module" })]);
    summary.modules.forEach(function (m) {
      if (m.total === 0) return;
      const rows = el("ul", { className: "status-list" });
      m.items.forEach(function (i) {
        rows.append(el("li", {}, [
          el("a", { href: itemHref(i.item), text: i.item.title }),
          statusLine(i)
        ]));
      });
      modSection.append(el("div", { className: "panel" }, [
        el("h3", { className: "card-title", text: m.module.title }),
        meter(m.completion, m.done + " of " + m.total + " done" + (m.quizScore == null ? "" : " · average score " + m.quizScore + "%")),
        rows
      ]));
    });
    content.append(modSection);

    // Hand in
    const message = el("p", { className: "hint", text: "" });
    message.setAttribute("role", "status");
    const downloadButton = el("button", { className: "button primary", text: "Download my progress file" });
    downloadButton.type = "button";
    downloadButton.addEventListener("click", function () {
      if (!nameInput.value.trim()) {
        message.textContent = "Add your name first, so your instructor knows whose file it is.";
        nameInput.focus();
        return;
      }
      Tracker.setTrainee(nameInput.value, groupInput.value);
      Tracker.download();
      message.textContent = "Downloaded. Hand the file to your instructor the way they asked (for example, upload it to the LMS).";
    });
    const clearButton = el("button", { className: "button", text: "Clear my progress" });
    clearButton.type = "button";
    clearButton.addEventListener("click", function () {
      if (!confirm("Clear your progress saved on this device? This can't be undone.")) return;
      Tracker.clear();
      location.reload();
    });
    content.append(el("section", {}, [
      el("h2", { text: "Hand in your progress" }),
      el("p", { className: "hint", text: "Your progress is saved only in this browser. To share it, download the file and give it to your instructor." }),
      el("div", { className: "actions" }, [downloadButton, clearButton]),
      message
    ]));
  }

  // Sign-in

  // Full name + trainee ID. Signing in reloads the page so it shows this trainee's progress.
  function signInForm() {
    const nameInput = el("input", { id: "signin-name", attrs: { autocomplete: "name", maxlength: "80" } });
    const idInput = el("input", { id: "signin-id", attrs: { autocomplete: "off", autocapitalize: "characters", spellcheck: "false", maxlength: "30" } });
    const error = el("p", { className: "signin-error", attrs: { role: "alert" } });
    error.hidden = true;
    const button = el("button", { className: "button primary", text: "Begin Training" });
    button.type = "submit";

    const form = el("form", { className: "panel signin" }, [
      el("h2", { text: "Sign in to start this module" }),
      el("div", { className: "form-row" }, [
        el("label", { className: "field" }, [el("span", { text: "Full name" }), nameInput]),
        el("label", { className: "field" }, [el("span", { text: "Trainee ID number" }), idInput])
      ]),
      error,
      el("div", { className: "actions" }, [button]),
      el("p", { className: "hint", text: "Your name, trainee ID and progress are saved in this browser on this device only. " +
        "Sign in with the same trainee ID next time to carry on where you left off." })
    ]);
    form.noValidate = true;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = nameInput.value.trim();
      const id = window.Tracker.tidyId(idInput.value);
      let problem = "";
      let input = null;
      if (!name) { problem = "Please enter your full name."; input = nameInput; }
      else if (!id) { problem = "Please enter your trainee ID number."; input = idInput; }
      else if (!/^[A-Z0-9-]+$/.test(id)) { problem = "Your trainee ID can only use letters, numbers and hyphens."; input = idInput; }
      if (problem) {
        error.textContent = problem;
        error.hidden = false;
        input.focus();
        return;
      }
      window.Tracker.signIn(name, id);
      location.reload();
    });

    setTimeout(function () { nameInput.focus(); }, 0);
    return form;
  }

  // "Signed in as Jane Tan (S1234)" with a way to hand the device to someone else.
  function traineeBar(trainee) {
    const button = el("button", { className: "link-button", text: "Not you? Switch trainee" });
    button.type = "button";
    button.addEventListener("click", function () {
      window.Tracker.signOut();
      location.reload();
    });
    return el("p", { className: "trainee-bar" }, [
      el("span", { text: "Signed in as " + trainee.name + " (" + trainee.id + ")" }),
      button
    ]);
  }

  // Progress helpers

  function moduleSummary(moduleId) {
    if (!summary) return null;
    return summary.modules.find(function (m) { return m.module.id === moduleId; }) || null;
  }

  function itemSummary(item) {
    if (!summary) return null;
    return summary.items.find(function (i) { return i.item === item; }) || null;
  }

  function statusLine(info) {
    if (!info || info.status === "none") return null;
    if (info.latest != null) {
      return el("span", { className: "status" }, [
        scoreChip(info.latest),
        el("span", { text: " " + info.right + " of " + info.answered + " right" })
      ]);
    }
    return el("span", { className: "status status-" + info.status, text: info.status === "done" ? "✓ Done" : "Started" });
  }

  function scoreChip(pct) {
    return el("span", { className: "score score-" + window.ProgressSummary.band(pct), text: pct + "%" });
  }

  function meter(pct, label) {
    const bar = el("span", { className: "meter-fill" });
    bar.style.width = (pct || 0) + "%";
    return el("span", { className: "meter-wrap" }, [
      el("span", { className: "meter", attrs: { "aria-hidden": "true" } }, [bar]),
      el("span", { className: "meter-label", text: label })
    ]);
  }

  function stat(value, label) {
    return el("div", { className: "stat" }, [
      el("span", { className: "stat-value", text: value }),
      el("span", { className: "stat-label", text: label })
    ]);
  }

  function inlineLinks(list) {
    const span = el("span", { className: "hint" });
    list.forEach(function (item, i) {
      if (i > 0) span.append(", ");
      span.append(el("a", { href: itemHref(item), text: item.title }));
    });
    return span;
  }

  // Catalogue helpers

  function visibleItems(moduleId) {
    return items.filter(function (item) {
      return item.module === moduleId && !item.hidden && isKnownType(item.type);
    });
  }

  function isKnownType(typeId) {
    return TYPES.some(function (t) { return t.id === typeId; });
  }

  function moduleHref(mod) {
    return "module.html?m=" + encodeURIComponent(mod.id);
  }

  // index.html is spelled out because file:// URLs don't resolve folders to it.
  function itemHref(item) {
    return "items/" + encodeURIComponent(item.module) + "/" + encodeURIComponent(item.id) + "/index.html";
  }

  // Warns in the browser console about mistakes in catalogue.js.
  function checkCatalogue() {
    const moduleIds = new Set();
    modules.forEach(function (m) {
      if (moduleIds.has(m.id)) console.warn("catalogue.js: duplicate module id \"" + m.id + "\"");
      moduleIds.add(m.id);
    });

    const itemKeys = new Set();
    items.forEach(function (item) {
      const key = item.module + "/" + item.id;
      if (itemKeys.has(key)) console.warn("catalogue.js: duplicate item \"" + key + "\"");
      itemKeys.add(key);
      if (!moduleIds.has(item.module)) console.warn("catalogue.js: item \"" + item.id + "\" has unknown module \"" + item.module + "\"");
      if (!isKnownType(item.type)) console.warn("catalogue.js: item \"" + item.id + "\" has unknown type \"" + item.type + "\" and is not shown");
      if (!item.title) console.warn("catalogue.js: item \"" + item.id + "\" has no title");
    });
  }

  // DOM helpers (textContent only, so catalogue text is never parsed as HTML)

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props.className) node.className = props.className;
    if (props.href) node.href = props.href;
    if (props.id) node.id = props.id;
    if (props.text) node.textContent = props.text;
    Object.keys(props.attrs || {}).forEach(function (name) { node.setAttribute(name, props.attrs[name]); });
    (children || []).forEach(function (child) {
      if (child) node.append(child);
    });
    return node;
  }

  function notice(text) {
    return el("p", { className: "notice", text: text });
  }
})();
