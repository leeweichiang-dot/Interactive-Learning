/* ===========================================================================
   AIRCRAFT FAMILIARISATION TRAINING: dashboard.js (instructor dashboard)

   This file controls how dashboard.html BEHAVES:
     1. checks the password
     2. reads every trainee's saved progress from localStorage
     3. reads trainee progress files the instructor adds (section 4b)
     4. builds the trainee table, the Class Summary and the Export Summary

   IMPORTANT: localStorage belongs to one browser on one device, so on its
   own this page only sees trainees who used the training in this same
   browser on this same computer (for example a shared classroom PC).
   Trainees who trained on their own phones or laptops download a progress
   file from My progress on the portal and hand it in; the instructor adds
   those files here. Files are read in memory only: they are never saved
   or uploaded, and they are gone when the page is reloaded or closed.
   =========================================================================== */

"use strict";


/* ---------------------------------------------------------------------------
   1. SETTINGS
   These must match app.js. If you rename a module there, rename it here.
   --------------------------------------------------------------------------- */

// The password for this page.
// NOTE: this is not real security. Anyone can read this file in the
// browser (for example with "View source") and see the password. It only
// stops trainees opening the dashboard by accident.
const PASSWORD = "instructor2024";

// The localStorage key app.js saves every trainee under (app.js section 15).
const TRAINEES_KEY = "aircraft-training-trainees";

// The module titles, in order. They must be exactly the same as the titles
// in MODULES in app.js, because scores are saved by module title.
const MODULE_TITLES = [
  "Aircraft Parts",
  "Fuselage and Wing Structure",
  "Engine and Empennage"
];

// The pass mark, as a percentage (the same as PASS_MARK in app.js).
const PASS_MARK = 80;

// Progress files (made by the portal's tracker.js) start with this "app"
// name, and keep this training's results under this item key.
const PORTAL_APP = "interactive-learning";
const ITEM_KEY = "aircraft/aircraft-familiarisation";

// Ignore files bigger than 2 MB: a real progress file is far smaller.
const MAX_FILE_BYTES = 2 * 1024 * 1024;

// Trainees read from the progress files added so far. This list lives in
// memory only, so it is empty again after a reload.
let fileTrainees = [];


/* ---------------------------------------------------------------------------
   2. FIND THE PAGE ELEMENTS
   --------------------------------------------------------------------------- */
const passwordScreen  = document.getElementById("password-screen");
const passwordForm    = document.getElementById("password-form");
const passwordInput   = document.getElementById("password-input");
const passwordError   = document.getElementById("password-error");

const dashboardScreen = document.getElementById("dashboard-screen");
const noTrainees      = document.getElementById("no-trainees");
const tableScroll     = document.getElementById("table-scroll");
const tableHeadRow    = document.getElementById("table-head-row");
const tableBody       = document.getElementById("table-body");
const summaryList     = document.getElementById("summary-list");

const exportButton    = document.getElementById("export-button");
const copyButton      = document.getElementById("copy-button");
const copyStatus      = document.getElementById("copy-status");
const exportLabel     = document.getElementById("export-label");
const exportText      = document.getElementById("export-text");

const dropzone        = document.getElementById("dropzone");
const fileInput       = document.getElementById("file-input");
const clearFilesBtn   = document.getElementById("clear-files-button");
const fileStatus      = document.getElementById("file-status");
const fileErrors      = document.getElementById("file-errors");


/* ---------------------------------------------------------------------------
   3. PASSWORD SCREEN
   --------------------------------------------------------------------------- */
function handlePasswordSubmit(event) {
  // Stop the form from reloading the page.
  event.preventDefault();

  if (passwordInput.value === PASSWORD) {
    // Correct: hide the password screen and build the dashboard.
    passwordError.hidden = true;
    passwordScreen.hidden = true;
    dashboardScreen.hidden = false;
    showDashboard();
  } else {
    // Wrong: show the message, clear the box and put the cursor back in it.
    passwordError.textContent = "Incorrect password, please try again.";
    passwordError.hidden = false;
    passwordInput.value = "";
    passwordInput.focus();
  }
}


/* ---------------------------------------------------------------------------
   4. READ THE TRAINEES FROM localStorage
   Returns a list (array) of trainees. Each one is tidied so the rest of
   this file can trust its shape:
     { id, name, scores: { "Aircraft Parts": 91, ... }, completed: [...] }
   --------------------------------------------------------------------------- */
