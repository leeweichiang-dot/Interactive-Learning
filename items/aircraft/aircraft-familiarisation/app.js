/* ===========================================================================
   AIRCRAFT FAMILIARISATION TRAINING: app.js

   This file controls how the page BEHAVES:
     - signing the trainee in and restoring their saved progress (section 15)
     - switching from the welcome screen to the learning area
     - building the module buttons and showing which modules are done
     - showing each module's content and updating the learning panel
     - running the diagram activities for Modules 1, 2 and 3 (sections 11-14)
     - updating the progress bar and footer
     - saving each Parts Check score and showing a pass or review message
       (section 16)

   Each trainee's completed modules and highest Parts Check scores are saved
   in this browser (localStorage) under their trainee ID, so they can carry
   on where they left off; the instructor dashboard (dashboard.html) reads
   them too. Each Parts Check result, and finishing all the modules, is also
   sent to the portal's tracker (../../../tracker.js), which saves it on this
   device for the trainee's My progress page.
   =========================================================================== */

// "use strict" asks the browser to point out common mistakes as errors.
"use strict";


/* ---------------------------------------------------------------------------
   1. MODULE DATA
   Everything about each module lives in this one list (an "array" of
   "objects"). To rename a module or change its text, edit it here; the page
   is built from this list, so you never have to change the HTML.

   Each module has:
     title        the name shown on the button and in the learning panel
     explanation  a plain-English summary shown in the learning panel
   and then ONE of these:
     activity     a function that builds the module's interactive activity
                  inside the main content area (all three modules have one)
     placeholder  text shown in the main content area until an activity
                  is built (handy when adding a new module)
   --------------------------------------------------------------------------- */
const MODULES = [
  {
    title: "Aircraft Parts",
    explanation:
      "A fighter jet is made of a few main parts: the fuselage with the " +
      "cockpit and air intakes, the wings, the engines inside the back of the " +
      "body, and the tail. Parts called control surfaces move to steer it.",
    // buildAircraftPartsActivity is written further down this file (section 12).
    // JavaScript lets you refer to a function before the line that defines it.
    activity: buildAircraftPartsActivity
  },
  {
    title: "Fuselage and Wing Structure",
    explanation:
      "The fuselage and wings are not solid. Inside each is a light " +
      "\"skeleton\" with a skin fixed over it that shares the load: this is " +
      "called semi-monocoque construction. Because a fighter bends and " +
      "twists hard in tight turns, it uses heavy longerons, strong " +
      "bulkheads and wings with several spars.",
    // buildStructureActivity is in section 13.
    activity: buildStructureActivity
  },
  {
    title: "Engine and Empennage",
    explanation:
      "A fighter's engines sit inside the rear fuselage. Like every jet " +
      "engine, they work in four steps: suck, squeeze, bang, blow, and most " +
      "fighters add an afterburner for extra thrust. The empennage (say " +
      "\"em-PEN-ij\") is the whole tail: here, two fins with rudders and " +
      "an all-moving horizontal tail called the stabilators.",
    // buildEngineActivity is in section 14.
    activity: buildEngineActivity
  }
];

// The message shown in the learning panel when a module is opened.
const GET_READY_MESSAGE = "Get ready to explore this topic.";


/* ---------------------------------------------------------------------------
   2. STATE (what the app currently "remembers")
   These variables change as the trainee uses the page.
   --------------------------------------------------------------------------- */

// Which module is open right now. -1 means "none yet".
// (Arrays count from 0, so Module 1 is index 0, Module 2 is index 1, etc.)
let currentIndex = -1;

// Which modules have been completed, as a Set of module indexes (a Set is
// a list that ignores duplicates). Trainees can open the modules in any
// order, so this records exactly which ones are done, e.g. {0, 2} means
// Modules 1 and 3 are complete.
const completedModules = new Set();


/* ---------------------------------------------------------------------------
   3. FIND THE PAGE ELEMENTS
   document.getElementById finds an element by its id="..." in index.html.
   We look them up once here and keep them in constants for later.
   --------------------------------------------------------------------------- */
const welcomeScreen   = document.getElementById("welcome-screen");
const learningScreen  = document.getElementById("learning-screen");
const startButton     = document.getElementById("start-button");

const progressTrack   = document.getElementById("progress-track");
const progressFill    = document.getElementById("progress-fill");
const progressPercent = document.getElementById("progress-percent");

const moduleList      = document.getElementById("module-list");

const contentHeading  = document.getElementById("content-heading");
const contentBody     = document.getElementById("content-body");
const completeButton  = document.getElementById("complete-button");

const panelTopic       = document.getElementById("panel-topic");
const panelExplanation = document.getElementById("panel-explanation");
const panelMessage     = document.getElementById("panel-message");

const footerModule    = document.getElementById("footer-module");
const footerProgress  = document.getElementById("footer-progress");


/* ---------------------------------------------------------------------------
   4. BUILD THE MODULE BUTTONS
   For each module in MODULES we create a <li> containing a <button>, and
   add it to the empty <ol id="module-list"> in index.html.
   --------------------------------------------------------------------------- */
function buildModuleButtons() {
  // forEach runs the function once for every module.
  // "module" is the current object; "index" is its position (0, 1, 2).
  MODULES.forEach(function (module, index) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.className = "module-button";
    // Store the index on the button so we know which module was clicked.
    button.dataset.index = index;

    // The button has three lines of text: number, title, and status.
    // The status line is filled in later by updateModuleButtons().
    button.innerHTML =
      '<span class="module-number">Module ' + (index + 1) + "</span>" +
      '<span class="module-title">' + module.title + "</span>" +
      '<span class="module-status"></span>';

    // When this button is clicked, open its module.
    button.addEventListener("click", function () {
      openModule(index);
    });

    listItem.appendChild(button);
    moduleList.appendChild(listItem);
  });
}


/* ---------------------------------------------------------------------------
   5. UPDATE THE MODULE BUTTONS (active / complete)
   Called whenever something changes, so the buttons always match the state.
   --------------------------------------------------------------------------- */
function updateModuleButtons() {
  // querySelectorAll finds every element matching a CSS selector.
  const buttons = moduleList.querySelectorAll(".module-button");

  // Every module is always available, so no button is ever disabled
  // (locked); the buttons only show which module is open and which are done.
  buttons.forEach(function (button, index) {
    const isComplete = completedModules.has(index);
    const isActive   = index === currentIndex;

    // classList.toggle(name, true/false) adds or removes a CSS class.
    // style.css uses these classes to change the button's appearance.
    button.classList.toggle("is-active", isActive);
    button.classList.toggle("is-complete", isComplete);

    // aria-current tells screen readers which module is open.
    if (isActive) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }

    // Choose the status text for this button.
    const status = button.querySelector(".module-status");
    if (isComplete) {
      status.textContent = "✓ Completed";            // ✓ is a tick mark
    } else if (isActive) {
      status.textContent = "In progress";
    } else {
      status.textContent = "Not started";
    }
  });
}


/* ---------------------------------------------------------------------------
   6. OPEN A MODULE
   Runs when the trainee clicks a module button. Any module can be opened
   at any time, in any order.
   --------------------------------------------------------------------------- */
