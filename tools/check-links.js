#!/usr/bin/env node
/*
 * Checks the project before you publish it. Plain Node, no packages to install:
 *   node tools/check-links.js
 * It looks for:
 *   - href/src/meta-refresh links in every .html file that point at a file that does not exist
 *   - links that start with "/" (they break on a GitHub Pages project site) or point at a folder
 *   - any web address or network call in the code (the portal must make no external requests)
 *   - catalogue.js mistakes: unknown module, missing item folder, duplicate ids, wrong tracker ids
 * Exits with 1 if anything is wrong. This is a developer check only; the site does not need it to run.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const SKIP = new Set([".git", "node_modules", ".github", "tools"]);
let problems = 0;
const bad = (msg) => { problems++; console.log("PROBLEM  " + msg); };
const rel = (f) => path.relative(root, f);

function walk(dir, out) {
  fs.readdirSync(dir).forEach((name) => {
    if (SKIP.has(name)) return;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out); else out.push(p);
  });
  return out;
}
const files = walk(root, []);

files.filter((f) => f.endsWith(".html")).forEach((f) => {
  const html = fs.readFileSync(f, "utf8");
  const re = /(?:href|src)\s*=\s*"([^"]*)"|content="\d+;\s*url=([^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1] != null ? m[1] : m[2];
    if (!url || /^(data:|mailto:|javascript:|blob:|#)/.test(url)) continue;
    if (/^https?:/.test(url)) { bad(rel(f) + ": external link " + url); continue; }
    if (url.startsWith("/")) { bad(rel(f) + ": link starts with / " + url); continue; }
    const clean = url.split("#")[0].split("?")[0];
    if (!clean) continue;
    const target = path.resolve(path.dirname(f), clean);
    if (!fs.existsSync(target)) bad(rel(f) + ": missing file " + url);
    else if (fs.statSync(target).isDirectory()) bad(rel(f) + ": folder link, use .../index.html " + url);
  }
});

files.filter((f) => f.endsWith(".js")).forEach((f) => {
  const js = fs.readFileSync(f, "utf8");
  if (/\bfetch\s*\(|XMLHttpRequest|sendBeacon|importScripts|\bimport\s*\(/.test(js)) bad(rel(f) + ": network call or dynamic import");
  (js.match(/https?:\/\/[^\s"'`)]+/g) || []).filter((u) => !/w3\.org/.test(u)).forEach((u) => bad(rel(f) + ": web address " + u));
});

// catalogue.js
global.window = {};
require(path.join(root, "catalogue.js"));
const catalogue = global.window.CATALOGUE;
const modules = new Set(catalogue.modules.map((m) => m.id));
const seen = new Set();
catalogue.items.forEach((item) => {
  if (!modules.has(item.module)) bad("catalogue: item " + item.id + " has unknown module " + item.module);
  if (seen.has(item.id)) bad("catalogue: duplicate item id " + item.id);
  seen.add(item.id);
  const entry = path.join(root, "items", item.module, item.id, "index.html");
  if (!fs.existsSync(entry)) { bad("catalogue: missing " + rel(entry)); return; }
  const html = fs.readFileSync(entry, "utf8");
  const tag = html.match(/<script[^>]*tracker\.js[^>]*>/);
  if (tag) {
    const mod = (tag[0].match(/data-module="([^"]*)"/) || [])[1];
    const id = (tag[0].match(/data-item="([^"]*)"/) || [])[1];
    if (mod !== item.module || id !== item.id) bad("tracker ids in " + rel(entry) + " do not match catalogue (" + mod + "/" + id + ")");
  }
});

console.log(problems ? problems + " problem(s) found." : "OK: " + files.filter((f) => f.endsWith(".html")).length + " pages, " + catalogue.items.length + " items, no problems.");
process.exit(problems ? 1 : 0);