function loadBrowserTrainees() {
  let saved = {};
  try {
    // localStorage stores text; JSON.parse turns it back into an object.
    saved = JSON.parse(localStorage.getItem(TRAINEES_KEY)) || {};
  } catch (error) {
    // Storage blocked or damaged: show an empty dashboard.
  }

  const trainees = [];
  // Object.keys gives the list of trainee IDs in the saved object.
  Object.keys(saved).forEach(function (id) {
    const record = saved[id];
    if (!record || typeof record !== "object") {
      return;   // skip anything that isn't a trainee record
    }

    // Keep only real numbers between 0 and 100 for each module's score.
    const scores = {};
    MODULE_TITLES.forEach(function (title) {
      const score = record.scores ? record.scores[title] : undefined;
      if (typeof score === "number" && score >= 0 && score <= 100) {
        scores[title] = score;
      }
    });

    trainees.push({
      id: String(id),
      name: typeof record.name === "string" ? record.name : "(no name)",
      scores: scores,
      // Only count completed modules that this page knows about.
      completed: Array.isArray(record.completed)
        ? MODULE_TITLES.filter(function (title) { return record.completed.indexOf(title) !== -1; })
        : []
    });
  });

  return trainees;
}


/* ---------------------------------------------------------------------------
   4b. READ TRAINEE PROGRESS FILES (new)

   A progress file is the .json file a trainee downloads from My progress
   on the portal. It holds everything the portal's tracker saved, e.g.
     {
       "app": "interactive-learning",
       "trainee": { "name": "Jane Tan", "group": "AMT-1", "id": "S1234" },
       "items": {
         "aircraft/aircraft-familiarisation": {
           "attempts": [
             { "score": 9, "total": 11,
               "answers": [ { "q": "Aircraft Parts: find the fuselage", ... } ] }
           ]
         }
       }
     }
   Each attempt is one Parts Check. The file doesn't say which module an
   attempt was for, but every question starts with the module title
   ("Aircraft Parts: find the ..."), so we read the module from there.

   "id" is only there if the trainee signed in to this training on that
   device (app.js copies the trainee ID into the file); otherwise the ID
   column shows a dash and the trainee is matched by name.
   --------------------------------------------------------------------------- */

// Turn one progress file (already turned from text into an object) into a
// trainee in the same shape as loadBrowserTrainees uses.
// "throw" stops with an error message, which readFiles shows to the user.
function traineeFromFile(data, fileName) {
  if (!data || data.app !== PORTAL_APP || !data.items || typeof data.items !== "object") {
    throw new Error("not a progress file from this portal");
  }

  const about = (data.trainee && typeof data.trainee === "object") ? data.trainee : {};
  // String(...) turns anything into text; slice keeps it a sensible length.
  const name = String(about.name || "").trim().slice(0, 80) || "Unnamed (" + fileName + ")";
  // Tidy the ID the same way app.js does: no spaces, capital letters.
  const id = String(about.id || "").replace(/\s+/g, "").toUpperCase().slice(0, 30);
  const group = String(about.group || "").trim().slice(0, 40);

  const scores = {};
  const completed = [];
  const record = data.items[ITEM_KEY];
  const attempts = (record && Array.isArray(record.attempts)) ? record.attempts : [];

  attempts.forEach(function (attempt) {
    // Skip anything that doesn't look like a real attempt.
    if (!attempt || !Array.isArray(attempt.answers) || attempt.answers.length === 0 ||
        !(attempt.total > 0) || !(attempt.score >= 0) || attempt.score > attempt.total) {
      return;
    }

    // "Aircraft Parts: find the fuselage" -> "Aircraft Parts".
    const question = String(attempt.answers[0] && attempt.answers[0].q || "");
    const title = question.split(": find the ")[0];
    if (MODULE_TITLES.indexOf(title) === -1) {
      return;   // not one of this training's Parts Checks
    }

    // Same score as app.js: right first time / total, as a whole percentage.
    // Keep only the highest score for each module.
    const percent = Math.round((attempt.score / attempt.total) * 100);
    if (typeof scores[title] !== "number" || percent > scores[title]) {
      scores[title] = percent;
    }
    // Finishing a Parts Check completes its module (as in app.js).
    if (completed.indexOf(title) === -1) {
      completed.push(title);
    }
  });

  return { id: id, name: name, group: group, scores: scores, completed: completed };
}

