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
 *   hidden       Optional. true keeps it off the home page; its module page
 *                and items still open by direct link.
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
      description: "Example items showing each kind of content. Copy one as the starting point for a new item.",
      hidden: true
    },
    {
      id: "flight",
      title: "Principles of Flight",
      description: "How lift, weight, thrust and drag work together, explained in plain English for maintenance trainees."
    },
    {
      id: "aircraft",
      title: "Aircraft Familiarisation",
      description: "Learn the main parts of a fighter jet, how its fuselage and wings are built, and its engine and empennage (tail), in plain English."
    },
    {
      id: "landing-gear",
      title: "Landing Gear Systems",
      description: "What the parts of the landing gear do, how hydraulics raise and lower it, and how to read the gear lights in the cockpit."
    },
    {
      id: "pitot-static",
      title: "Pitot-Static Flight Instruments",
      description: "How pitot and static air pressure produce the airspeed, altitude and climb-rate readings in a generic fighter-style cockpit, in plain English."
    },
    {
      id: "environmental-control",
      title: "Environmental Control Systems",
      description: "How the aircraft keeps the air in the cabin safe to breathe: pressurisation, air conditioning and the faults that can affect them, in plain English."
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
      summary: "Five quick questions with instant feedback."
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
      module: "aircraft",
      type: "lesson",
      title: "Aircraft Familiarisation Training",
      summary: "Three short modules on a fighter jet, in any order: aircraft parts, fuselage and wing structure, and engine and empennage."
    },
    {
      id: "landing-gear-systems",
      module: "landing-gear",
      type: "lesson",
      title: "Landing Gear Systems",
      summary: "Explore a labelled landing gear, watch hydraulic fluid raise and lower it, and practise reading the cockpit gear lights. Includes a short parts check."
    },
    {
      id: "pitot-static-instruments",
      module: "pitot-static",
      type: "lesson",
      title: "Pitot-Static Flight Instruments",
      summary: "Learn how pitot and static pressure move three cockpit instruments. Includes an interactive diagram, five guided flight scenarios, a fault investigation and a 12-question competency check."
    },
    {
      id: "cabin-pressurisation",
      module: "environmental-control",
      type: "lesson",
      title: "Cabin Pressurisation System",
      summary: "Follow the air through a labelled diagram, try a pressure simulation, investigate three faults and take a five-question competency check."
    }
  ]
};
