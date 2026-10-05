/* ===========================================================================
   AIRCRAFT FAMILIARISATION TRAINING: app.js

   This file controls how the page BEHAVES:
     - switching from the welcome screen to the learning area
     - building the module buttons and locking/unlocking them
     - showing each module's content and updating the learning panel
     - running the Module 1 activity (Aircraft Parts, section 11)
     - updating the progress bar and footer

   Nothing is saved. All progress lives in memory, so reloading the page
   starts again from the beginning. (This portal never stores trainee data.)
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
                  inside the main content area (Module 1 has one)
     placeholder  text shown in the main content area until an activity
                  is built (Modules 2 and 3, for now)
   --------------------------------------------------------------------------- */
const MODULES = [
  {
    title: "Aircraft Parts",
    explanation:
      "An aircraft is made of a few main parts. The long body in the middle is " +
      "the fuselage. The wings stick out from each side. The engines push the " +
      "aircraft forward, and the tail at the back keeps it steady.",
    // buildAircraftPartsActivity is written further down this file (section 11).
    // JavaScript lets you refer to a function before the line that defines it.
    activity: buildAircraftPartsActivity
  },
  {
    title: "Wing Structure",
    placeholder: "Wing Structure learning activity will load here.",
    explanation:
      "A wing is not solid. Inside, long beams called spars run from the body " +
      "to the wing tip, and ribs shaped like the wing cross them. A thin metal " +
      "skin covers this frame, a bit like fabric stretched over a tent."
  },
  {
    title: "Engine and Tail",
    placeholder: "Engine and Tail learning activity will load here.",
    explanation:
      "The engine creates the push (thrust) that moves the aircraft forward. " +
      "The tail has an upright fin and two small horizontal wings. Together " +
      "they stop the aircraft swinging side to side or pitching up and down."
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

// How many modules have been completed. Because modules must be done in
// order, this number also tells us which modules are unlocked:
// a module is unlocked if its index is less than or equal to completedCount.
let completedCount = 0;


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
   5. UPDATE THE MODULE BUTTONS (locked / unlocked / active / complete)
   Called whenever something changes, so the buttons always match the state.
   --------------------------------------------------------------------------- */
function updateModuleButtons() {
  // querySelectorAll finds every element matching a CSS selector.
  const buttons = moduleList.querySelectorAll(".module-button");

  buttons.forEach(function (button, index) {
    const isComplete = index < completedCount;
    const isUnlocked = index <= completedCount;
    const isActive   = index === currentIndex;

    // A disabled button can't be clicked; this is how we "lock" a module.
    button.disabled = !isUnlocked;

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
    } else if (isUnlocked) {
      status.textContent = "Available";
    } else {
      status.textContent = "🔒 Locked: complete Module " + index + " first"; // padlock
    }
  });
}


/* ---------------------------------------------------------------------------
   6. OPEN A MODULE
   Runs when the trainee clicks an unlocked module button.
   --------------------------------------------------------------------------- */
function openModule(index) {
  // Safety check: ignore clicks on locked modules.
  if (index > completedCount) {
    return;
  }

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
  completeButton.hidden = Boolean(module.activity) || index < completedCount;

  // Learning panel: topic name, explanation and the "get ready" message.
  showPanelTopic(module.title, module.explanation);
  showPanelMessage(index < completedCount
    ? "You have already completed this module. Feel free to review it."
    : GET_READY_MESSAGE);

  // Refresh everything else that depends on the state.
  updateModuleButtons();
  updateProgress();
}


/* ---------------------------------------------------------------------------
   7. COMPLETE THE CURRENT MODULE
   Runs when the trainee clicks "Mark Module as Complete".
   --------------------------------------------------------------------------- */
function completeCurrentModule() {
  // Only the next module in order can be completed.
  if (currentIndex !== completedCount) {
    return;
  }

  completedCount = completedCount + 1;
  completeButton.hidden = true;

  // Pick an encouraging message depending on whether there is more to do.
  if (completedCount < MODULES.length) {
    const nextTitle = MODULES[completedCount].title;
    showPanelMessage(
      "Well done! You have completed " + MODULES[currentIndex].title +
      ". Module " + (completedCount + 1) + ": " + nextTitle + " is now unlocked."
    );
  } else {
    showPanelMessage(
      "Excellent work! You have completed all " + MODULES.length +
      " modules of Aircraft Familiarisation Training."
    );
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
  const percent = Math.round((completedCount / MODULES.length) * 100);

  // Progress bar: set the fill width and the number beside it.
  progressFill.style.width = percent + "%";
  progressPercent.textContent = percent + "%";
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
   11. MODULE 1 ACTIVITY: AIRCRAFT PARTS

   The trainee works through two steps:
     Step 1, Explore:     click each part of the aircraft diagram to read what
                          it is. Every part must be explored before moving on.
     Step 2, Parts check: the app names a part ("Find the engine") and the
                          trainee clicks it on the diagram. A wrong click gives
                          a hint; a right click gives an encouraging message.
   Finishing the check completes Module 1, which unlocks Module 2.

   The diagram's HTML is the <template id="aircraft-parts-template"> in
   index.html. Its colours and highlights are in section 10 of style.css.
   =========================================================================== */

/* ---------------------------------------------------------------------------
   11a. PART DATA
   One object per part. The id must match a data-part="..." in index.html.
     name         shown in the learning panel and on the name buttons
     explanation  what the part is and does, in plain English
     short        a one-line reminder, used in the "Correct!" message
     hint         a clue shown when the trainee clicks the wrong part
   --------------------------------------------------------------------------- */
const AIRCRAFT_PARTS = [
  {
    id: "fuselage",
    name: "Fuselage",
    explanation:
      "The fuselage is the main body of the aircraft: a long tube that carries " +
      "the crew, passengers and cargo. All the other main parts are attached " +
      "to it. It is built from ring-shaped frames and long strips called " +
      "stringers, covered by a thin skin.",
    short: "the main body that carries people and cargo.",
    hint: "Look for the long main body that runs from front to back."
  },
  {
    id: "cockpit",
    name: "Cockpit",
    explanation:
      "The cockpit, also called the flight deck, is at the very front of the " +
      "aircraft. This is where the pilots sit and control the aircraft. The " +
      "rounded tip in front of it, called the nose, covers the weather radar.",
    short: "where the pilots sit and fly the aircraft.",
    hint: "Look right at the front, where the pilots look out of the windscreen."
  },
  {
    id: "wing",
    name: "Wing",
    explanation:
      "The wings stick out from each side of the fuselage. As the aircraft " +
      "moves forward, air flowing over the wings creates lift: the upward " +
      "force that holds the aircraft in the air. Most airliners also carry " +
      "their fuel inside the wings. You will look inside a wing in Module 2.",
    short: "it creates the lift that holds the aircraft up.",
    hint: "Look for the large surface that sticks out from the side of the body."
  },
  {
    id: "engine",
    name: "Engine",
    explanation:
      "The engines push the aircraft forward. This push is called thrust. On " +
      "most airliners each engine hangs under a wing, held by a strong mount " +
      "called a pylon.",
    short: "it pushes the aircraft forward (thrust).",
    hint: "Look for the round pod hanging underneath the wing."
  },
  {
    id: "horizontal-stabiliser",
    name: "Horizontal stabiliser",
    explanation:
      "The horizontal stabilisers are the two small flat wings at the tail. " +
      "They stop the nose bobbing up and down, keeping the aircraft steady. " +
      "A hinged part on them, the elevator, lets the pilot point the nose up " +
      "or down. You will meet it in Module 3.",
    short: "it stops the nose bobbing up and down.",
    hint: "Look at the very back for a small, flat, wing-like surface."
  },
  {
    id: "vertical-stabiliser",
    name: "Vertical stabiliser (fin)",
    explanation:
      "The vertical stabiliser, usually called the fin, is the tall upright " +
      "surface at the tail. It stops the aircraft swinging from side to side, " +
      "like the feathers on an arrow. A hinged part on it, the rudder, lets " +
      "the pilot turn the nose left or right.",
    short: "it stops the aircraft swinging from side to side.",
    hint: "Look at the back for the tall surface that points straight up."
  },
  {
    id: "landing-gear",
    name: "Landing gear",
    explanation:
      "The landing gear is the set of wheels, legs and shock absorbers the " +
      "aircraft stands on. It supports the aircraft on the ground and absorbs " +
      "the bump of landing. After take-off it folds up into the aircraft.",
    short: "the wheels and legs the aircraft stands and lands on.",
    hint: "Look underneath the aircraft for the wheels."
  }
];


/* ---------------------------------------------------------------------------
   11b. SMALL HELPERS
   --------------------------------------------------------------------------- */

// Find a part's data object from its id, e.g. findPart("wing").
function findPart(id) {
  return AIRCRAFT_PARTS.find(function (part) { return part.id === id; });
}

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
   11c. BUILD THE ACTIVITY
   openModule() calls this with the main content area as "container".
   Everything the activity needs lives inside this one function, so its
   variables are fresh each time Module 1 is opened.
   --------------------------------------------------------------------------- */
function buildAircraftPartsActivity(container) {

  // --- Copy the template from index.html into the content area ---
  const template = document.getElementById("aircraft-parts-template");
  container.appendChild(template.content.cloneNode(true));

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
  const partShapes    = container.querySelectorAll(".part");

  // --- Activity state ---
  let mode = "explore";        // "explore", "check" or "finished"
  let selectedId = null;       // part selected in explore mode
  const explored = new Set();  // a Set is a list that ignores duplicates
  let questions = [];          // shuffled parts still to ask about
  let currentQuestion = null;  // the part the trainee is asked to find
  const found = new Set();     // parts found so far in this check
  let firstTryCorrect = 0;     // answers right without a wrong click first
  let missedThisQuestion = false;


  // --- Build one name button ("chip") per part ---
  AIRCRAFT_PARTS.forEach(function (part) {
    const item = document.createElement("li");
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "part-chip";
    chip.dataset.part = part.id;
    chip.textContent = part.name;
    chip.addEventListener("click", function () { handlePartChosen(part.id); });
    item.appendChild(chip);
    chipList.appendChild(item);
  });


  // --- Clicking or pressing a part on the diagram ---
  partShapes.forEach(function (shape) {
    shape.addEventListener("click", function () {
      handlePartChosen(shape.dataset.part);
    });
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
    instructions.textContent =
      "Click or tap each part of the aircraft to find out what it is and what " +
      "it does. You can also use the name buttons under the picture. Parts " +
      "you have explored turn green.";
    prompt.hidden = true;
    feedback.hidden = true;
    chipList.hidden = false;
    startCheckBtn.hidden = true;
    exploreBtn.hidden = true;
    retryBtn.hidden = true;
    nextModuleBtn.hidden = true;

    refresh();
  }

  function explorePart(id) {
    const part = findPart(id);
    selectedId = id;
    explored.add(id);

    // Show the part in the learning panel.
    showPanelTopic(part.name, part.explanation);

    if (explored.size < AIRCRAFT_PARTS.length) {
      showPanelMessage(
        "Good. You have explored " + explored.size + " of " +
        AIRCRAFT_PARTS.length + " parts."
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
    questions = shuffled(AIRCRAFT_PARTS);

    stepLabel.textContent = "Step 2 of 2: Parts Check";
    instructions.textContent =
      "Find each part on the picture. If you pick the wrong one, you will get " +
      "a hint. Nothing is saved.";
    chipList.hidden = true;    // hide the names, or the check would be too easy
    feedback.hidden = true;
    startCheckBtn.hidden = true;
    exploreBtn.hidden = true;
    retryBtn.hidden = true;
    nextModuleBtn.hidden = true;

    showPanelTopic(
      "Parts Check",
      "Use what you learned in Step 1. Find each part on the picture of the aircraft."
    );
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
      feedback.hidden = false;
      feedback.className = "activity-feedback is-correct";
      feedback.textContent = "Correct! That is the " + currentQuestion.name.toLowerCase() + ".";
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
      "You found all " + AIRCRAFT_PARTS.length + " parts of the aircraft. " +
      firstTryCorrect + " of " + AIRCRAFT_PARTS.length +
      " were right first time.";
    feedback.hidden = true;
    exploreBtn.hidden = false;
    retryBtn.hidden = false;

    showPanelTopic(
      "Aircraft Parts",
      "You can now name the seven main parts of an aircraft: fuselage, cockpit, " +
      "wings, engines, horizontal stabiliser, vertical stabiliser (fin) and " +
      "landing gear."
    );

    // Complete Module 1 the first time; afterwards this is just revision.
    // (Index 0 is Module 1, so it is complete once completedCount > 0.)
    if (completedCount === 0) {
      completeCurrentModule();   // unlocks Module 2 and shows "Well done!"
    } else {
      showPanelMessage("Great revision! You found every part again.");
    }
    nextModuleBtn.hidden = false;

    refresh();
    nextModuleBtn.focus();
  }


  /* ---------------- KEEP THE DIAGRAM UP TO DATE ---------------- */

  // Recolour the parts and name buttons, and update the count text, to
  // match the current state. Called after every change.
  function refresh() {
    partShapes.forEach(function (shape, index) {
      const id = shape.dataset.part;
      const isDone = mode === "explore" ? explored.has(id) : found.has(id);
      shape.classList.toggle("is-done", isDone);
      shape.classList.toggle("is-selected", mode === "explore" && id === selectedId);

      // Screen readers read this label. In the check it says "Part 3"
      // instead of the real name, so it doesn't give the answer away.
      const label = mode === "explore" ? findPart(id).name : "Part " + (index + 1);
      shape.setAttribute("aria-label", label + (isDone ? " (done)" : ""));
    });

    chipList.querySelectorAll(".part-chip").forEach(function (chip) {
      const id = chip.dataset.part;
      chip.classList.toggle("is-done", explored.has(id));
      chip.setAttribute("aria-pressed", id === selectedId ? "true" : "false");
      chip.textContent = (explored.has(id) ? "✓ " : "") + findPart(id).name;
    });

    if (mode === "explore") {
      countText.textContent = explored.size + " of " + AIRCRAFT_PARTS.length + " parts explored";
    } else if (mode === "check") {
      countText.textContent = "Question " + (found.size + 1) + " of " + AIRCRAFT_PARTS.length;
    } else {
      countText.textContent = "";
    }
  }


  /* ---------------- BUTTONS ---------------- */
  startCheckBtn.addEventListener("click", startCheck);
  retryBtn.addEventListener("click", startCheck);
  exploreBtn.addEventListener("click", function () {
    startExplore();
    showPanelTopic(MODULES[0].title, MODULES[0].explanation);
    hidePanelMessage();
  });
  nextModuleBtn.addEventListener("click", function () { openModule(1); });

  // Begin with Step 1.
  startExplore();
}


/* ---------------------------------------------------------------------------
   12. CONNECT EVERYTHING (runs once when the page loads)
   "addEventListener" means: when this event happens, run this function.
   --------------------------------------------------------------------------- */
startButton.addEventListener("click", startLearning);
completeButton.addEventListener("click", completeCurrentModule);

buildModuleButtons();   // create the three module buttons
updateModuleButtons();  // lock Modules 2 and 3 at the start
updateProgress();       // show 0% in the progress bar and footer