// Read the files chosen or dropped by the instructor, one by one.
function readFiles(fileList) {
  // Array.from turns the browser's FileList into a normal list.
  const files = Array.from(fileList || []);
  if (files.length === 0) {
    return;
  }
  fileErrors.textContent = "";

  // file.text() reads a file's text. It finishes later (it returns a
  // "Promise"), so Promise.all waits until every file has been read.
  Promise.all(files.map(function (file) {
    if (file.size > MAX_FILE_BYTES) {
      return Promise.resolve({ file: file, error: "too large to be a progress file" });
    }
    return file.text().then(function (text) {
      try {
        return { file: file, trainee: traineeFromFile(JSON.parse(text), file.name) };
      } catch (error) {
        // JSON.parse fails with a SyntaxError if the text isn't JSON at all.
        return { file: file, error: error instanceof SyntaxError ? "not a progress file" : error.message };
      }
    }, function () {
      return { file: file, error: "could not be read" };
    });
  })).then(function (results) {
    let added = 0;
    results.forEach(function (result) {
      if (result.error) {
        // List the problem file by name; textContent keeps the name as plain text.
        fileErrors.appendChild(makeElement("li", "", result.file.name + ": " + result.error));
      } else {
        fileTrainees.push(result.trainee);
        added = added + 1;
      }
    });

    fileStatus.textContent = "Added " + added + (added === 1 ? " file" : " files") +
      ". Trainees from files are shown until you reload or close this page.";
    clearFilesBtn.hidden = fileTrainees.length === 0;
    refreshDashboard();
  });
}

// Forget every loaded file (trainees saved in this browser stay).
function clearFiles() {
  fileTrainees = [];
  fileStatus.textContent = "Removed the loaded files.";
  fileErrors.textContent = "";
  clearFilesBtn.hidden = true;
  refreshDashboard();
}


/* ---------------------------------------------------------------------------
   4c. ALL TRAINEES: THIS BROWSER + FILES (new)
   The same trainee can appear more than once: saved in this browser AND in
   a file, or in two files handed in on different days. We join them into
   one row, keeping the highest score for each module and every completed
   module. Trainees are matched by trainee ID, or by name (and group) when
   a file has no ID.
   --------------------------------------------------------------------------- */
function loadTrainees() {
  const byKey = {};   // one entry per trainee, found by its matching "key"
  const all = [];

  loadBrowserTrainees().concat(fileTrainees).forEach(function (trainee) {
    const key = trainee.id
      ? "id:" + trainee.id
      : "name:" + trainee.name.toLowerCase() + "|" + (trainee.group || "").toLowerCase();
    const existing = byKey[key];

    if (!existing) {
      // First time we see this trainee: copy them (so the original lists
      // are never changed) and add them to the results.
      const copy = {
        id: trainee.id,
        name: trainee.name,
        scores: Object.assign({}, trainee.scores),
        completed: trainee.completed.slice()
      };
      byKey[key] = copy;
      all.push(copy);
      return;
    }

    // Seen before: keep the higher score for each module...
    MODULE_TITLES.forEach(function (title) {
      const score = trainee.scores[title];
      if (typeof score === "number" &&
          (typeof existing.scores[title] !== "number" || score > existing.scores[title])) {
        existing.scores[title] = score;
      }
    });
    // ...and every module completed in either place.
    trainee.completed.forEach(function (title) {
      if (existing.completed.indexOf(title) === -1) {
        existing.completed.push(title);
      }
    });
  });

  // Sort A to Z by name. localeCompare compares text the way a dictionary does.
  all.sort(function (a, b) { return a.name.localeCompare(b.name); });
  return all;
}


/* ---------------------------------------------------------------------------
   5. WORK OUT EACH TRAINEE'S PROGRESS AND STATUS
   --------------------------------------------------------------------------- */

// Overall progress: completed modules out of all modules, as a percentage.
function overallProgress(trainee) {
  return Math.round((trainee.completed.length / MODULE_TITLES.length) * 100);
}

// Status, based on the modules the trainee has a score for:
//   Not Started      no module attempted yet
//   Needs Attention  at least one module scored below 80%
//   On Track         every attempted module scored 80% or more
// Returns the label text and the CSS class that colours it.
function traineeStatus(trainee) {
  const scores = Object.values(trainee.scores);   // e.g. [91, 70]

  if (scores.length === 0) {
    return { text: "Not Started", className: "is-not-started" };
  }
  // .some(...) is true if at least one score matches the test.
  const anyBelow = scores.some(function (score) { return score < PASS_MARK; });
  if (anyBelow) {
    return { text: "Needs Attention", className: "is-attention" };
  }
  return { text: "On Track", className: "is-on-track" };
}


