/*
 * The catalogue: the single list of modules and items the portal displays.
 *
 * This is a .js file (not JSON) so the portal still works when index.html is
 * opened straight from disk — browsers block fetching JSON over file://.
 *
 * Module fields:
 *   id           Short URL-safe name; also the folder name under items/.
 *   code         Module code shown on its card (optional).
 *   title        Module name.
 *   description  One or two sentences (optional).
 *
 * Item fields:
 *   id       Folder name: the item lives at items/<module>/<id>/index.html.
 *   module   The id of the module it belongs to.
 *   type     "tool", "lesson" or "quiz".
 *   title    Shown on its card.
 *   summary  One sentence shown on its card.
 *   hidden   Optional. true keeps it off the portal (a draft). Anyone with the
 *            direct link can still open it — this is not access control.
 *
 * Modules and items are shown in the order they appear below.
 */
window.CATALOGUE = {
  modules: [
    {
      id: "sample",
      code: "DEMO 101",
      title: "Sample Module",
      description: "Example items showing each kind of content. Copy one as the starting point for a new item."
    },
    {
      id: "flight",
      title: "Principles of Flight",
      description: "How lift, weight, thrust and drag work together, explained in plain English for maintenance trainees."
    }
  ],

  items: [
    {
      id: "base-converter",
      module: "sample",
      type: "tool",
      title: "Number Base Converter",
      summary: "Type a number in decimal, binary or hexadecimal and see it in the other two."
    },
    {
      id: "binary-basics",
      module: "sample",
      type: "lesson",
      title: "Counting in Binary",
      summary: "A short step-by-step lesson on place values, with bits you can flip yourself."
    },
    {
      id: "binary-quiz",
      module: "sample",
      type: "quiz",
      title: "Binary Check-up",
      summary: "Five quick questions with instant feedback. Nothing is saved."
    },
    {
      id: "cut-the-thrust",
      module: "flight",
      type: "tool",
      title: "Cut the Thrust: Clean vs Defective Aircraft",
      summary: "Add hangar defects, reduce the thrust, and see how the aircraft slows, descends or holds altitude, with live force arrows, gauges and energy. Switch to Helicopter to explore hover power, ground effect and rotor defects. Includes three training activities: Predict First, Mystery Aircraft and Fix & Verify."
    },
    {
      id: "aircraft-familiarisation",
      module: "flight",
      type: "lesson",
      title: "Aircraft Familiarisation Training",
      summary: "Three modules in order: aircraft parts, wing structure, and engine and tail. Each unlocks when the one before is complete."
    }
  ]
};
