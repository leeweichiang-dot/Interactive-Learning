/* ===========================================================================
   AIRCRAFT FAMILIARISATION TRAINING: app.js

   This file controls how the page BEHAVES:
     - switching from the welcome screen to the learning area
     - building the module buttons and locking/unlocking them
     - showing each module's content and updating the learning panel
     - running the diagram activities for Modules 1 and 2 (sections 11-13)
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
                  inside the main content area (Modules 1 and 2 have one)
     placeholder  text shown in the main content area until an activity
                  is built (Module 3, for now)
   --------------------------------------------------------------------------- */
const MODULES = [
  {
    title: "Aircraft Parts",
    explanation:
      "An aircraft is made of a few main parts. The long body in the middle is " +
      "the fuselage. The wings stick out from each side. The engines push the " +
      "aircraft forward, and the tail at the back keeps it steady. Hinged " +
      "panels called control surfaces move to steer the aircraft.",
    // buildAircraftPartsActivity is written further down this file (section 12).
    // JavaScript lets you refer to a function before the line that defines it.
    activity: buildAircraftPartsActivity
  },
  {
    title: "Fuselage and Wing Structure",
    explanation:
      "The fuselage and wings are not solid. Inside each is a light " +
      "\"skeleton\": frames and stringers in the fuselage, spars and ribs in " +
      "the wing. A thin skin is fixed over the skeleton and shares the load " +
      "with it. This way of building is called semi-monocoque construction.",
    // buildStructureActivity is in section 13.
    activity: buildStructureActivity
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
   11. SHARED DIAGRAM ACTIVITY (used by Modules 1 and 2)

   Modules 1 and 2 work the same way, so they share this code. Only their
   pictures and their list of parts are different. The trainee works
   through two steps:
     Step 1, Explore:     click each part on the pictures to read what it is.
                          Every part must be explored before moving on.
     Step 2, Parts Check: the app names a part ("Find the ribs") and the
                          trainee clicks it on a picture. A wrong click gives
                          a hint; a right click gives an encouraging message.
   Finishing the check completes the module, which unlocks the next one.

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
     moduleIndex          which module this is (0 = Module 1, 1 = Module 2)
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
    questions = shuffled(parts);

    stepLabel.textContent = "Step 2 of 2: Parts Check";
    instructions.textContent = config.checkInstructions;
    chipList.hidden = true;    // hide the names, or the check would be too easy
    feedback.hidden = true;
    startCheckBtn.hidden = true;
    exploreBtn.hidden = true;
    retryBtn.hidden = true;
    nextModuleBtn.hidden = true;

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

    // Complete the module the first time; afterwards this is just revision.
    // (completedCount equals this module's index until the module is done.)
    if (completedCount === config.moduleIndex) {
      completeCurrentModule();   // unlocks the next module and shows "Well done!"
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
                  surfaces (the hinged parts that move to steer)
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
      "The fuselage is the main body of the aircraft: a long tube that carries " +
      "the crew, passengers and cargo. All the other main parts are attached " +
      "to it. It is built from ring-shaped frames and long strips called " +
      "stringers, covered by a thin skin.",
    short: "the main body that carries people and cargo.",
    hint: "Look for the long main body that runs from front to back."
  },
  {
    id: "cockpit",
    group: "main",
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
    group: "main",
    name: "Wing",
    explanation:
      "The wings stick out from each side of the fuselage. As the aircraft " +
      "moves forward, air flowing over the wings creates lift: the upward " +
      "force that holds the aircraft in the air. Most airliners also carry " +
      "their fuel inside the wings. Hinged panels on the back edge, the " +
      "flaps and ailerons, help control the aircraft. You will look inside a " +
      "wing in Module 2.",
    short: "it creates the lift that holds the aircraft up.",
    hint: "Look for the large surface that sticks out from the side of the body."
  },
  {
    id: "engine",
    group: "main",
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
    group: "main",
    name: "Horizontal stabiliser",
    explanation:
      "The horizontal stabilisers are the two small flat wings at the tail. " +
      "They stop the nose bobbing up and down, keeping the aircraft steady. " +
      "The hinged panels on their back edge are the elevators.",
    short: "it stops the nose bobbing up and down.",
    hint: "Look at the very back for a small, flat, wing-like surface."
  },
  {
    id: "vertical-stabiliser",
    group: "main",
    name: "Vertical stabiliser (fin)",
    explanation:
      "The vertical stabiliser, usually called the fin, is the tall upright " +
      "surface at the tail. It stops the aircraft swinging from side to side, " +
      "like the feathers on an arrow. The hinged panel on its back edge is " +
      "the rudder.",
    short: "it stops the aircraft swinging from side to side.",
    hint: "Look at the back for the tall surface that points straight up."
  },
  {
    id: "landing-gear",
    group: "main",
    name: "Landing gear",
    explanation:
      "The landing gear is the set of wheels, legs and shock absorbers the " +
      "aircraft stands on. It supports the aircraft on the ground and absorbs " +
      "the bump of landing. After take-off it folds up into the aircraft.",
    short: "the wheels and legs the aircraft stands and lands on.",
    hint: "Look underneath the aircraft for the wheels."
  },

  // ----- Control surfaces: hinged panels the pilot moves to steer -----
  {
    id: "flaps",
    group: "control",
    name: "Flaps",
    explanation:
      "Flaps are hinged panels on the back edge of each wing, close to the " +
      "body. For take-off and landing they slide back and down. This makes " +
      "the wing bigger and more curved, so it gives more lift at low speed " +
      "and the aircraft can fly slowly without dropping.",
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
    id: "elevators",
    group: "control",
    name: "Elevators",
    explanation:
      "The elevators are hinged panels on the back edge of the horizontal " +
      "stabilisers. When they move up, the nose points up; when they move " +
      "down, the nose points down. This up-and-down movement is called pitch.",
    short: "they point the nose up or down (pitch).",
    hint: "In the top view, look along the back edge of the small wings at the tail."
  },
  {
    id: "rudder",
    group: "control",
    name: "Rudder",
    explanation:
      "The rudder is the hinged panel on the back edge of the fin. Moving it " +
      "left or right swings the nose left or right, like the rudder on a " +
      "boat. This side-to-side movement is called yaw.",
    short: "it swings the nose left or right (yaw).",
    hint: "In the side view, look along the back edge of the tall fin."
  }
];

const AIRCRAFT_PART_GROUPS = [
  { id: "main", title: "Main parts" },
  { id: "control", title: "Control surfaces (hinged panels that move)", swatch: true }
];

function buildAircraftPartsActivity(container) {
  buildDiagramActivity(container, {
    moduleIndex: 0,
    diagramsTemplateId: "aircraft-parts-diagrams",
    parts: AIRCRAFT_PARTS,
    groups: AIRCRAFT_PART_GROUPS,
    exploreInstructions:
      "Click or tap each part of the aircraft to find out what it is and what " +
      "it does. You can use either the side view or the top view, or the name " +
      "buttons under the pictures. Parts you have explored turn green.",
    checkInstructions:
      "Find each part on either picture. If you pick the wrong one, you will " +
      "get a hint. Nothing is saved.",
    checkExplanation:
      "Use what you learned in Step 1. Find each part on the side view or the top view.",
    summary:
      "You can now name the seven main parts of an aircraft (fuselage, " +
      "cockpit, wings, engines, horizontal stabiliser, vertical stabiliser " +
      "and landing gear) and its four main control surfaces (flaps, " +
      "ailerons, elevators and rudder)."
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
      "Frames are ring-shaped hoops spaced along the fuselage, a bit like the " +
      "ribs in your chest. They give the fuselage its round shape and stop it " +
      "being squashed. Doors and windows are cut out between them.",
    short: "ring-shaped hoops that give the fuselage its shape.",
    hint: "Look for the ring shapes that go round the body: upright strips in the side view, the inner ring in the cross-section."
  },
  {
    id: "stringers",
    group: "fuselage",
    name: "Stringers",
    explanation:
      "Stringers are long, thin strips that run from the front of the " +
      "fuselage to the back. They join the frames together and stiffen the " +
      "skin so it does not buckle (crumple) under load.",
    short: "long strips running front to back that stiffen the skin.",
    hint: "Look for long thin strips running front to back: lines along the side view, small dots in the cross-section."
  },
  {
    id: "fuselage-skin",
    group: "fuselage",
    name: "Fuselage skin",
    explanation:
      "The skin is the thin outer covering, usually aluminium alloy or a " +
      "composite material. It is riveted or bonded to the frames and " +
      "stringers. It is not just a cover: it carries a large share of the " +
      "load and holds in the cabin air pressure.",
    short: "the thin outer covering that also carries load.",
    hint: "Look for the smooth outer covering of the body."
  },
  {
    id: "floor-beams",
    group: "fuselage",
    name: "Floor beams",
    explanation:
      "Floor beams run across the fuselage from side to side, fixed to the " +
      "frames. They hold up the cabin floor and everything on it: seats, " +
      "passengers and galleys. The space underneath is the cargo hold.",
    short: "beams across the body that hold up the cabin floor.",
    hint: "In the cross-section, look for the beam across the inside, between the cabin and the cargo hold."
  },
  {
    id: "pressure-bulkhead",
    group: "fuselage",
    name: "Pressure bulkhead",
    explanation:
      "The rear pressure bulkhead is a strong, dome-shaped wall at the back " +
      "of the cabin. When flying high, air is pumped into the cabin so people " +
      "can breathe normally. The bulkhead seals the back end so that air " +
      "stays in.",
    short: "the dome-shaped wall that keeps the cabin air in.",
    hint: "In the side view, look for the dome-shaped wall at the back end."
  },

  // ----- Wing structure -----
  {
    id: "front-spar",
    group: "wing",
    name: "Front spar",
    explanation:
      "Spars are the main beams of the wing. They run from the root (where " +
      "the wing joins the fuselage) out to the tip. The front spar is near " +
      "the leading (front) edge. The spars carry most of the bending load as " +
      "the wing lifts the aircraft.",
    short: "the main beam near the front edge of the wing.",
    hint: "Look for the long beam running along the wing, near its front edge."
  },
  {
    id: "rear-spar",
    group: "wing",
    name: "Rear spar",
    explanation:
      "The rear spar is the second main beam, nearer the trailing (back) edge " +
      "of the wing. The flaps and ailerons are hinged behind it. Together, " +
      "the two spars and the skin form a strong box that often holds the " +
      "aircraft's fuel.",
    short: "the second main beam, nearer the back edge of the wing.",
    hint: "Look for the long beam running along the wing, nearer its back edge."
  },
  {
    id: "ribs",
    group: "wing",
    name: "Ribs",
    explanation:
      "Ribs run from the front of the wing to the back, spaced along its " +
      "length. Each rib is cut to the wing's curved shape (called an " +
      "aerofoil), so the ribs hold the skin in the right shape. Holes are " +
      "cut in them to save weight.",
    short: "wing-shaped pieces that hold the skin in shape.",
    hint: "Look for the cross-pieces running from the front edge to the back edge, or the curved shape in the cross-section."
  },
  {
    id: "wing-skin",
    group: "wing",
    name: "Wing skin",
    explanation:
      "The wing skin covers the top and bottom of the wing. Like the fuselage " +
      "skin, it carries load: as the wing bends upward in flight, the top " +
      "skin is squeezed and the bottom skin is stretched.",
    short: "the outer covering of the wing, which also carries load.",
    hint: "Look for the smooth covering near the wing root, or the thick outline around the cross-section."
  },

  // ----- Wing control surfaces: hinged panels on the back edge -----
  {
    id: "flaps",
    group: "wing-control",
    name: "Flaps",
    explanation:
      "Flaps are hinged panels along the back edge of the wing, on the inner " +
      "part near the root. Each flap is built like a small wing, with its own " +
      "spar, ribs and skin. It is attached behind the rear spar on hinges or " +
      "tracks, so it can slide back and down for take-off and landing to " +
      "give extra lift at low speed.",
    short: "hinged panels on the inner back edge, attached behind the rear spar.",
    hint: "Look along the back edge of the wing, on the inner part near the root, or behind the main wing in the cross-section."
  },
  {
    id: "ailerons",
    group: "wing-control",
    name: "Ailerons",
    explanation:
      "Ailerons are hinged panels along the back edge of the wing, on the " +
      "outer part near the tip. Like flaps, they have their own small spar, " +
      "ribs and skin, and they are hinged to brackets behind the rear spar. " +
      "They move up and down, one wing's aileron up while the other's goes " +
      "down, to roll the aircraft into a turn.",
    short: "hinged panels on the outer back edge that roll the aircraft.",
    hint: "Look along the back edge of the wing, on the outer part near the tip."
  }
];

const STRUCTURE_PART_GROUPS = [
  { id: "fuselage", title: "Fuselage structure" },
  { id: "wing", title: "Wing structure" },
  { id: "wing-control", title: "Wing control surfaces (hinged panels)", swatch: true }
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
      "will get a hint. Nothing is saved.",
    checkExplanation:
      "Use what you learned in Step 1. Find each part of the fuselage and " +
      "wing structure on the pictures.",
    summary:
      "You can now name the parts that make up the fuselage (frames, " +
      "stringers, skin, floor beams and pressure bulkhead) and the wing " +
      "(front and rear spars, ribs and skin, with the flaps and ailerons " +
      "hinged behind the rear spar). Together they form a strong, light " +
      "skeleton with a skin that shares the load."
  });
}


/* ---------------------------------------------------------------------------
   14. CONNECT EVERYTHING (runs once when the page loads)
   "addEventListener" means: when this event happens, run this function.
   --------------------------------------------------------------------------- */
startButton.addEventListener("click", startLearning);
completeButton.addEventListener("click", completeCurrentModule);

buildModuleButtons();   // create the three module buttons
updateModuleButtons();  // lock Modules 2 and 3 at the start
updateProgress();       // show 0% in the progress bar and footer