function openModule(index) {
  currentIndex = index;
  const module = MODULES[index];

  // Main content area: show the module title, then either its activity
  // or its placeholder text.
  contentHeading.textContent = "Module " + (index + 1) + ": " + module.title;
  contentBody.innerHTML = "";   // clear whatever was there before

  if (module.activity) {
    // "has-activity" removes the dashed placeholder look (see style.css).
    contentBody.classList.add("has-activity");
    module.activity(contentBody);
  } else {
    contentBody.classList.remove("has-activity");
    const placeholder = document.createElement("p");
    placeholder.className = "placeholder";
    // textContent (not innerHTML) is the safe way to insert plain text.
    placeholder.textContent = module.placeholder;
    contentBody.appendChild(placeholder);
  }

  // Show the "Mark complete" button only for a module that has no activity
  // yet and isn't done. (An activity completes its module by itself.)
  completeButton.hidden = Boolean(module.activity) || completedModules.has(index);

  // Learning panel: topic name, explanation and the "get ready" message.
  showPanelTopic(module.title, module.explanation);
  showPanelMessage(completedModules.has(index)
    ? "You have already completed this module. Feel free to review it."
    : GET_READY_MESSAGE);

  // Refresh everything else that depends on the state.
  updateModuleButtons();
  updateProgress();
}


/* ---------------------------------------------------------------------------
   7. COMPLETE THE CURRENT MODULE
   Runs when an activity is finished (or "Mark Module as Complete" is
   clicked, for a module without an activity).
   --------------------------------------------------------------------------- */
function completeCurrentModule() {
  // Nothing to do if this module was already completed.
  if (completedModules.has(currentIndex)) {
    return;
  }

  completedModules.add(currentIndex);
  completeButton.hidden = true;
  // Save the finished module under the trainee's ID (section 15).
  recordModuleComplete(currentIndex);

  // Pick an encouraging message depending on whether there is more to do.
  if (completedModules.size < MODULES.length) {
    // Suggest the first module (in order) that isn't done yet.
    const nextIndex = MODULES.findIndex(function (m, i) { return !completedModules.has(i); });
    showPanelMessage(
      "Well done! You have completed " + MODULES[currentIndex].title + ". " +
      "That is " + completedModules.size + " of " + MODULES.length +
      " modules. Next, try Module " + (nextIndex + 1) + ": " +
      MODULES[nextIndex].title + "."
    );
  } else {
    showPanelMessage(
      "Excellent work! You have completed all " + MODULES.length +
      " modules of Aircraft Familiarisation Training."
    );
    // Tell the portal's tracker the whole lesson is done (if it loaded).
    if (window.Tracker) {
      window.Tracker.complete();
    }
  }

  updateModuleButtons();
  updateProgress();
}


/* ---------------------------------------------------------------------------
   8. LEARNING PANEL HELPERS
   Small helpers so we don't repeat the same lines everywhere.
   --------------------------------------------------------------------------- */

// Change the topic name and explanation in the learning panel.
function showPanelTopic(title, explanation) {
  panelTopic.textContent = title;
  panelExplanation.textContent = explanation;
}

// Show an encouraging message in the green box.
function showPanelMessage(text) {
  panelMessage.textContent = text;
  panelMessage.hidden = false;
}

// Hide the green message box.
function hidePanelMessage() {
  panelMessage.hidden = true;
}


/* ---------------------------------------------------------------------------
   9. UPDATE THE PROGRESS BAR AND FOOTER
   Progress = completed modules / total modules, as a percentage.
   With 3 modules that gives 0%, 33%, 67% and 100%.
   --------------------------------------------------------------------------- */
function updateProgress() {
  // Math.round removes the decimals (e.g. 33.333... becomes 33).
  const percent = Math.round((completedModules.size / MODULES.length) * 100);

  // Progress bar: set the fill width and the text beside it.
  progressFill.style.width = percent + "%";
  // e.g. "1 of 3 modules completed, 33%".
  progressPercent.textContent =
    completedModules.size + " of " + MODULES.length + " modules completed, " + percent + "%";
  progressTrack.setAttribute("aria-valuenow", percent);

  // Footer, "Module X of 3": the open module, or Module 1 if none is open yet.
  const moduleNumber = currentIndex === -1 ? 1 : currentIndex + 1;
  footerModule.textContent = "Module " + moduleNumber + " of " + MODULES.length;
  footerProgress.textContent = "Progress: " + percent + "% Complete";
}


/* ---------------------------------------------------------------------------
   10. START LEARNING (switch screens)
   Hides the welcome screen and shows the main learning area.
   --------------------------------------------------------------------------- */
function startLearning() {
  welcomeScreen.hidden = true;
  learningScreen.hidden = false;

  // Move keyboard focus to the first module button, so keyboard and
  // screen-reader users land in the right place.
  moduleList.querySelector(".module-button").focus();
}


/* ===========================================================================
   11. SHARED DIAGRAM ACTIVITY (used by Modules 1, 2 and 3)

   All three modules work the same way, so they share this code. Only their
   pictures and their list of parts are different. The trainee works
   through two steps:
     Step 1, Explore:     click each part on the pictures to read what it is.
                          Every part must be explored before moving on.
     Step 2, Parts Check: the app names a part ("Find the ribs") and the
                          trainee clicks it on a picture. A wrong click gives
                          a hint; a right click gives an encouraging message.
   Finishing the check completes the module.

   The shared HTML is <template id="diagram-activity-template"> in
   index.html; each module's pictures have their own template. The colours
   and highlights are in section 10 of style.css.
   =========================================================================== */