/* ---------------------------------------------------------------------------
   6. WORK OUT THE CLASS AVERAGES
   For each module: the average of the scores of the trainees who have
   attempted it. Returns one object per module:
     { title, average (or null if nobody has a score), count, isFocus }
   --------------------------------------------------------------------------- */
function classAverages(trainees) {
  const averages = MODULE_TITLES.map(function (title) {
    // Collect every trainee's score for this module (skipping blanks).
    const scores = [];
    trainees.forEach(function (trainee) {
      if (typeof trainee.scores[title] === "number") {
        scores.push(trainee.scores[title]);
      }
    });

    // Add them up with reduce, then divide by how many there are.
    let average = null;
    if (scores.length > 0) {
      const total = scores.reduce(function (sum, score) { return sum + score; }, 0);
      average = Math.round(total / scores.length);
    }
    return { title: title, average: average, count: scores.length, isFocus: false };
  });

  // Find the lowest average among the modules that have one, and mark that
  // module (or modules, if two tie) as the focus area for the class.
  const withScores = averages.filter(function (m) { return m.average !== null; });
  if (withScores.length > 0) {
    const lowest = Math.min.apply(null, withScores.map(function (m) { return m.average; }));
    withScores.forEach(function (m) {
      if (m.average === lowest) {
        m.isFocus = true;
      }
    });
  }
  return averages;
}


/* ---------------------------------------------------------------------------
   7. BUILD THE DASHBOARD
   All names and IDs come from saved data, so they are always inserted with
   textContent (never innerHTML): the text is shown exactly as typed and can
   never be run as code.
   --------------------------------------------------------------------------- */

// Small helper: make an element with a class and some text.
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// Show a score as "91%", or a dash if the module hasn't been attempted.
function formatScore(score) {
  return typeof score === "number" ? score + "%" : "–";
}

function showDashboard() {
  const trainees = loadTrainees();
  buildTable(trainees);
  buildSummary(trainees);
}

// --- The trainee table ---
function buildTable(trainees) {
  // Header row: Trainee Name, Trainee ID, one column per module, Overall
  // Progress, Status.
  tableHeadRow.textContent = "";
  const headings = ["Trainee Name", "Trainee ID"]
    .concat(MODULE_TITLES)
    .concat(["Overall Progress", "Status"]);
  headings.forEach(function (heading) {
    const th = makeElement("th", "", heading);
    th.scope = "col";   // tells screen readers this heads a column
    tableHeadRow.appendChild(th);
  });

  // No trainees yet: show the message instead of an empty table.
  tableBody.textContent = "";
  noTrainees.hidden = trainees.length > 0;
  tableScroll.hidden = trainees.length === 0;

  // One row per trainee.
  trainees.forEach(function (trainee) {
    const row = document.createElement("tr");

    row.appendChild(makeElement("td", "", trainee.name));
    // A trainee from a file without an ID shows a dash.
    row.appendChild(makeElement("td", "", trainee.id || "–"));

    MODULE_TITLES.forEach(function (title) {
      row.appendChild(makeElement("td", "is-number", formatScore(trainee.scores[title])));
    });

    row.appendChild(makeElement("td", "is-number", overallProgress(trainee) + "%"));

    // The coloured status label sits inside the last cell.
    const status = traineeStatus(trainee);
    const statusCell = document.createElement("td");
    statusCell.appendChild(makeElement("span", "status-label " + status.className, status.text));
    row.appendChild(statusCell);

    tableBody.appendChild(row);
  });
}

// --- The Class Summary ---
function buildSummary(trainees) {
  summaryList.textContent = "";

  classAverages(trainees).forEach(function (module) {
    const item = document.createElement("li");
    item.appendChild(makeElement("span", "summary-module", module.title));

    // e.g. "Average 78% (4 trainees)" or "No scores yet".
    const averageText = module.average === null
      ? "No scores yet"
      : "Average " + module.average + "% (" + module.count +
        (module.count === 1 ? " trainee)" : " trainees)");
    item.appendChild(makeElement("span", "summary-average", averageText));

    // The amber label on the module with the lowest class average.
    if (module.isFocus) {
      item.appendChild(makeElement("span", "status-label is-attention", "Focus Area for Class"));
    }
    summaryList.appendChild(item);
  });
}


/* ---------------------------------------------------------------------------
   8. EXPORT SUMMARY
   Builds a plain text version of the dashboard and shows it in a box the
   instructor can copy from. "\n" in a string means "start a new line".
   --------------------------------------------------------------------------- */
