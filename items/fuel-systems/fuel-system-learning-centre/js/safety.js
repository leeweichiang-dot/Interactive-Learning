/* Page 8: Fuel System Safety. Six hazards, then scenario practice with feedback after every choice. */
(function () {
  "use strict";
  window.FL = window.FL || { inits: {} };

  var HAZARDS = [
    { id: "contamination", name: "Fuel contamination", icon: "🦠", short: "Dirt, slime or the wrong fuel",
      cause: "Dirty storage tanks or bowsers, rust and dirt from old tanks, the wrong fuel, or slime that grows where water sits in the fuel.",
      impact: "Blocked filters and pipes, damaged pumps and fuel control unit, and engine power loss or engine stop.",
      signs: ["Cloudy or hazy fuel in a sample", "Dark specks or slime", "Strange colour or smell", "Filter warnings or filters that block often"],
      prevent: ["Check and sample fuel before use", "Use clean, approved fuel sources only", "Keep caps and covers on", "Change filters on schedule and keep records"] },
    { id: "water", name: "Water contamination", icon: "💧", short: "Water in the fuel",
      cause: "Moist air turning to water inside part-empty tanks (condensation), rain getting past a bad cap seal, or wet fuel supplies.",
      impact: "Ice crystals can block filters in the cold, the engine can stop, tanks can corrode and slime can grow.",
      signs: ["A clear layer or droplets at the bottom of a fuel sample", "Cloudy fuel", "Cold weather after a wet period", "Damaged filler cap seals"],
      prevent: ["Drain the low points (sumps) as the manual says", "Check cap and door seals", "Test fuel supplies for water", "Keep tanks as full as allowed when parked"] },
    { id: "leaks", name: "Fuel leaks", icon: "💦", short: "Fuel escaping from the system",
      cause: "Worn seals or sealant, loose fittings, chafed or damaged pipes, vibration, or tanks that were overfilled.",
      impact: "Fire risk, lost fuel, a spill that harms the environment, and fuel starvation of the engine.",
      signs: ["Wet stains or drips", "A fuel smell", "Dye stains, such as a blue stain on aviation gasoline", "Fuel quantity falling faster than normal"],
      prevent: ["Walk around and look at every inspection", "Check seals, clamps and fittings", "Tighten to the right torque", "Report any leak at once, however small"] },
    { id: "static", name: "Static electricity", icon: "⚡", short: "An invisible spark risk",
      cause: "Fuel rubbing through hoses and filters builds up electric charge. Dry, windy weather and equipment that is not bonded make it worse.",
      impact: "A spark can ignite fuel vapour, causing a fire or explosion.",
      signs: ["Usually none: static cannot be seen, which is why the rules matter", "Hints: dry weather, fast flow, a missing or worn bonding lead"],
      prevent: ["Bond (earth) the aircraft and the fuel equipment first", "Use the correct earth points", "Start the flow slowly", "Follow the rules on phones and clothing"] },
    { id: "fire", name: "Fire risk", icon: "🔥", short: "Vapour plus a spark",
      cause: "Fuel vapour mixes with air and meets an ignition source: a spark, a hot surface, a phone, a cigarette or running equipment.",
      impact: "Serious injury or death, and loss of the aircraft and equipment.",
      signs: ["A strong fuel smell", "Puddles or wet areas", "Hot or running equipment near fuel", "Someone using an ignition source nearby"],
      prevent: ["No smoking or naked flames", "Keep a suitable extinguisher ready", "Use approved tools and equipment", "Clean up spills at once and ventilate"] },
    { id: "fod", name: "Foreign object damage (FOD)", icon: "🔩", short: "Tools and objects left behind",
      cause: "Tools, rags, fasteners, wire or packaging left in a tank, pipe or panel after work, or loose items on the ramp.",
      impact: "Blocked pumps, filters and valves, jammed floats or probes (which give false readings), and damaged engines.",
      signs: ["A tool or item that is missing after a job", "Debris in a filter", "Rattling inside a tank", "A filter that keeps blocking"],
      prevent: ["Tool control: count tools in and out", "Cover open pipes and ports", "Clean as you work", "Do a final look inside before you close up"] }
  ];


  /* ---- Pictures for the six hazards: original illustrations (they follow the light and dark theme).
   * To use a real photo instead, put it in images/ and set `image` and `credit` on the hazard. ---- */
  var BG = '<rect width="320" height="180" rx="12" fill="var(--sky-soft)"/>';
  function cap(t) { return '<text x="160" y="171" text-anchor="middle" style="font-size:13px;font-weight:700;fill:var(--ink)">' + t + '</text>'; }
  var JAR = '<rect x="104" y="14" width="112" height="16" rx="4" fill="var(--muted)"/><rect x="110" y="28" width="100" height="116" rx="14" fill="var(--card)" stroke="var(--ink)" stroke-width="4"/>';
  var PICTURES = {
    contamination: { alt: "A jar of cloudy fuel with dark specks and a strand of slime, seen through a magnifying glass",
      svg: BG + JAR + '<rect x="114" y="58" width="92" height="82" rx="10" fill="var(--fuel-soft)"/><rect x="114" y="58" width="92" height="82" rx="10" fill="#fff" opacity=".28"/>' +
        '<circle cx="140" cy="86" r="2.6" fill="#3a2a10"/><circle cx="165" cy="108" r="3.2" fill="#3a2a10"/><circle cx="188" cy="84" r="2.2" fill="#3a2a10"/><circle cx="150" cy="128" r="3" fill="#3a2a10"/><circle cx="178" cy="130" r="2.6" fill="#3a2a10"/><circle cx="127" cy="110" r="2.2" fill="#3a2a10"/>' +
        '<path d="M152 66 C146 84 164 96 152 120" stroke="#5b6b2a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<circle cx="256" cy="66" r="26" fill="var(--card)" fill-opacity=".85" stroke="var(--ink)" stroke-width="5"/><line x1="275" y1="85" x2="298" y2="110" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/><circle cx="252" cy="66" r="6" fill="#3a2a10"/><path d="M242 78 C248 70 262 74 268 62" stroke="#5b6b2a" stroke-width="4" fill="none" stroke-linecap="round"/>' + cap("Cloudy fuel, specks and slime") },
    water: { alt: "A jar of fuel with a layer of water at the bottom and a drain valve",
      svg: BG + JAR + '<rect x="114" y="58" width="92" height="44" rx="6" fill="var(--fuel-soft)"/><rect x="114" y="102" width="92" height="38" rx="10" fill="#5aaaf0"/>' +
        '<path d="M114 102 C130 96 146 108 162 102 C178 96 192 108 206 102" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>' +
        '<circle cx="136" cy="120" r="4" fill="#fff" opacity=".7"/><circle cx="170" cy="126" r="3" fill="#fff" opacity=".7"/><circle cx="188" cy="114" r="3.5" fill="#fff" opacity=".7"/>' +
        '<path d="M150 38 C146 46 144 50 150 54 C156 50 154 46 150 38Z" fill="#5aaaf0"/><path d="M174 42 C171 48 170 51 174 54 C178 51 177 48 174 42Z" fill="#5aaaf0"/>' +
        '<text x="226" y="96" style="font-size:12px;font-weight:700;fill:var(--ink)">fuel</text><text x="226" y="128" style="font-size:12px;font-weight:700;fill:#2b6cb0">water</text><path d="M222 100 L222 124" stroke="var(--muted)" stroke-width="2"/>' + cap("Water sinks to the bottom") },
    leaks: { alt: "A wing panel with a blue stain trail and drops of fuel falling onto the ground",
      svg: BG + '<rect y="146" width="320" height="34" fill="var(--line)"/><rect x="36" y="22" width="248" height="76" rx="8" fill="var(--card)" stroke="var(--muted)" stroke-width="3"/>' +
        '<rect x="104" y="36" width="112" height="46" rx="4" fill="none" stroke="var(--muted)" stroke-width="2.5" stroke-dasharray="6 4"/>' +
        '<circle cx="110" cy="42" r="3" fill="var(--muted)"/><circle cx="210" cy="42" r="3" fill="var(--muted)"/><circle cx="110" cy="76" r="3" fill="var(--muted)"/><circle cx="210" cy="76" r="3" fill="var(--muted)"/>' +
        '<path d="M160 82 C156 100 166 110 160 128" stroke="#4a8fd8" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>' +
        '<path d="M160 132 C155 140 154 144 160 148 C166 144 165 140 160 132Z" fill="#4a8fd8"/>' +
        '<ellipse cx="160" cy="156" rx="46" ry="8" fill="#4a8fd8" opacity=".55"/>' + cap("A stain trail points to the leak") },
    static: { alt: "A fuel truck connected to an aircraft by a hose and a green bonding wire, with a warning spark",
      svg: BG + '<rect y="150" width="320" height="30" fill="var(--line)"/><rect x="14" y="88" width="94" height="50" rx="10" fill="var(--card)" stroke="var(--muted)" stroke-width="3"/>' +
        '<circle cx="36" cy="142" r="10" fill="var(--ink)"/><circle cx="88" cy="142" r="10" fill="var(--ink)"/><rect x="26" y="98" width="70" height="16" rx="6" fill="var(--fuel-soft)"/>' +
        '<rect x="204" y="62" width="102" height="38" rx="8" fill="var(--card)" stroke="var(--muted)" stroke-width="3"/>' +
        '<path d="M108 108 C150 108 150 82 196 82" stroke="var(--ink)" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="194" y="75" width="16" height="14" rx="3" fill="var(--muted)"/>' +
        '<path d="M60 88 C70 24 230 18 256 62" stroke="var(--ok)" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="60" cy="88" r="6" fill="var(--ok)"/><circle cx="256" cy="62" r="6" fill="var(--ok)"/>' +
        '<text x="150" y="13" text-anchor="middle" style="font-size:12px;font-weight:700;fill:var(--ok)">bonding wire</text>' +
        '<polygon points="236,112 226,132 234,132 228,150 246,124 237,124 243,112" fill="var(--amber)" stroke="var(--bad)" stroke-width="2"/>' + cap("Bond first, or a spark can jump") },
    fire: { alt: "A flame above a spreading fuel puddle, with a fire extinguisher beside it",
      svg: BG + '<rect y="152" width="320" height="28" fill="var(--line)"/><ellipse cx="170" cy="154" rx="84" ry="10" fill="var(--fuel-soft)" stroke="var(--fuel)" stroke-width="2"/>' +
        '<path d="M170 22 C186 58 214 70 206 112 C200 142 140 142 134 112 C126 80 158 68 170 22Z" fill="var(--bad)"/>' +
        '<path d="M170 58 C180 80 198 88 192 114 C188 132 152 132 148 114 C142 94 164 86 170 58Z" fill="var(--amber)"/>' +
        '<path d="M170 92 C176 104 184 108 180 120 C177 128 163 128 160 120 C157 110 167 106 170 92Z" fill="#ffe38a"/>' +
        '<rect x="36" y="84" width="30" height="66" rx="10" fill="var(--bad)"/><rect x="44" y="74" width="14" height="12" rx="3" fill="var(--ink)"/><path d="M58 78 C78 70 88 80 96 92" stroke="var(--ink)" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="40" y="108" width="22" height="16" rx="3" fill="#fff" opacity=".85"/>' + cap("Fuel vapour + a spark = fire") },
    fod: { alt: "An open access panel with a wrench, a bolt and a rag left inside",
      svg: BG + '<rect x="40" y="26" width="240" height="116" rx="12" fill="var(--card)" stroke="var(--muted)" stroke-width="4"/><rect x="54" y="40" width="212" height="88" rx="8" fill="#0d1b2e"/>' +
        '<line x1="100" y1="40" x2="100" y2="128" stroke="#25384f" stroke-width="3"/><line x1="160" y1="40" x2="160" y2="128" stroke="#25384f" stroke-width="3"/><line x1="220" y1="40" x2="220" y2="128" stroke="#25384f" stroke-width="3"/>' +
        '<g transform="rotate(-22 130 88)"><rect x="84" y="82" width="94" height="13" rx="6" fill="#b9c6d6"/><circle cx="84" cy="88" r="15" fill="#b9c6d6"/><rect x="68" y="84" width="16" height="8" fill="#0d1b2e"/></g>' +
        '<polygon points="208,96 218,90 230,96 230,108 218,114 208,108" fill="#b9c6d6"/><circle cx="219" cy="102" r="4" fill="#0d1b2e"/>' +
        '<path d="M170 112 C180 100 196 116 206 108 C210 122 190 128 174 124 C168 122 166 116 170 112Z" fill="var(--amber)"/>' +
        '<circle cx="262" cy="36" r="15" fill="var(--bad)" stroke="var(--card)" stroke-width="3"/><text x="262" y="42" text-anchor="middle" style="font-size:18px;font-weight:800;fill:#fff">!</text>' + cap("Left behind in a tank = danger") }
  };

  // The picture for a hazard: a photo if one is set, otherwise the illustration.
  function hazardPicture(h) {
    var fig = document.createElement("figure");
    fig.className = "hz-figure";
    var p = PICTURES[h.id];
    if (h.image) {
      var img = document.createElement("img");
      img.src = h.image;
      img.alt = p.alt;
      fig.appendChild(img);
      var credit = document.createElement("figcaption");
      credit.textContent = h.credit || "";
      fig.appendChild(credit);
    } else {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 320 180");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Illustration: " + p.alt);
      svg.innerHTML = p.svg;
      fig.appendChild(svg);
    }
    return fig;
  }

  // kind: "best" ends the decision, "partial" and "bad" let the learner try again.
  var SCENARIOS = [
    { id: "contamination", hazard: "Fuel contamination", title: "Cloudy fuel sample",
      intro: "A routine fuel sample looks cloudy and has dark specks.",
      story: "At the start of the shift you take a sample from the aircraft tank. The fuel looks hazy, with dark specks floating in it. The crew also reported a filter warning on the last flight.",
      takeaway: "Contaminated fuel must never reach an engine. Stop, report, find the source and clean the system.",
      steps: [
        { q: "What do you do first?", o: [
          { t: "Stop, tag the aircraft as not ready, and report it", k: "best", f: "Correct. Contaminated fuel can stop an engine, so the aircraft must not be released until it is checked." },
          { t: "Pour the sample back into the tank to save fuel", k: "bad", f: "Unsafe. Never return a bad sample to the tank. It puts the contamination straight back." },
          { t: "Top up with fresh fuel to dilute it", k: "bad", f: "No. Dilution does not remove dirt or slime, and it hides the problem." },
          { t: "Release the aircraft. The filter will catch it", k: "bad", f: "Unsafe. A filter is the last defence, not a cure. It can block and starve the engine." }
        ] },
        { q: "What is the best next step?", o: [
          { t: "Test the fuel source, then drain and clean the system and replace the filters as the manual says", k: "best", f: "Correct. Find where it came from, remove it, and prove the fuel is clean before flight." },
          { t: "Replace the filter only", k: "partial", f: "Partly right. A new filter does not remove contamination from the tank or find the source." },
          { t: "Run the engine to burn it off", k: "bad", f: "Unsafe. Dirty fuel can damage the pumps and the engine." }
        ] }
      ] },
    { id: "water", hazard: "Water contamination", title: "Water at the bottom of the sample",
      intro: "A cold morning, and the fuel sample shows a clear layer at the bottom.",
      story: "Overnight the temperature fell below freezing after a wet week. At the morning check you drain a sample. A clear bubble of liquid sits at the bottom of the jar under the fuel.",
      takeaway: "Water sinks below fuel. Drain it, find out how it got in, and re-test before flight.",
      steps: [
        { q: "What does the clear layer at the bottom mean?", o: [
          { t: "Free water has collected in the tank. It must be drained and checked", k: "best", f: "Correct. Water is heavier than fuel, so it sinks to the lowest point." },
          { t: "That is normal fuel. Nothing to do", k: "bad", f: "No. Fuel does not separate into layers. A clear layer is water." },
          { t: "It is just condensation, so ignore it", k: "bad", f: "No. Even condensation water can freeze and block filters, so it must be drained." }
        ] },
        { q: "What do you do about it?", o: [
          { t: "Drain at the sump drain valve until the sample is clear, find the source, re-test and record it", k: "best", f: "Correct. Remove it, find the cause (for example a bad cap seal) and prove the fuel is clean." },
          { t: "Drain once and sign it off", k: "partial", f: "Partly right. You must re-test to prove it is all gone, and find out how it got in." },
          { t: "Put more fuel on top so the water is diluted", k: "bad", f: "No. Water does not mix in. It stays at the bottom and can still freeze." }
        ] }
      ] },
    { id: "leaks", hazard: "Fuel leaks", title: "Blue stain around a fuel panel",
      intro: "You discover a blue stain around a fuel panel on the wing.",
      story: "On the walk-around you find a blue stain around a fuel access panel on the wing. It is damp and smells of fuel. (Some fuels, such as aviation gasoline, are dyed blue, so a blue stain is a clue that it is fuel.)",
      takeaway: "Treat every fuel stain as a leak until proven otherwise: make safe, trace it to its source, and report it.",
      steps: [
        { q: "What do you do first?", o: [
          { t: "Keep ignition sources away, stop work nearby and report the leak", k: "best", f: "Correct. Make the area safe first, then report so the right people can act." },
          { t: "Wipe the stain off and see if it comes back later", k: "bad", f: "Unsafe. Hiding it does not fix it, and you lose the clues about where it came from." },
          { t: "Switch on aircraft power to run a fuel pump test", k: "bad", f: "Unsafe. Power and pumps near a leak add ignition and pressure risks." },
          { t: "Take a photo and carry on with other jobs", k: "partial", f: "Partly right. A photo helps, but the area must be made safe and the leak reported first." }
        ] },
        { q: "How do you find the cause?", o: [
          { t: "Open the panel and trace the stain back to where it starts, then note the leak size", k: "best", f: "Correct. Follow the trail to its source, then record what you find." },
          { t: "Guess it is the sealant and reseal it without checking", k: "partial", f: "Partly right. It may be the sealant, but you must confirm the real cause first." },
          { t: "Pressurise the system to see where it sprays", k: "bad", f: "Unsafe. Never pressurise a known leak to find it." }
        ] }
      ] },
    { id: "static", hazard: "Static electricity", title: "Refuelling on a dry, windy day",
      intro: "You are about to refuel. The air is dry and windy.",
      story: "The bowser is parked next to the aircraft. The operator hands you the hose. Neither the aircraft nor the bowser is connected to anything yet.",
      takeaway: "Static is invisible. Bond first, flow slowly, and keep ignition sources away.",
      steps: [
        { q: "What do you do before connecting the hose?", o: [
          { t: "Connect the bonding wire between the bowser and the aircraft first", k: "best", f: "Correct. Bonding makes them the same electric level so no spark can jump." },
          { t: "Start the flow and bond afterwards", k: "bad", f: "Unsafe. Static builds up as soon as fuel flows." },
          { t: "Skip bonding because the nozzle is metal", k: "bad", f: "No. A metal nozzle does not replace bonding." },
          { t: "Touch the aircraft to discharge yourself and carry on", k: "partial", f: "Partly right for you, but the bowser and aircraft still need to be bonded." }
        ] },
        { q: "A colleague stands near the fuel coupling holding a phone. What do you do?", o: [
          { t: "Ask them to move away with the phone, and carry on only when it is safe", k: "best", f: "Correct. Phones are not allowed near fuel work." },
          { t: "Ignore it. It is only a phone", k: "bad", f: "Unsafe. A phone can spark and a small spark is enough to ignite vapour." },
          { t: "Tell them after refuelling is finished", k: "partial", f: "Too late. Speak up at once, before the danger passes." }
        ] }
      ] },
    { id: "fire", hazard: "Fire risk", title: "Fuel puddle during refuelling",
      intro: "You smell strong fuel and a puddle starts to spread.",
      story: "While refuelling you notice a puddle spreading under the hose connection. A ground-power unit is running a few metres away.",
      takeaway: "Stop the flow, remove ignition sources, raise the alarm, and only fight a fire if you are trained and it is safe.",
      steps: [
        { q: "What is your first action?", o: [
          { t: "Stop the fuel flow, keep ignition sources away and raise the alarm", k: "best", f: "Correct. Stopping the flow and ignition sources stops the fire before it starts." },
          { t: "Walk away without stopping the flow", k: "bad", f: "Unsafe. The puddle keeps growing." },
          { t: "Cover the puddle with a rag", k: "bad", f: "No. A rag does not stop the leak and the fuel stays flammable." },
          { t: "Shout to switch off the equipment but leave the flow running", k: "partial", f: "Partly right. Good to remove the ignition source, but stop the fuel flow too." }
        ] },
        { q: "A small flame starts at the edge of the puddle. What do you do?", o: [
          { t: "Raise the alarm. Use the correct extinguisher only if trained and safe, otherwise move away", k: "best", f: "Correct. Your safety comes first. Only fight a fire if trained and it is safe." },
          { t: "Throw water on it", k: "bad", f: "Unsafe. Water can spread burning fuel." },
          { t: "Wait to see if it goes out", k: "bad", f: "Unsafe. A fuel fire grows fast." }
        ] }
      ] },
    { id: "fod", hazard: "Foreign object damage", title: "A missing socket",
      intro: "A socket is missing from your tool tray after working in a tank area.",
      story: "You have just finished work at a fuel tank access panel. You are about to close it when you notice a socket is missing from your tool tray.",
      takeaway: "A missing item is a safety event. Stop, search, and do not close up until it is found.",
      steps: [
        { q: "What do you do?", o: [
          { t: "Do not close the panel. Tell your supervisor and search until it is found", k: "best", f: "Correct. A tool left in a tank could block a pump or jam a valve." },
          { t: "Close up. It probably fell on the floor", k: "bad", f: "Unsafe. \"Probably\" is not good enough. You must be sure." },
          { t: "Close the panel and look for it after the job", k: "partial", f: "Too late. You must find it before the tank is closed." }
        ] },
        { q: "How do you stop this happening again?", o: [
          { t: "Count tools in and out, cover open pipes, clean as you work and check inside before closing", k: "best", f: "Correct. A good habit of tool control and a final check prevent FOD." },
          { t: "Just try to be more careful", k: "partial", f: "Partly right. Good habits need a system: counting, covering and checking." },
          { t: "Skip the final check to save time", k: "bad", f: "Unsafe. The final check is the last chance to catch a lost item." }
        ] }
      ] }
  ];

  FL.safetyScenarios = SCENARIOS.map(function (s) { return { id: s.id, title: s.title }; });
  function hazardFor(id) { return HAZARDS.filter(function (h) { return h.id === id; })[0]; }

  var TOTAL_STEPS = SCENARIOS.reduce(function (n, s) { return n + s.steps.length; }, 0);

  FL.inits.hazards = function () {
    var list = document.getElementById("hz-list");
    var pick = document.getElementById("hz-pick");
    var play = document.getElementById("hz-play");
    var firstTry = {};   // first choice for each decision, reported once to the portal tracker

    function el(tag, cls, text) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      return e;
    }

    function block(cls, title, content) {
      var b = el("div", "hz-block " + cls);
      b.appendChild(el("h4", null, title));
      if (Array.isArray(content)) {
        var ul = el("ul");
        content.forEach(function (x) { ul.appendChild(el("li", null, x)); });
        b.appendChild(ul);
      } else b.appendChild(el("p", null, content));
      return b;
    }

    /* Part 1: the six hazards */
    HAZARDS.forEach(function (h, i) {
      var art = el("article", "lesson-card");
      var head = el("button", "lc-head");
      head.setAttribute("aria-expanded", "false");
      head.appendChild(el("span", "lc-num", String(i + 1)));
      head.appendChild(el("span", "ico", h.icon));
      var t = el("span", "lc-title");
      t.appendChild(el("b", null, h.name));
      t.appendChild(el("small", null, h.short));
      head.appendChild(t);
      head.appendChild(el("span", "lc-state", "▾"));
      var body = el("div", "lc-body");
      body.hidden = true;
      body.appendChild(hazardPicture(h));
      var grid = el("div", "hz-blocks");
      grid.appendChild(block("cause", "Cause", h.cause));
      grid.appendChild(block("impact", "Impact", h.impact));
      grid.appendChild(block("signs", "Warning signs", h.signs));
      grid.appendChild(block("prevent", "Prevention", h.prevent));
      body.appendChild(grid);
      head.addEventListener("click", function () {
        var open = head.getAttribute("aria-expanded") !== "true";
        head.setAttribute("aria-expanded", String(open));
        body.hidden = !open;
      });
      art.appendChild(head);
      art.appendChild(body);
      list.appendChild(art);
    });

    /* Part 2: scenarios */
    function best() { return FL.store.get().safety || {}; }

    function refreshCount() {
      var done = SCENARIOS.filter(function (s) { return best()[s.id] != null; }).length;
      document.getElementById("hz-bar").style.width = (done / SCENARIOS.length * 100) + "%";
      document.getElementById("hz-count").textContent = done + " of " + SCENARIOS.length;
    }

    function reportAll() {
      var ids = Object.keys(firstTry);
      if (ids.length < TOTAL_STEPS || !window.Tracker) return;
      var answers = ids.map(function (k) { return firstTry[k]; });
      Tracker.quizResult(answers.filter(function (a) { return a.correct; }).length, answers.length, answers);
    }

    function menu() {
      pick.hidden = false;
      play.hidden = true;
      pick.textContent = "";
      var scores = best();
      SCENARIOS.forEach(function (s, i) {
        var c = el("div", "card");
        c.appendChild(hazardPicture(hazardFor(s.id)));
        c.appendChild(el("span", "chip", s.hazard));
        c.appendChild(el("h3", null, (i + 1) + ". " + s.title));
        c.appendChild(el("p", null, s.intro));
        c.appendChild(el("p", "chip", scores[s.id] != null ? "Best score: " + scores[s.id] + "%" : "Not tried yet"));
        var b = el("button", "btn", scores[s.id] != null ? "Play again" : "Start");
        b.style.display = "block";
        b.style.marginTop = ".6rem";
        b.addEventListener("click", function () { run(s); });
        c.appendChild(b);
        pick.appendChild(c);
      });
      refreshCount();
    }

    function run(s) {
      pick.hidden = true;
      play.hidden = false;
      var n = 0, rightFirst = 0;
      step();

      function step() {
        var st = s.steps[n];
        var tries = 0;
        play.textContent = "";
        var panel = el("div", "panel");
        var pic = hazardPicture(hazardFor(s.id));
        pic.classList.add("hz-small");
        panel.appendChild(pic);
        panel.appendChild(el("span", "chip", s.hazard));
        panel.appendChild(el("h3", null, s.title));
        panel.appendChild(el("p", null, s.story));
        panel.appendChild(el("p", "qprog", "Decision " + (n + 1) + " of " + s.steps.length));
        panel.appendChild(el("h4", null, st.q));
        var opts = el("div", "choice-list");
        var fb = el("div", "feedback");
        fb.hidden = true;
        fb.setAttribute("role", "status");
        var next = el("button", "btn", n === s.steps.length - 1 ? "Finish" : "Next decision →");
        next.hidden = true;

        st.o.forEach(function (o) {
          var b = el("button", "choice", o.t);
          b.addEventListener("click", function () {
            tries++;
            var key = s.id + ":" + n;
            if (firstTry[key] == null) {
              firstTry[key] = { q: "Safety scenario · " + s.title + " · decision " + (n + 1) + ": " + st.q, topic: s.hazard, correct: o.k === "best" };
              reportAll();
            }
            b.disabled = true;
            b.classList.add(o.k === "best" ? "correct" : "incorrect");
            fb.hidden = false;
            fb.className = "feedback " + (o.k === "best" ? "good" : "bad");
            fb.textContent = (o.k === "best" ? "Best choice. " : "") + o.f + (o.k === "best" ? "" : " Try another action.");
            if (o.k === "best") {
              if (tries === 1) rightFirst++;
              opts.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
              next.hidden = false;
              next.focus();
            }
          });
          opts.appendChild(b);
        });
        next.addEventListener("click", function () { n++; if (n < s.steps.length) step(); else finish(); });
        panel.appendChild(opts);
        panel.appendChild(fb);
        panel.appendChild(next);
        play.appendChild(panel);
      }

      function finish() {
        var pct = Math.round(rightFirst / s.steps.length * 100);
        FL.store.setSafety(s.id, pct);
        play.textContent = "";
        var panel = el("div", "panel");
        panel.appendChild(el("h3", null, "Scenario complete: " + s.title));
        panel.appendChild(el("p", null, "You chose the best action first time on " + rightFirst + " of " + s.steps.length + " decisions (" + pct + "%)."));
        panel.appendChild(el("p", "maint", "Key point: " + s.takeaway));
        var row = el("div", "row");
        var again = el("button", "btn alt", "Play again");
        again.addEventListener("click", function () { run(s); });
        var back = el("button", "btn", "Choose another scenario");
        back.addEventListener("click", menu);
        row.appendChild(again); row.appendChild(back);
        panel.appendChild(row);
        play.appendChild(panel);
        if (FL.refreshProgress) FL.refreshProgress();
      }
    }

    menu();
    return { show: refreshCount };
  };
})();