// Return a shuffled copy of a list (the "Fisher-Yates" shuffle), so the
// parts check asks its questions in a different order each time.
function shuffled(list) {
  const copy = list.slice();   // slice() makes a copy; the original stays as is
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/* ---------------------------------------------------------------------------
   buildDiagramActivity(container, config)
   Builds the activity inside "container" (the main content area).
   "config" is an object describing one module's activity:
     moduleIndex          which module this is (0 = Module 1, 1 = Module 2,
                          2 = Module 3)
     diagramsTemplateId   id of the <template> holding the pictures
     parts                the list of parts (see the module sections below)
     groups               the groups of name buttons, in order. Each has an
                          id, a title, and optionally swatch: true to show a
                          colour swatch (used for control surfaces)
     exploreInstructions  text shown above the pictures in Step 1
     checkInstructions    text shown above the pictures in Step 2
     checkExplanation     learning-panel text during Step 2
     summary              learning-panel text when the activity is finished

   Everything the activity needs lives inside this one function, so its
   variables start fresh each time the module is opened.
   --------------------------------------------------------------------------- */
function buildDiagramActivity(container, config) {
  const parts = config.parts;
  const module = MODULES[config.moduleIndex];

  // A group's title without the part in brackets, e.g. "Control surfaces".
  function groupTitle(id) {
    const group = config.groups.find(function (g) { return g.id === id; });
    return group ? group.title.replace(/\s*\(.*\)$/, "") : module.title;
  }

  // Find a part's data object from its id, e.g. findPart("ribs").
  function findPart(id) {
    return parts.find(function (part) { return part.id === id; });
  }

  // --- Copy the shared template into the content area, then copy this
  //     module's pictures into its empty "diagrams" box ---
  const shell = document.getElementById("diagram-activity-template");
  container.appendChild(shell.content.cloneNode(true));
  const pictures = document.getElementById(config.diagramsTemplateId);
  container.querySelector('[data-role="diagrams"]').appendChild(pictures.content.cloneNode(true));

  // Find an element in the copy by its data-role="..." name.
  function getRole(name) {
    return container.querySelector('[data-role="' + name + '"]');
  }

  const stepLabel     = getRole("step");
  const instructions  = getRole("instructions");
  const prompt        = getRole("prompt");
  const feedback      = getRole("feedback");
  const chipList      = getRole("chips");
  const countText     = getRole("count");
  const startCheckBtn = getRole("start-check");
  const exploreBtn    = getRole("explore-again");
  const retryBtn      = getRole("retry");
  const nextModuleBtn = getRole("next-module");
  const scoreMessage  = getRole("score-message");   // pass/review box (section 16)
  // Every clickable part in every picture. Most parts appear in more than
  // one picture, with the same data-part name each time.
  const partShapes    = container.querySelectorAll(".part");

  // The "next module" button names the module that follows, if there is one.
  const nextModule = MODULES[config.moduleIndex + 1];
  if (nextModule) {
    nextModuleBtn.textContent =
      "Go to Module " + (config.moduleIndex + 2) + ": " + nextModule.title;
  }

  // --- Activity state ---
  let mode = "explore";        // "explore", "check" or "finished"
  let selectedId = null;       // part selected in explore mode
  const explored = new Set();  // a Set is a list that ignores duplicates
  let questions = [];          // shuffled parts still to ask about
  let currentQuestion = null;  // the part the trainee is asked to find
  const found = new Set();     // parts found so far in this check
  let firstTryCorrect = 0;     // answers right without a wrong click first
  let missedThisQuestion = false;
  let checkAnswers = [];       // one { q, topic, correct } per part, for the tracker


  // --- Build the name buttons ("chips"), one group at a time ---
  config.groups.forEach(function (group) {
    // A heading for the group, e.g. "Main parts".
    const title = document.createElement("p");
    title.className = "chip-group-title";
    title.textContent = group.title;
    if (group.swatch) {
      // Add a small colour swatch matching the control surfaces' colour.
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      title.prepend(swatch);
    }

    // A list holding one button per part in this group.
    const list = document.createElement("ul");
    list.className = "part-chips";
    parts.forEach(function (part) {
      if (part.group !== group.id) {
        return;   // skip parts that belong to another group
      }
      const item = document.createElement("li");
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "part-chip";
      chip.dataset.part = part.id;
      chip.textContent = part.name;
      chip.addEventListener("click", function () { handlePartChosen(part.id); });
      item.appendChild(chip);
      list.appendChild(item);
    });

    const wrapper = document.createElement("div");
    wrapper.appendChild(title);
    wrapper.appendChild(list);
    chipList.appendChild(wrapper);
  });


  // Add or remove the "is-hover" class on every copy of a part, so
  // pointing at a part in one picture also lights it up in the others.
  function setHover(id, isHovering) {
    partShapes.forEach(function (other) {
      if (other.dataset.part === id) {
        other.classList.toggle("is-hover", isHovering);
      }
    });
  }

  // --- Clicking or pressing a part on any picture ---
  partShapes.forEach(function (shape) {
    shape.addEventListener("click", function () {
      handlePartChosen(shape.dataset.part);
    });
    // Mouse moves onto / off a part: light up its copies in the other pictures.
    shape.addEventListener("mouseenter", function () { setHover(shape.dataset.part, true); });
    shape.addEventListener("mouseleave", function () { setHover(shape.dataset.part, false); });
    // Keyboard: Enter or Space presses a part, just like a real button.
    shape.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();   // stop Space from scrolling the page
        handlePartChosen(shape.dataset.part);
      }
    });
  });

  // One place that decides what a click means in the current step.
  function handlePartChosen(id) {
    if (mode === "explore") {
      explorePart(id);
    } else if (mode === "check") {
      answerQuestion(id);
    }
    // In "finished" mode clicks do nothing.
  }


  /* ---------------- STEP 1: EXPLORE ---------------- */

  function startExplore() {
    mode = "explore";
    selectedId = null;
    explored.clear();

    stepLabel.textContent = "Step 1 of 2: Explore";
    instructions.textContent = config.exploreInstructions;
    prompt.hidden = true;
    feedback.hidden = true;
    chipList.hidden = false;
    startCheckBtn.hidden = true;
    exploreBtn.hidden = true;
    retryBtn.hidden = true;
    nextModuleBtn.hidden = true;
    scoreMessage.hidden = true;   // hide the last score while exploring again

    refresh();
  }

  function explorePart(id) {
    const part = findPart(id);
    selectedId = id;
    explored.add(id);

    // Show the part in the learning panel.
    showPanelTopic(part.name, part.explanation);

    if (explored.size < parts.length) {
      showPanelMessage(
        "Good. You have explored " + explored.size + " of " +
        parts.length + " parts."
      );
    } else {
      showPanelMessage(
        "Great work! You have explored every part. When you are ready, start " +
        "the Parts Check to test yourself."
      );
      startCheckBtn.hidden = false;
    }

    refresh();
  }


  /* ---------------- STEP 2: PARTS CHECK ---------------- */

  function startCheck() {
    mode = "check";
    selectedId = null;
    found.clear();
    firstTryCorrect = 0;
    checkAnswers = [];
    questions = shuffled(parts);

    stepLabel.textContent = "Step 2 of 2: Parts Check";
    instructions.textContent = config.checkInstructions;
    chipList.hidden = true;    // hide the names, or the check would be too easy
    feedback.hidden = true;
    startCheckBtn.hidden = true;
    exploreBtn.hidden = true;
    retryBtn.hidden = true;
    nextModuleBtn.hidden = true;
    scoreMessage.hidden = true;   // hide the last score while retaking the check

    showPanelTopic("Parts Check", config.checkExplanation);
    hidePanelMessage();

    askNextQuestion();
    prompt.focus();            // move keyboard focus to the question
  }

  function askNextQuestion() {
    currentQuestion = questions.shift();   // take the first part off the list
    missedThisQuestion = false;
    prompt.hidden = false;
    prompt.textContent = "Find the " + currentQuestion.name.toLowerCase() + ".";
    refresh();
  }

  function answerQuestion(id) {
    // Ignore clicks on parts that have already been found.
    if (found.has(id)) {
      return;
    }

    if (id === currentQuestion.id) {
      // ---- Correct ----
      found.add(id);
      if (!missedThisQuestion) {
        firstTryCorrect = firstTryCorrect + 1;
      }
      // Right first time counts as correct on the trainee's progress page.
      // The part's group (e.g. "Wing structure") is the topic.
      checkAnswers.push({
        q: module.title + ": find the " + currentQuestion.name.toLowerCase(),
        topic: groupTitle(currentQuestion.group),
        correct: !missedThisQuestion
      });
      feedback.hidden = false;
      feedback.className = "activity-feedback is-correct";
      feedback.textContent = "Correct! You found the " + currentQuestion.name.toLowerCase() + ".";
      showPanelMessage(
        "Well done! The " + currentQuestion.name.toLowerCase() + ": " + currentQuestion.short
      );

      if (questions.length > 0) {
        askNextQuestion();
      } else {
        finishCheck();
      }
    } else {
      // ---- Not quite: give a hint, but don't name the part they clicked ----
      missedThisQuestion = true;
      feedback.hidden = false;
      feedback.className = "activity-feedback is-hint";
      feedback.textContent = "Not quite. " + currentQuestion.hint;
      hidePanelMessage();
    }
  }

  function finishCheck() {
    mode = "finished";
    currentQuestion = null;
    prompt.hidden = true;

    stepLabel.textContent = "Activity complete";
    instructions.textContent =
      "You found all " + parts.length + " parts. " +
      firstTryCorrect + " of " + parts.length + " were right first time.";
    feedback.hidden = true;
    exploreBtn.hidden = false;
    retryBtn.hidden = false;

    showPanelTopic(module.title, config.summary);

    // Save the result on this device for My progress (if the tracker loaded).
    if (window.Tracker) {
      window.Tracker.quizResult(firstTryCorrect, parts.length, checkAnswers);
    }

    // Save the score as a percentage under the trainee's ID (keeping only
    // their highest), then show the green or amber message (section 16).
    const result = saveQuizScore(config.moduleIndex, firstTryCorrect, parts.length);
    showScoreMessage(scoreMessage, result, !nextModule);

    // Complete the module the first time; afterwards this is just revision.
    if (!completedModules.has(config.moduleIndex)) {
      completeCurrentModule();   // updates progress and shows "Well done!"
    } else {
      showPanelMessage("Great revision! You found every part again.");
    }

    refresh();
    if (nextModule) {
      nextModuleBtn.hidden = false;
      nextModuleBtn.focus();
    } else {
      exploreBtn.focus();
    }
  }


  /* ---------------- KEEP THE PICTURES UP TO DATE ---------------- */

  // Recolour the parts and name buttons, and update the count text, to
  // match the current state. Called after every change.
  function refresh() {
    partShapes.forEach(function (shape) {
      const id = shape.dataset.part;
      const isDone = mode === "explore" ? explored.has(id) : found.has(id);
      shape.classList.toggle("is-done", isDone);
      shape.classList.toggle("is-selected", mode === "explore" && id === selectedId);

      // Screen readers read this label. In the check it says "Part 3"
      // instead of the real name, so it doesn't give the answer away.
      // (The number is the part's position in the parts list, so a part
      // has the same number in every picture.)
      const number = parts.indexOf(findPart(id)) + 1;
      const label = mode === "explore" ? findPart(id).name : "Part " + number;
      shape.setAttribute("aria-label", label + (isDone ? " (done)" : ""));
    });

    chipList.querySelectorAll(".part-chip").forEach(function (chip) {
      const id = chip.dataset.part;
      chip.classList.toggle("is-done", explored.has(id));
      chip.setAttribute("aria-pressed", id === selectedId ? "true" : "false");
      chip.textContent = (explored.has(id) ? "✓ " : "") + findPart(id).name;
    });

    if (mode === "explore") {
      countText.textContent = explored.size + " of " + parts.length + " parts explored";
    } else if (mode === "check") {
      countText.textContent = "Question " + (found.size + 1) + " of " + parts.length;
    } else {
      countText.textContent = "";
    }
  }


  /* ---------------- BUTTONS ---------------- */
  startCheckBtn.addEventListener("click", startCheck);
  retryBtn.addEventListener("click", startCheck);
  exploreBtn.addEventListener("click", function () {
    startExplore();
    showPanelTopic(module.title, module.explanation);
    hidePanelMessage();
  });
  nextModuleBtn.addEventListener("click", function () {
    openModule(config.moduleIndex + 1);
  });

  // Begin with Step 1.
  startExplore();
}


