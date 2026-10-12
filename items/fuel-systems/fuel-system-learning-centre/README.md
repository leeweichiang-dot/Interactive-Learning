# Aircraft Fuel System Learning Centre

A beginner course on aircraft fuel systems for non-aviation and defence aviation maintenance trainees.
It uses plain English, diagrams, animations and short activities. No aircraft experience is needed.

**Learning goal:** understand the purpose, operation and maintenance importance of an aircraft fuel system.

It is one item in the Interactive Learning portal (module **Aircraft Fuel Systems**). It is plain HTML, CSS and
JavaScript: no frameworks, no build step, no network requests. It works by opening `index.html` from disk or from
any static web server, including GitHub Pages.

## Run it

- **Through the portal:** open the repository's `index.html`, sign in, then choose *Aircraft Fuel Systems*.
- **Directly:** open `items/fuel-systems/fuel-system-learning-centre/index.html`.
- **Local web server (optional):** run `python3 -m http.server` in the repository root and open
  `http://localhost:8000/`.

## What is in it

The course is one page, `index.html`, with eleven sections switched by the URL hash (`#overview`, `#explorer`, ...).
Every section is linked from the menu and from the Previous / Next buttons at the bottom of each page.

| # | Section | What the trainee does |
|---|---------|-----------------------|
| 1 | **Home** (`#home`) | Reads the plain-English introduction, sees overall progress, follows the 8-module roadmap. |
| 2 | **Overview** (`#overview`) | Learns the five jobs of a fuel system (store, supply, transfer, vent, measure) and key words. Explores a numbered diagram of a typical twin-engine fuel system (16 parts): tap a part for what it does and what maintenance checks, filter by job, and animate fuel flow in flight or while refuelling. |
| 3 | **Fuel Flow Explorer** (`#explorer`) | Watches fuel move Tank → Pump → Filter → Fuel Control Unit → Engine. Start, Stop and Step-by-step modes. Hover or tap a part for Purpose, Location, Common faults and Maintenance. |
| 4 | **Components** (`#components`) | Eight click-to-reveal cards (tanks, boost pumps, engine driven pumps, filters, shutoff valves, quantity sensors, gauges, vent system). Each has Function, Location, Importance, Failure symptoms, Maintenance concern, an image placeholder and a knowledge check. |
| 5 | **Fuel Quantity Indication** (`#quantity`) | Moves a 0–100% slider and sees the tank, the cockpit dial, digital readout, bar and LOW FUEL / FUEL CRITICAL lights change. Can switch on a "stuck reading" fault. |
| 6 | **Fuel Transfer** (`#transfer`) | Left, Centre and Right tanks with an animated transfer pipe. Transfers fuel, balances the wings, flies to build an imbalance, and sees the aircraft tilt. |
| 7 | **Refuelling and Defuelling** (`#refuel`) | Puts the refuelling steps in order while a tank fills. Reads the defuelling steps. |
| 8 | **Fuel System Safety** (`#hazards`) | Six hazards (contamination, water, leaks, static electricity, fire risk, FOD) with Cause, Impact, Warning signs and Prevention, then six scenarios with feedback after every choice. |
| 9 | **Troubleshooting Simulator** (`#simulator`) | Five faults, each in four steps (observe, inspect, identify the cause, select the fix), with instructor-style feedback, points, stars, ranks and badges. |
| 10 | **Assessment** (`#quiz`) | 20 questions: multiple choice, drag and drop, matching and fuel-flow sequencing. Easy, Medium and Hard. Instant feedback and explanations. **Pass mark 80%.** |
| 11 | **My Progress** (`#dashboard`) | Lessons completed, assessment scores, time spent, simulator attempts, weak topics, a progress bar, a radar chart, recommendations and an optional leaderboard. |

## Files

```
fuel-system-learning-centre/
├── index.html        all eleven sections, header and menu
├── README.md         this file
├── css/
│   └── styles.css    theme (light and dark), layout, animations
└── js/               plain scripts, loaded in this order
    ├── store.js      saves progress in localStorage
    ├── overview.js   Overview diagram of a typical fuel system (the 16 part descriptions live here)
    ├── explorer.js   Fuel Flow Explorer (part descriptions live here)
    ├── lessons.js    components lesson, quantity simulator, transfer simulator, refuelling
    ├── safety.js     hazard cards and safety scenarios
    ├── simulator.js  troubleshooting scenarios, points, ranks and badges
    ├── quiz.js       the 20 assessment questions and the question types
    ├── dashboard.js  progress dashboard, radar chart, recommendations, leaderboard
    └── app.js        menu, routing, home page, progress and learning time
```

The scripts are classic scripts (not ES modules) so they run from `file://`.

## Changing the content

- **Assessment questions:** edit the `QUESTIONS` array in `js/quiz.js`. Four types: `mc`, `drag`, `match`, `seq`.
  Give each question a `topic` (reuse the existing names so the radar chart and weak topics stay correct) and keep
  each question's text unique and stable, because the portal scores questions by their text.
- **Pass mark:** `PASS` at the top of `js/quiz.js` (and the same number in `js/dashboard.js`).
- **Overview diagram:** the drawing is the `<svg id="ov-svg">` in `index.html` (each part has a `data-n` number and a `data-sys` job); the descriptions are `PARTS` in `js/overview.js`.
- **Explorer parts:** `PARTS` in `js/explorer.js`.
- **Component cards and their checks:** `COMPONENTS` in `js/lessons.js`.
- **Hazards and safety scenarios:** `HAZARDS` and `SCENARIOS` in `js/safety.js`.
- **Troubleshooting faults:** `SCENARIOS` in `js/simulator.js`.
- **Roadmap modules:** `ROADMAP` in `js/app.js`.
- **Images:** the component cards show an "Image placeholder". To use a real picture, create an `images/` folder here,
  add the file, and set that component's `image` field in `js/lessons.js`, for example `image: "images/fuel-tank.jpg"`.
  Use relative paths only.

## Saved data

Everything stays on the trainee's device. Nothing is sent anywhere.

- `fuel-centre-progress-v1` in `localStorage` (with `:<trainee ID>` added when someone is signed in to the portal):
  sections opened, component checks passed, assessment attempts and topic results, scenario best scores, attempt counts,
  badges and time spent per section.
- The item also reports to the portal's `tracker.js`: it calls `Tracker.complete()` once all nine learning sections
  have been visited, and `Tracker.quizResult()` for the assessment, the component checks, the safety scenarios and the
  troubleshooting scenarios. Trainees hand these in from `progress.html`, and instructors read them in
  `instructor.html`.
- If `tracker.js` fails to load, or `localStorage` is blocked, the course still works (progress is then kept only until
  the page is closed).
- The dashboard's optional leaderboard lists the other trainees who used the same browser and device. It is hidden until
  the trainee chooses to show it.

## Design and accessibility

- Light and dark themes follow the device setting (`prefers-color-scheme`).
- Checked with no horizontal scrolling from 320 px to 1440 px wide.
- Menus, cards, quizzes and simulators work with the keyboard. Warning lights also have text labels.
- Animations stop for visitors who have turned on "reduce motion".
- Charts have a text table for screen readers.

## Important notes

- This is teaching material. Tank sizes, pressures, warning levels and procedures are **simplified examples**, not data
  for a real aircraft. Trainees must always follow the approved technical manual and their supervisor.
- The troubleshooting and safety scenarios are generic and do not describe a specific aircraft type.

## Checking your changes

From the repository root, run `node tools/check-links.js`. It checks every page's links and files and the catalogue.
Then open the course in a browser and look at each section at phone width and laptop width.
