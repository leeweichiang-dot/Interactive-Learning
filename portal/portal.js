/*
 * Renders the portal pages from window.CATALOGUE (see catalogue.js).
 * The page to render is chosen by <body data-page="home|module">.
 */
(function () {
  "use strict";

  // Display order and labels for each item type.
  const TYPES = [
    { id: "tool", label: "Tool", heading: "Tools" },
    { id: "lesson", label: "Lesson", heading: "Lessons" },
    { id: "quiz", label: "Quiz", heading: "Quizzes" }
  ];

  const catalogue = window.CATALOGUE || { modules: [], items: [] };
  const modules = catalogue.modules || [];
  const items = catalogue.items || [];

  checkCatalogue();

  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "module") renderModule();

  // Pages

  function renderHome() {
    const list = document.getElementById("modules");
    const shown = modules.filter(function (mod) { return !mod.hidden; });

    if (shown.length === 0) {
      list.replaceWith(notice("No modules yet."));
      return;
    }

    shown.forEach(function (mod) {
      const count = visibleItems(mod.id).length;
      const card = el("a", { className: "card", href: moduleHref(mod) }, [
        mod.code ? el("span", { className: "eyebrow", text: mod.code }) : null,
        el("h2", { className: "card-title", text: mod.title }),
        mod.description ? el("p", { className: "card-text", text: mod.description }) : null,
        el("span", { className: "card-meta", text: count === 1 ? "1 item" : count + " items" })
      ]);
      list.append(el("li", {}, [card]));
    });
  }

  function renderModule() {
    const id = new URLSearchParams(location.search).get("m");
    const mod = modules.find(function (m) { return m.id === id; });
    const content = document.getElementById("content");

    if (!mod) {
      document.title = "Module not found";
      content.append(
        el("h1", { text: "Module not found" }),
        el("p", { className: "lead", text: "This link doesn't match any module. It may have been renamed." })
      );
      return;
    }

    document.title = mod.title;
    content.append(
      mod.code ? el("p", { className: "eyebrow", text: mod.code }) : null,
      el("h1", { text: mod.title }),
      mod.description ? el("p", { className: "lead", text: mod.description }) : null
    );

    const modItems = visibleItems(mod.id);
    if (modItems.length === 0) {
      content.append(notice("Nothing here yet. Check back later."));
      return;
    }

    TYPES.forEach(function (type) {
      const ofType = modItems.filter(function (item) { return item.type === type.id; });
      if (ofType.length === 0) return;

      const list = el("ul", { className: "grid" });
      ofType.forEach(function (item) {
        list.append(el("li", {}, [
          el("a", { className: "card", href: itemHref(item) }, [
            el("span", { className: "badge", text: type.label }),
            el("h3", { className: "card-title", text: item.title }),
            item.summary ? el("p", { className: "card-text", text: item.summary }) : null
          ])
        ]));
      });

      content.append(el("section", {}, [el("h2", { text: type.heading }), list]));
    });
  }

  // Catalogue helpers

  function visibleItems(moduleId) {
    return items.filter(function (item) {
      return item.module === moduleId && !item.hidden && isKnownType(item.type);
    });
  }

  function isKnownType(typeId) {
    return TYPES.some(function (t) { return t.id === typeId; });
  }

  function moduleHref(mod) {
    return "module.html?m=" + encodeURIComponent(mod.id);
  }

  // index.html is spelled out because file:// URLs don't resolve folders to it.
  function itemHref(item) {
    return "items/" + encodeURIComponent(item.module) + "/" + encodeURIComponent(item.id) + "/index.html";
  }

  // Warns in the browser console about mistakes in catalogue.js.
  function checkCatalogue() {
    const moduleIds = new Set();
    modules.forEach(function (m) {
      if (moduleIds.has(m.id)) console.warn("catalogue.js: duplicate module id \"" + m.id + "\"");
      moduleIds.add(m.id);
    });

    const itemKeys = new Set();
    items.forEach(function (item) {
      const key = item.module + "/" + item.id;
      if (itemKeys.has(key)) console.warn("catalogue.js: duplicate item \"" + key + "\"");
      itemKeys.add(key);
      if (!moduleIds.has(item.module)) console.warn("catalogue.js: item \"" + item.id + "\" has unknown module \"" + item.module + "\"");
      if (!isKnownType(item.type)) console.warn("catalogue.js: item \"" + item.id + "\" has unknown type \"" + item.type + "\" and is not shown");
      if (!item.title) console.warn("catalogue.js: item \"" + item.id + "\" has no title");
    });
  }

  // DOM helpers (textContent only, so catalogue text is never parsed as HTML)

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props.className) node.className = props.className;
    if (props.href) node.href = props.href;
    if (props.text) node.textContent = props.text;
    (children || []).forEach(function (child) {
      if (child) node.append(child);
    });
    return node;
  }

  function notice(text) {
    return el("p", { className: "notice", text: text });
  }
})();