/* ===========================================================================
   12. MODULE 1 ACTIVITY: AIRCRAFT PARTS
   Pictures: <template id="aircraft-parts-diagrams"> in index.html.
   =========================================================================== */

/* ---------------------------------------------------------------------------
   PART DATA
   One object per part. The id must match a data-part="..." in index.html.
     group        which group of name buttons it goes in: here "main" for
                  the fixed main parts, or "control" for the control
                  surfaces (the parts that move to steer)
     name         shown in the learning panel and on the name buttons
     explanation  what the part is and does, in plain English
     short        a one-line reminder, used in the "Correct!" message
     hint         a clue shown when the trainee clicks the wrong part
   --------------------------------------------------------------------------- */
const AIRCRAFT_PARTS = [
  {
    id: "fuselage",
    group: "main",
    name: "Fuselage",
    explanation:
      "The fuselage is the main body of the fighter. It holds the cockpit at " +
      "the front, fuel tanks and equipment in the middle, and the engines at " +
      "the back. All the other main parts are attached to it.",
    short: "the main body that holds the cockpit, fuel and engines.",
    hint: "Look for the long main body that runs from the pointed nose to the tail."
  },
  {
    id: "cockpit",
    group: "main",
    name: "Cockpit",
    explanation:
      "The cockpit is where the pilot sits, under a clear bubble called the " +
      "canopy. The canopy gives the pilot an all-round view and opens to let " +
      "them get in and out. The pointed nose in front of it, called the " +
      "radome, covers the radar.",
    short: "where the pilot sits, under the clear canopy.",
    hint: "Look near the front for the clear bubble the pilot sits under."
  },
  {
    id: "air-intake",
    group: "main",
    name: "Air intakes",
    explanation:
      "The air intakes are the openings on each side of the fuselage that " +
      "feed air to the engines. Behind each opening, a long duct leads the " +
      "air smoothly back to the front of an engine.",
    short: "the openings on the sides that feed air to the engines.",
    hint: "Look on the side of the body, just ahead of the wing, for the box-shaped openings."
  },
  {
    id: "wing",
    group: "main",
    name: "Wings",
    explanation:
      "The wings stick out from each side of the fuselage. As the aircraft " +
      "moves forward, air flowing over them creates lift: the upward force " +
      "that holds it in the air. Fighter wings are thin and swept back for " +
      "high speed. They hold fuel, and have mounting points underneath for " +
      "extra fuel tanks and weapons. You will look inside a wing in Module 2.",
    short: "they create the lift that holds the aircraft up.",
    hint: "Look for the large surfaces that stick out from the sides of the body."
  },
  {
    id: "engine",
    group: "main",
    name: "Engines",
    explanation:
      "A fighter's engines are buried inside the rear fuselage (shown dashed), " +
      "not hung under the wings. Air comes in through the intakes, and the " +
      "hot gas leaves through the exhaust nozzles at the tail, pushing the " +
      "aircraft forward. You will look inside an engine in Module 3.",
    short: "they push the aircraft forward (thrust), from inside the rear body.",
    hint: "Look at the very back for the exhaust nozzles, and the dashed outline inside the rear body."
  },
  {
    id: "vertical-stabiliser",
    group: "main",
    name: "Vertical stabilisers (fins)",
    explanation:
      "This fighter has two fins, side by side at the tail; in the side view " +
      "they overlap and look like one. They keep the aircraft pointing " +
      "straight and stop it swinging from side to side, like the feathers " +
      "on an arrow. The hinged panel on each fin is a rudder.",
    short: "the upright tail surfaces that keep the aircraft pointing straight.",
    hint: "Look at the back for the upright surfaces: big in the side view, thin strips in the top view."
  },
  {
    id: "landing-gear",
    group: "main",
    name: "Landing gear",
    explanation:
      "The landing gear is the set of wheels, legs and shock absorbers the " +
      "aircraft stands on. A fighter's gear is short and very strong, to take " +
      "hard landings. After take-off it folds up into the aircraft.",
    short: "the wheels and legs the aircraft stands and lands on.",
    hint: "Look underneath the aircraft for the wheels."
  },

  // ----- Control surfaces: parts that move to steer -----
  {
    id: "flaps",
    group: "control",
    name: "Flaps",
    explanation:
      "Flaps are hinged panels on the back edge of each wing, close to the " +
      "body. For take-off and landing they move down, making the wing more " +
      "curved so it gives more lift at low speed.",
    short: "they give extra lift at low speed, for take-off and landing.",
    hint: "Look along the back edge of the wing, on the inner part close to the body."
  },
  {
    id: "ailerons",
    group: "control",
    name: "Ailerons",
    explanation:
      "Ailerons are hinged panels on the back edge of each wing, near the " +
      "tips. They move in opposite directions: when the left one goes up, " +
      "the right one goes down. This tips the aircraft to one side, called " +
      "rolling, which is how it starts a turn.",
    short: "they roll the aircraft to one side to start a turn.",
    hint: "Look along the back edge of the wing, on the outer part near the wing tip."
  },
  {
    id: "stabilators",
    group: "control",
    name: "Stabilators",
    explanation:
      "On most fighters the whole horizontal tail moves, instead of having a " +
      "fixed part with a hinged elevator as airliners do. This all-moving " +
      "tail is called a stabilator (stabiliser + elevator). Tilting both " +
      "together points the nose up or down (pitch); moving them in opposite " +
      "directions helps the aircraft roll.",
    short: "the all-moving tail surfaces that point the nose up or down (pitch).",
    hint: "Look at the very back for the flat tail surfaces: clearest in the top view."
  },
  {
    id: "rudder",
    group: "control",
    name: "Rudders",
    explanation:
      "Each fin has a rudder: a hinged panel on its back edge. Moving the " +
      "rudders left or right swings the nose left or right, like the rudder " +
      "on a boat. This side-to-side movement is called yaw.",
    short: "they swing the nose left or right (yaw).",
    hint: "In the side view, look along the back edge of the fin."
  }
];

