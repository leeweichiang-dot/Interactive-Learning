/*
 * Glossary tooltips.
 *
 * The glossary (<details id="glossary"> in index.html) is the one place the
 * definitions live. This file reads it and turns the first use of each term, in
 * each section's fixed text, into a button with a short pop-up definition.
 *
 * The pop-up opens on hover, on keyboard focus, and on click or tap. Escape
 * closes it. It stays open while the pointer is over it, so it can be read.
 *
 * Other scripts can call Terms.markElement(element) to mark terms in text they
 * have just written. The competency check does not use tooltips, so they can
 * never give an answer away.
 */
(function () {
  "use strict";

  const glossary = document.getElementById("glossary");
  if (!glossary) return;

  /* ---------- Read the glossary ---------- */

  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  const terms = [];
  Array.prototype.forEach.call(glossary.querySelectorAll("dt"), function (dt) {
    const dd = dt.nextElementSibling;
    if (!dd) return;
    const words = (dt.getAttribute("data-aliases") || dt.textContent).split("|")
      .map(function (s) { return s.trim(); }).filter(Boolean)
      .sort(function (a, b) { return b.length - a.length; });
    terms.push({
      key: dt.id,
      name: dt.textContent.trim(),
      definition: dd.textContent.trim(),
      pattern: new RegExp("\\b(" + words.map(escapeRegExp).join("|") + ")\\b", "i")
    });
  });

  /* ---------- Marking terms in text ---------- */

  const SKIP = "button, a, label, legend, summary, svg, script, style, textarea, select, option, h1, h2, h3, h4, h5, h6, .term, [data-no-terms]";

  function mark(root, used) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        const p = n.parentElement;
        return n.nodeValue.trim() && p && !p.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      let current = node;
      for (;;) {
        let best = null;
        terms.forEach(function (t) {
          if (used.has(t.key)) return;
          const m = t.pattern.exec(current.nodeValue);
          if (m && (!best || m.index < best.match.index)) best = { term: t, match: m };
        });
        if (!best) return;
        const middle = current.splitText(best.match.index);
        const after = middle.splitText(best.match[0].length);
        // A focusable inline element rather than a <button>, so the text still wraps naturally
        const button = document.createElement("span");
        button.className = "term";
        button.setAttribute("role", "button");
        button.tabIndex = 0;
        button.dataset.term = best.term.key;
        button.setAttribute("aria-expanded", "false");
        button.textContent = middle.nodeValue;
        middle.parentNode.replaceChild(button, middle);
        used.add(best.term.key);
        current = after;
      }
    });
  }

  const EXCLUDE = ".picker, .controls, .g-card, .explain, .f-form, .f-reveal, .legend, .tools, .fault-note, .notice, [aria-live]";

  // Fixed text in each section: the first use of each term gets a tooltip.
  document.querySelectorAll(".step").forEach(function (section) {
    if (section.querySelector("#assess")) return;
    const used = new Set();
    section.querySelectorAll("p, li, td").forEach(function (el) {
      if (!el.closest(EXCLUDE)) mark(el, used);
    });
  });

  window.Terms = { markElement: function (el) { mark(el, new Set()); } };

  /* ---------- The pop-up ---------- */

  const tip = document.createElement("div");
  tip.id = "termTip";
  tip.className = "term-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  (document.querySelector("main") || document.body).appendChild(tip);   // inside the page landmark

  let owner = null, pinned = false, timer = 0;
  function termFor(button) { return terms.filter(function (t) { return t.key === button.dataset.term; })[0]; }

  function place(button) {
    const r = button.getBoundingClientRect();
    const w = tip.offsetWidth, h = tip.offsetHeight;
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const left = Math.max(8, Math.min(r.left, vw - w - 8));
    const top = r.bottom + 6 + h > vh && r.top - h - 6 > 0 ? r.top - h - 6 : r.bottom + 6;
    tip.style.left = (left + window.pageXOffset) + "px";
    tip.style.top = (top + window.pageYOffset) + "px";
  }

  function show(button) {
    clearTimeout(timer);
    if (owner && owner !== button) release(owner);
    const t = termFor(button);
    if (!t) return;
    tip.textContent = "";
    const name = document.createElement("strong");
    name.textContent = t.name + ": ";
    tip.appendChild(name);
    tip.appendChild(document.createTextNode(t.definition));
    tip.hidden = false;
    button.setAttribute("aria-describedby", "termTip");
    owner = button;
    place(button);
  }
  function release(button) {
    button.removeAttribute("aria-describedby");
    button.setAttribute("aria-expanded", "false");
  }
  function hide() {
    clearTimeout(timer);
    tip.hidden = true;
    pinned = false;
    if (owner) release(owner);
    owner = null;
  }
  function hideSoon() {
    clearTimeout(timer);
    timer = setTimeout(function () { if (!pinned) hide(); }, 150);
  }

  document.addEventListener("mouseover", function (e) {
    const b = e.target.closest && e.target.closest(".term");
    if (b) show(b);
  });
  document.addEventListener("mouseout", function (e) {
    const b = e.target.closest && e.target.closest(".term");
    if (b && !pinned) hideSoon();
  });
  document.addEventListener("focusin", function (e) {
    const b = e.target.closest && e.target.closest(".term");
    if (b) show(b);
    else if (!tip.contains(e.target) && !pinned) hide();
  });
  document.addEventListener("focusout", function (e) {
    const b = e.target.closest && e.target.closest(".term");
    if (b && !pinned) hideSoon();
  });
  tip.addEventListener("mouseenter", function () { clearTimeout(timer); });
  tip.addEventListener("mouseleave", function () { if (!pinned) hideSoon(); });
  document.addEventListener("click", function (e) {
    const b = e.target.closest && e.target.closest(".term");
    if (b) {
      if (owner === b && pinned) { hide(); return; }
      show(b);
      pinned = true;
      b.setAttribute("aria-expanded", "true");
    } else if (!tip.contains(e.target)) {
      hide();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !tip.hidden) hide();
    const b = e.target.closest && e.target.closest(".term");
    if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); b.click(); }   // like a button
  });
  window.addEventListener("resize", hide);
  window.addEventListener("scroll", function () { if (!tip.hidden && owner && !pinned) hide(); }, { passive: true });
})();
