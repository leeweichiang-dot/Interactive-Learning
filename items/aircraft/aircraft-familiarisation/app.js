/* ===========================================================================
   AIRCRAFT FAMILIARISATION TRAINING: app.js

   This file controls how the page BEHAVES:
     - switching from the welcome screen to the learning area
     - building the module buttons and locking/unlocking them
     - showing each module's content and updating the learning panel
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
     placeholder  the text shown in the main content area (for now)
     explanation  a plain-English summary shown in the learning panel
   --------------------------------------------------------------------------- */
const MODULES = [
  {
    title: "Aircraft Parts",
    placeholder: "Aircraft Parts learning activity will load here.",
    explanation:
      "An aircraft is made of a few main parts. The long body in the middle is " +
      "the fuselage. The wings stick out from each side. The engines push the " +
      "aircraft forward, and the tail at the back keeps it steady."
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

  // Main content area: show the module title and its placeholder text.
  contentHeading.textContent = "Module " + (index + 1) + ": " + module.title;
  contentBody.innerHTML = '<p class="placeholder"></p>';
  // textContent (not innerHTML) is the safe way to insert plain text.
  contentBody.querySelector(".placeholder").textContent = module.placeholder;

  // Show the "Mark complete" button only if this module isn't done yet.
  completeButton.hidden = index < completedCount;

  // Learning panel: topic name, explanation and the "get ready" message.
  panelTopic.textContent = module.title;
  panelExplanation.textContent = module.explanation;
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
   8. SHOW A MESSAGE IN THE LEARNING PANEL
   A small helper so we don't repeat the same two lines everywhere.
   --------------------------------------------------------------------------- */
function showPanelMessage(text) {
  panelMessage.textContent = text;
  panelMessage.hidden = false;
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


/* ---------------------------------------------------------------------------
   11. CONNECT EVERYTHING (runs once when the page loads)
   "addEventListener" means: when this event happens, run this function.
   --------------------------------------------------------------------------- */
startButton.addEventListener("click", startLearning);
completeButton.addEventListener("click", completeCurrentModule);

buildModuleButtons();   // create the three module buttons
updateModuleButtons();  // lock Modules 2 and 3 at the start
updateProgress();       // show 0% in the progress bar and footer