const AIRCRAFT_PART_GROUPS = [
  { id: "main", title: "Main parts" },
  { id: "control", title: "Control surfaces (parts that move to steer)", swatch: true }
];

function buildAircraftPartsActivity(container) {
  buildDiagramActivity(container, {
    moduleIndex: 0,
    diagramsTemplateId: "aircraft-parts-diagrams",
    parts: AIRCRAFT_PARTS,
    groups: AIRCRAFT_PART_GROUPS,
    exploreInstructions:
      "Click or tap each part of the fighter jet to find out what it is and " +
      "what it does. You can use either the side view or the top view, or the " +
      "name buttons under the pictures. Parts you have explored turn green.",
    checkInstructions:
      "Find each part on either picture. If you pick the wrong one, you will " +
      "get a hint.",
    checkExplanation:
      "Use what you learned in Step 1. Find each part on the side view or the top view.",
    summary:
      "You can now name the seven main parts of a fighter jet (fuselage, " +
      "cockpit, air intakes, wings, engines, vertical stabilisers and landing " +
      "gear) and its four main control surfaces (flaps, ailerons, " +
      "stabilators and rudders)."
  });
}


/* ===========================================================================
   13. MODULE 2 ACTIVITY: FUSELAGE AND WING STRUCTURE
   Pictures: <template id="structure-diagrams"> in index.html.
   Same fields as AIRCRAFT_PARTS in section 12.
   =========================================================================== */
const STRUCTURE_PARTS = [
  // ----- Fuselage structure -----
  {
    id: "frames",
    group: "fuselage",
    name: "Frames",
    explanation:
      "Frames are hoops spaced along the fuselage, a bit like the ribs in " +
      "your chest. They give the fuselage its shape and stop it being " +
      "squashed. Openings such as access panels are cut out between them.",
    short: "hoops spaced along the body that give it its shape.",
    hint: "Look for the light upright strips in the side view, or the ring just inside the skin in the cross-section."
  },
  {
    id: "bulkheads",
    group: "fuselage",
    name: "Bulkheads",
    explanation:
      "Bulkheads are much heavier frames, made as solid walls. They are put " +
      "where big loads come into the fuselage, such as where the wings, " +
      "landing gear or engines are attached, and they also separate areas " +
      "such as the cockpit from the equipment bays.",
    short: "heavy, solid frames placed where big loads come in.",
    hint: "In the side view, look for the two thick, solid upright walls."
  },
  {
    id: "longerons",
    group: "fuselage",
    name: "Longerons",
    explanation:
      "Longerons are heavy beams that run from the front of the fuselage to " +
      "the back, joining the frames and bulkheads. A fighter twists and " +
      "bends hard in tight turns, so it relies on strong longerons to carry " +
      "those loads along the body.",
    short: "heavy beams running front to back along the body.",
    hint: "Look for the thick beams running front to back in the side view, or the blocks in the corners of the cross-section."
  },
  {
    id: "fuselage-skin",
    group: "fuselage",
    name: "Fuselage skin",
    explanation:
      "The skin is the outer covering, made of aluminium alloy, titanium or " +
      "composite panels and fastened to the frames and longerons. It is not " +
      "just a cover: it carries a large share of the load. Many panels can " +
      "be removed to reach equipment inside.",
    short: "the outer covering that also carries load.",
    hint: "Look for the smooth outer covering of the body, or the outer ring of the cross-section."
  },

  // ----- Wing structure -----
  {
    id: "spars",
    group: "wing",
    name: "Spars",
    explanation:
      "Spars are the main beams of the wing, running from the root (where " +
      "it joins the fuselage) out to the tip. Because a fighter wing is very " +
      "thin but must be very strong, it has several spars close together " +
      "(a multi-spar wing). They carry most of the bending load.",
    short: "several main beams running from root to tip.",
    hint: "Look for the long beams running along the wing from root to tip, or the upright bars in the cross-section."
  },
  {
    id: "ribs",
    group: "wing",
    name: "Ribs",
    explanation:
      "Ribs run from the front of the wing to the back. Each one is cut to " +
      "the wing's thin curved shape, so they hold the skin in the right " +
      "shape. A multi-spar fighter wing needs only a few ribs. Holes are cut " +
      "in them to save weight.",
    short: "wing-shaped pieces that hold the skin in shape.",
    hint: "Look for the cross-pieces running from the front edge to the back edge, or the wing shape in the cross-section."
  },
  {
    id: "wing-skin",
    group: "wing",
    name: "Wing skin",
    explanation:
      "The wing skin covers the top and bottom of the wing. On a fighter it " +
      "is thick and very strong, often machined from one solid piece of " +
      "metal or made of composite. The skin and spars together form a " +
      "sealed box that holds fuel.",
    short: "the thick outer covering of the wing, which also carries load.",
    hint: "Look for the covering near the wing root, or the thick outline around the cross-section."
  },

  // ----- Wing control surfaces -----
  {
    id: "flaps",
    group: "wing-control",
    name: "Flaps",
    explanation:
      "Flaps are hinged panels along the back edge of the wing, on the inner " +
      "part near the root. Each flap has its own small spar, ribs and skin, " +
      "and is hinged to fittings behind the last spar. It moves down for " +
      "take-off and landing to give extra lift at low speed.",
    short: "hinged panels on the inner back edge, attached behind the last spar.",
    hint: "Look along the back edge of the wing, on the inner part near the root, or behind the main wing in the cross-section."
  },
  {
    id: "ailerons",
    group: "wing-control",
    name: "Ailerons",
    explanation:
      "Ailerons are hinged panels along the back edge of the wing, on the " +
      "outer part near the tip. Like flaps, they have their own small spar, " +
      "ribs and skin, and are hinged behind the last spar. They move up and " +
      "down in opposite directions on each wing to roll the aircraft.",
    short: "hinged panels on the outer back edge that roll the aircraft.",
    hint: "Look along the back edge of the wing, on the outer part near the tip."
  },

  // ----- Fuel: tanks in the wings and lower fuselage -----
  {
    id: "fuel-tank",
    group: "fuel",
    name: "Fuel tanks",
    explanation:
      "A fighter carries its fuel in the wings and in the lower fuselage " +
      "(the dashed areas marked \"Fuel\"). In the wing, the box between the " +
      "front and back spars is sealed so it holds fuel directly: this is " +
      "called an integral tank, or a \"wet wing\". Tanks in the lower " +
      "fuselage sit inside the structure, behind the skin. Extra tanks can " +
      "also be hung under the wings or body.",
    short: "they hold fuel, in the wings and the lower fuselage.",
    hint: "Look for the dashed areas marked Fuel: inside the wing between the spars, and in the lower part of the fuselage side view."
  }
];