function buildExportText() {
  // Read the data again, in case a trainee used this browser since the
  // page was opened.
  const trainees = loadTrainees();
  const lines = [];

  lines.push("Aircraft Familiarisation Training: Class Summary");
  // toLocaleString shows the date and time in this computer's usual format.
  lines.push("Exported: " + new Date().toLocaleString());
  lines.push("Pass mark: " + PASS_MARK + "%");
  lines.push("");

  lines.push("TRAINEE SCORES (highest score per module)");
  if (trainees.length === 0) {
    lines.push("No trainee data found.");
  }
  trainees.forEach(function (trainee) {
    lines.push(trainee.name + (trainee.id ? " (" + trainee.id + ")" : ""));
    MODULE_TITLES.forEach(function (title) {
      const score = trainee.scores[title];
      lines.push("  " + title + ": " + (typeof score === "number" ? score + "%" : "not attempted"));
    });
    lines.push("  Overall progress: " + overallProgress(trainee) + "%");
    lines.push("  Status: " + traineeStatus(trainee).text);
  });
  lines.push("");

  lines.push("CLASS AVERAGES");
  const averages = classAverages(trainees);
  averages.forEach(function (module) {
    lines.push("  " + module.title + ": " +
      (module.average === null ? "no scores yet" : module.average + "% (" + module.count + (module.count === 1 ? " trainee)" : " trainees)")));
  });

  // Name the focus area(s) at the end.
  const focus = averages.filter(function (m) { return m.isFocus; });
  if (focus.length > 0) {
    lines.push("");
    lines.push("Focus area for class: " + focus.map(function (m) { return m.title; }).join(", "));
  }

  // join("\n") puts each line on its own line.
  return lines.join("\n");
}

function handleExport() {
  exportText.value = buildExportText();
  exportLabel.hidden = false;
  exportText.hidden = false;
  copyButton.hidden = false;
  copyStatus.textContent = "";

  // Select all the text, so the instructor can also press Ctrl+C (or Cmd+C).
  exportText.focus();
  exportText.select();
}

// Copy the summary text to the clipboard.
function handleCopy() {
  exportText.focus();
  exportText.select();

  // Older way of copying the selected text. It works on more browsers, and
  // also when the page is opened straight from disk (file://).
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }

  if (copied) {
    copyStatus.textContent = "Copied";
  } else if (navigator.clipboard) {
    // The modern way. It may be blocked on some setups, so we handle both
    // success (then) and failure (catch).
    navigator.clipboard.writeText(exportText.value)
      .then(function () { copyStatus.textContent = "Copied"; })
      .catch(function () { copyStatus.textContent = "Press Ctrl+C (or Cmd+C) to copy the selected text"; });
  } else {
    copyStatus.textContent = "Press Ctrl+C (or Cmd+C) to copy the selected text";
  }
}


/* ---------------------------------------------------------------------------
   8b. REFRESH AFTER FILES ARE ADDED OR REMOVED (new)
   Rebuilds the table and Class Summary, and the export text if it is
   showing, so nothing on the page is out of date.
   --------------------------------------------------------------------------- */
function refreshDashboard() {
  showDashboard();
  if (!exportText.hidden) {
    exportText.value = buildExportText();
    copyStatus.textContent = "";
  }
}


/* ---------------------------------------------------------------------------
   9. CONNECT EVERYTHING (runs once when the page loads)
   --------------------------------------------------------------------------- */
passwordForm.addEventListener("submit", handlePasswordSubmit);
exportButton.addEventListener("click", handleExport);
copyButton.addEventListener("click", handleCopy);

// New: adding progress files with the Choose Files button...
fileInput.addEventListener("change", function () {
  readFiles(fileInput.files);
  // Empty the box, so choosing the same file again still counts as a change.
  fileInput.value = "";
});
clearFilesBtn.addEventListener("click", clearFiles);

// ...or by dragging them onto the drop area. "preventDefault" stops the
// browser from simply opening the dropped file instead.
dropzone.addEventListener("dragover", function (event) {
  event.preventDefault();
  dropzone.classList.add("is-dragging");   // highlight the drop area
});
dropzone.addEventListener("dragleave", function () {
  dropzone.classList.remove("is-dragging");
});
dropzone.addEventListener("drop", function (event) {
  event.preventDefault();
  dropzone.classList.remove("is-dragging");
  readFiles(event.dataTransfer.files);
});

// Put the cursor in the password box, ready to type.
passwordInput.focus();