const STRUCTURE_PART_GROUPS = [
  { id: "fuselage", title: "Fuselage structure" },
  { id: "wing", title: "Wing structure" },
  { id: "wing-control", title: "Wing control surfaces (hinged panels)", swatch: true },
  { id: "fuel", title: "Fuel" }
];

function buildStructureActivity(container) {
  buildDiagramActivity(container, {
    moduleIndex: 1,
    diagramsTemplateId: "structure-diagrams",
    parts: STRUCTURE_PARTS,
    groups: STRUCTURE_PART_GROUPS,
    exploreInstructions:
      "Part of the skin has been removed so you can see the structure inside. " +
      "Click or tap each part on any picture, or use the name buttons, to " +
      "find out what it does. Parts you have explored turn green.",
    checkInstructions:
      "Find each part on any of the pictures. If you pick the wrong one, you " +
      "will get a hint.",
    checkExplanation:
      "Use what you learned in Step 1. Find each part of the fuselage and " +
      "wing structure on the pictures.",
    summary:
      "You can now name the parts that make up a fighter's fuselage " +
      "(frames, bulkheads, longerons and skin) and wing (spars, ribs and " +
      "skin, with the flaps and ailerons hinged behind the last spar), and " +
      "say where its fuel is carried: in the wings and the lower fuselage. " +
      "Together they form a strong, light skeleton with a skin that shares " +
      "the load."
  });
}


/* ===========================================================================
   14. MODULE 3 ACTIVITY: ENGINE AND EMPENNAGE
   Pictures: <template id="engine-diagrams"> in index.html.
   Same fields as AIRCRAFT_PARTS in section 12.
   =========================================================================== */
const ENGINE_PARTS = [
  // ----- Engine (a fighter's afterburning turbofan) -----
  {
    id: "air-intake",
    group: "engine",
    name: "Air intake",
    explanation:
      "The air intake is the opening on the side of the fuselage and the " +
      "duct behind it, which leads air to the front of the engine. The duct " +
      "slows the air down and smooths it, so the engine gets an even flow " +
      "of air even when the aircraft is flying faster than sound.",
    short: "the duct that leads air to the front of the engine.",
    hint: "Look at the very front, where the air comes in."
  },
  {
    id: "fan",
    group: "engine",
    name: "Fan",
    explanation:
      "The fan is the first few rows of blades at the front of the engine. " +
      "It sucks air in: this is \"suck\". A fighter's fan is much smaller " +
      "than an airliner's, so most of the air goes on through the core of " +
      "the engine. This suits high speed.",
    short: "the front blades that suck air in (suck).",
    hint: "Look just behind the air intake for the first blades and the small spinner."
  },
  {
    id: "compressor",
    group: "engine",
    name: "Compressor",
    explanation:
      "The compressor is many rows of smaller blades behind the fan. They " +
      "squeeze the air into a smaller and smaller space, so it becomes high " +
      "pressure: this is \"squeeze\".",
    short: "rows of blades that squeeze the air (squeeze).",
    hint: "Look behind the fan for rows of blades that get smaller toward the back."
  },
  {
    id: "combustion-chamber",
    group: "engine",
    name: "Combustion chamber",
    explanation:
      "In the combustion chamber, fuel is sprayed into the squeezed air and " +
      "burned. This makes very hot gas that expands fast: this is \"bang\".",
    short: "where fuel is burned in the squeezed air (bang).",
    hint: "Look in the middle of the engine for the small chamber with the flame."
  },
  {
    id: "turbine",
    group: "engine",
    name: "Turbine",
    explanation:
      "The hot gas rushes through the turbine blades and spins them, like " +
      "wind spinning a windmill. The turbine is joined by shafts to the fan " +
      "and compressor, so it keeps them turning.",
    short: "blades spun by the hot gas, which drive the fan and compressor.",
    hint: "Look behind the combustion chamber for rows of blades that get bigger again."
  },
  {
    id: "afterburner",
    group: "engine",
    name: "Afterburner",
    explanation:
      "The afterburner is a long pipe behind the turbine. For take-off or in " +
      "combat, extra fuel is sprayed into the hot exhaust and burned again, " +
      "giving a big boost in thrust, but using fuel very quickly. It is the " +
      "long flame you see coming out of a fighter's nozzle.",
    short: "the long pipe where extra fuel is burned for more thrust.",
    hint: "Look for the long pipe between the turbine and the nozzle, with the long flame."
  },
  {
    id: "exhaust-nozzle",
    group: "engine",
    name: "Exhaust nozzle",
    explanation:
      "The exhaust nozzle at the back shapes the hot gas into a fast jet as " +
      "it leaves: this is \"blow\". On a fighter it is made of overlapping " +
      "metal flaps (petals) that open wider when the afterburner is on and " +
      "close down for normal flight.",
    short: "the adjustable nozzle where the hot gas leaves (blow).",
    hint: "Look at the very back of the engine, where the hot gas leaves."
  },

  // ----- Empennage (the whole tail): fixed parts -----
  {
    id: "rear-fuselage",
    group: "empennage",
    name: "Rear fuselage",
    explanation:
      "The rear fuselage is the back end of the body, around the engines. " +
      "Strong frames here carry the fins and the stabilators, and many " +
      "panels open to give access to the engines. On some fighters a " +
      "hook for stopping on a carrier or emergency cable is fitted here too.",
    short: "the back end of the body, which carries the tail and holds the engines.",
    hint: "Look for the back end of the body."
  },
  {
    id: "vertical-stabiliser",
    group: "empennage",
    name: "Vertical stabilisers (fins)",
    explanation:
      "Many fighters have two fins, which keep the aircraft pointing " +
      "straight and stop it swinging from side to side. Inside, each fin is " +
      "built like a small wing, with spars running up it and ribs across " +
      "it (the dashed lines in the side view), covered with skin that is " +
      "often made of composite.",
    short: "the upright tail surfaces that keep the aircraft pointing straight.",
    hint: "Look for the tall upright surface in the side view, or the two thin strips in the top view."
  },

  // ----- Empennage control surfaces -----
  {
    id: "rudder",
    group: "empennage-control",
    name: "Rudders",
    explanation:
      "Each fin has a rudder: a hinged panel on its back edge, attached to " +
      "the fin's rear spar. Moving the rudders left or right swings the nose " +
      "left or right (yaw). They are moved by hydraulic actuators: rams " +
      "pushed by high-pressure fluid.",
    short: "they swing the nose left or right (yaw).",
    hint: "In the side view, look along the back edge of the fin."
  },
  {
    id: "stabilators",
    group: "empennage-control",
    name: "Stabilators",
    explanation:
      "The stabilators are the all-moving horizontal tail. Each one turns " +
      "as a whole on a strong pivot shaft, driven by a powerful hydraulic " +
      "actuator. Moving both together points the nose up or down (pitch); " +
      "moving them in opposite directions helps the aircraft roll.",
    short: "the all-moving tail surfaces that point the nose up or down (pitch).",
    hint: "Look for the flat tail surfaces: clearest in the top view."
  }
];

const ENGINE_PART_GROUPS = [
  { id: "engine", title: "Engine (afterburning turbofan)" },
  { id: "empennage", title: "Empennage (tail)" },
  { id: "empennage-control", title: "Empennage control surfaces (parts that move to steer)", swatch: true }
];

function buildEngineActivity(container) {
  buildDiagramActivity(container, {
    moduleIndex: 2,
    diagramsTemplateId: "engine-diagrams",
    parts: ENGINE_PARTS,
    groups: ENGINE_PART_GROUPS,
    exploreInstructions:
      "Click or tap each part of the engine and the empennage (tail) on the " +
      "pictures, or use the name buttons, to find out what it does. Parts " +
      "you have explored turn green.",
    checkInstructions:
      "Find each part on any of the pictures. If you pick the wrong one, you " +
      "will get a hint.",
    checkExplanation:
      "Use what you learned in Step 1. Find each part of the engine and the " +
      "empennage on the pictures.",
    summary:
      "You can now name the parts of a fighter's engine in the order the air " +
      "meets them (air intake, fan, compressor, combustion chamber, turbine, " +
      "afterburner and exhaust nozzle) and the parts of its empennage: rear " +
      "fuselage, fins, rudders and stabilators."
  });
}


/* ===========================================================================
   15. TRAINEE LOGIN AND SAVED PROGRESS (new)

   The first time a trainee opens this page they see the login screen. They
   type their full name and trainee ID and click Begin Training. We save
   them in localStorage (storage built into the browser that keeps data
   after the page is closed) and show the welcome screen.

   On a return visit we find the saved trainee ID, skip the login screen,
   put back their completed modules and go straight to the learning area.

   localStorage only stores text, so we turn our data into text with
   JSON.stringify when saving, and back into an object with JSON.parse when
   loading. Everything stays in this browser on this device: nothing is
   sent anywhere.

   Two localStorage "keys" (names) are used:
     aircraft-training-trainees    every trainee who has signed in on this
                                   device, stored by trainee ID, e.g.
       {
         "S1234": {
           id: "S1234",
           name: "Jane Tan",
           completed: ["Aircraft Parts"],      titles of the finished modules
           scores: { "Aircraft Parts": 91 },   highest score (%) per module
           lastActive: "2026-10-05T09:30:00.000Z"
         }
       }
     aircraft-training-current-id  the ID of the trainee signed in now

   Completed modules and scores are stored by module TITLE (from MODULES in
   section 1), so the dashboard can show them by name. dashboard.js reads
   the same keys and titles: if you rename a key or a module, change it in
   dashboard.js too.
   =========================================================================== */

// The localStorage key names (see above).
const TRAINEES_KEY   = "aircraft-training-trainees";
const CURRENT_ID_KEY = "aircraft-training-current-id";

// The trainee signed in right now (one object from the list above), or
// null before anyone has signed in.
let currentTrainee = null;

// The login screen and the trainee badge in the top bar (see index.html).
const loginScreen         = document.getElementById("login-screen");
const loginForm           = document.getElementById("login-form");
const nameInput           = document.getElementById("trainee-name");
const idInput             = document.getElementById("trainee-id");
const loginError          = document.getElementById("login-error");
const traineeBadge        = document.getElementById("trainee-badge");
const traineeBadgeName    = document.getElementById("trainee-badge-name");
const switchTraineeButton = document.getElementById("switch-trainee-button");

// Read every saved trainee. Always returns an object, even if nothing is
// saved yet, the saved text is damaged, or the browser blocks storage
// ("try ... catch" catches the error instead of stopping the page).
function loadAllTrainees() {
  try {
    const saved = JSON.parse(localStorage.getItem(TRAINEES_KEY));
    // Only accept a plain object (not null, and not a list).
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      return saved;
    }
  } catch (error) {
    // Storage blocked or damaged: carry on with an empty list.
  }
  return {};
}

// Save every trainee. If the browser blocks storage, the page still works;
// progress just won't be remembered after it is closed.
function saveAllTrainees(allTrainees) {
  try {
    localStorage.setItem(TRAINEES_KEY, JSON.stringify(allTrainees));
  } catch (error) {
    // Storage blocked or full: nothing more we can do.
  }
}

// Read, save or forget the ID of the trainee signed in now.
function loadCurrentId() {
  try {
    return localStorage.getItem(CURRENT_ID_KEY);
  } catch (error) {
    return null;
  }
}
function saveCurrentId(id) {
  try {
    localStorage.setItem(CURRENT_ID_KEY, id);
  } catch (error) {
    // Storage blocked: the trainee will see the login screen next time.
  }
}
function forgetCurrentId() {
  try {
    localStorage.removeItem(CURRENT_ID_KEY);
  } catch (error) {
    // Storage blocked: nothing was saved anyway.
  }
}

// Save the signed-in trainee. We load the full list first and replace only
// this trainee's entry, so other trainees on this device are kept.
function saveCurrentTrainee() {
  if (!currentTrainee) {
    return;
  }
  currentTrainee.lastActive = new Date().toISOString();
  const allTrainees = loadAllTrainees();
  allTrainees[currentTrainee.id] = currentTrainee;
  saveAllTrainees(allTrainees);
}

// Tidy a typed trainee ID so the same ID always matches: remove spaces and
// use capital letters (so " s1234 " and "S1234" are the same trainee).
function tidyTraineeId(text) {
  return text.replace(/\s+/g, "").toUpperCase();
}

// Sign a trainee in: find their saved record (or start a new one), remember
// them as the current trainee, and put back their completed modules.
function signIn(name, id) {
  const saved = loadAllTrainees()[id];

  // Start from the saved record if there is one. The "|| []" and "|| {}"
  // parts give an empty list or object if something is missing.
  currentTrainee = {
    id: id,
    name: name,
    completed: (saved && Array.isArray(saved.completed)) ? saved.completed : [],
    scores: (saved && saved.scores && typeof saved.scores === "object") ? saved.scores : {}
  };

  saveCurrentId(id);
  saveCurrentTrainee();
  restoreProgress();

  // Show "Jane Tan (S1234)" in the top bar. textContent (not innerHTML)
  // shows the name exactly as typed, safely.
  traineeBadgeName.textContent = name + " (" + id + ")";
  traineeBadge.hidden = false;
}

// Mark the trainee's saved modules as completed on the page, then refresh
// the module buttons and the progress bar so they show it.
function restoreProgress() {
  completedModules.clear();
  MODULES.forEach(function (module, index) {
    if (currentTrainee.completed.indexOf(module.title) !== -1) {
      completedModules.add(index);
    }
  });
  updateModuleButtons();
  updateProgress();
}

// Save a finished module (called from completeCurrentModule in section 7).
function recordModuleComplete(index) {
  if (!currentTrainee) {
    return;
  }
  const title = MODULES[index].title;
  if (currentTrainee.completed.indexOf(title) === -1) {
    currentTrainee.completed.push(title);
  }
  saveCurrentTrainee();
}

// Show a message under the login boxes and put the cursor in the box that
// needs fixing.
function showLoginError(message, input) {
  loginError.textContent = message;
  loginError.hidden = false;
  input.focus();
}

// Runs when Begin Training is clicked (or Enter is pressed in a box).
function handleLoginSubmit(event) {
  // A form normally reloads the page when submitted; this stops that.
  event.preventDefault();

  // trim() removes spaces from the start and end.
  const name = nameInput.value.trim();
  const id = tidyTraineeId(idInput.value);

  // Check both boxes before going any further.
  if (name === "") {
    showLoginError("Please enter your full name.", nameInput);
    return;
  }
  if (id === "") {
    showLoginError("Please enter your trainee ID number.", idInput);
    return;
  }
  // /^[A-Z0-9-]+$/ is a "regular expression": it only matches text made of
  // capital letters, digits and hyphens (the ID is already in capitals).
  if (!/^[A-Z0-9-]+$/.test(id)) {
    showLoginError("Your trainee ID can only use letters, numbers and hyphens.", idInput);
    return;
  }

  loginError.hidden = true;
  signIn(name, id);

  // Move on to the existing welcome screen.
  loginScreen.hidden = true;
  welcomeScreen.hidden = false;
  startButton.focus();
}

// "Not you? Switch trainee": forget who is signed in (their saved progress
// is kept) and reload the page, which starts again at the login screen.
function switchTrainee() {
  forgetCurrentId();
  location.reload();
}

// Runs once when the page loads: decide which screen to show first.
function showFirstScreen() {
  const savedId = loadCurrentId();
  const saved = savedId ? loadAllTrainees()[savedId] : null;

  if (saved && typeof saved.name === "string") {
    // A returning trainee: skip the login screen, put back their progress
    // and go straight to the learning area.
    signIn(saved.name, savedId);
    loginScreen.hidden = true;
    startLearning();
  } else {
    // Nobody signed in yet: the login screen is already showing, so just
    // put the cursor in the first box.
    nameInput.focus();
  }
}


/* ===========================================================================
   16. SCORE SAVING AFTER EACH PARTS CHECK (new)

   When a Parts Check is finished, finishCheck (section 11) calls these two
   functions:
     saveQuizScore     works out the score as a percentage and saves it under
                       the trainee's ID, linked to the module's title. Only
                       the HIGHEST score for each module is kept.
     showScoreMessage  shows the score with a green message (80% or more) or
                       an amber one (below 80%). The existing "Try the Check
                       Again" button lets the trainee retake the check.
   =========================================================================== */

// The pass mark, as a percentage. dashboard.js uses the same number.
const PASS_MARK = 80;

// Work out and save the score. Returns an object describing the result,
// for showScoreMessage to display.
function saveQuizScore(moduleIndex, correct, total) {
  // e.g. 9 right out of 11 = 81.8..., which rounds to 82.
  const percent = Math.round((correct / total) * 100);
  let best = percent;

  if (currentTrainee) {
    const title = MODULES[moduleIndex].title;
    const previous = currentTrainee.scores[title];

    // Keep the old score if it was higher; otherwise save the new one.
    // (typeof ... === "number" checks there is an old score at all.)
    if (typeof previous === "number" && previous > percent) {
      best = previous;
    } else {
      currentTrainee.scores[title] = percent;
      saveCurrentTrainee();
    }
  }

  return { percent: percent, best: best, correct: correct, total: total };
}

// Fill in the score box under the Parts Check and show it.
//   box           the score box (data-role="score-message")
//   result        the object returned by saveQuizScore
//   isLastModule  true for the last module, which has no "next module"
function showScoreMessage(box, result, isLastModule) {
  const passed = result.percent >= PASS_MARK;

  // The CSS class picks the colour: "is-pass" is green, "is-review" amber.
  box.className = "score-message " + (passed ? "is-pass" : "is-review");
  box.textContent = "";   // remove the previous message

  // First line: the main message, in bold.
  const headline = document.createElement("strong");
  if (passed) {
    headline.textContent = isLastModule
      ? "Well done, you have passed the final module."
      : "Well done, you may proceed to the next module.";
  } else {
    headline.textContent = "Please review the material and try again.";
  }

  // Second line: the score itself and the trainee's best so far.
  const details = document.createElement("span");
  details.textContent =
    "Your score: " + result.percent + "% (" + result.correct + " of " +
    result.total + " parts right first time). Your highest score for this " +
    "module: " + result.best + "%.";

  box.appendChild(headline);
  box.appendChild(details);
  box.hidden = false;
}


/* ---------------------------------------------------------------------------
   17. CONNECT EVERYTHING (runs once when the page loads)
   "addEventListener" means: when this event happens, run this function.
   --------------------------------------------------------------------------- */
startButton.addEventListener("click", startLearning);
completeButton.addEventListener("click", completeCurrentModule);

buildModuleButtons();   // create the three module buttons
updateModuleButtons();  // show every module as "Not started"
updateProgress();       // show 0% in the progress bar and footer

// New: the login form, the "Switch trainee" button, and choosing the first
// screen (login for a new trainee, or the learning area for a returning one).
loginForm.addEventListener("submit", handleLoginSubmit);
switchTraineeButton.addEventListener("click", switchTrainee);
showFirstScreen();
